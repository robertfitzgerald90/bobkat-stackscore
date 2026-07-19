import type { Prisma, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { ROADMAP_PHASE_STATUS_LABELS } from "@/lib/client-roadmap/labels";
import { computeRoadmapProgressMetrics } from "@/lib/client-roadmap/metrics";
import { computeLifecycleBudget } from "./budget";
import { LIFECYCLE_HEALTH_LABELS, scoreToBusinessRisk, scoreToHealthBand, trendLabel } from "./health";
import {
  inferServiceKeyFromName,
  linkManagedServicesToObjectives,
} from "./managed-services";
import { evaluatePostPhaseOpportunities } from "./opportunity";
import { buildRefreshEvents } from "./refresh";
import type {
  LifecycleInitiativeEffectiveness,
  LifecycleTrendPoint,
  TechnologyLifecycleDashboard,
} from "./types";

function decimalToNumber(value: { toNumber?: () => number } | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
}

function roundScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return Math.round(numeric);
}

function pillarScore(
  history: {
    securityScore: unknown;
    infrastructureScore: unknown;
    documentationScore: unknown;
    strategicScore: unknown;
    bcdrScore: unknown;
    backupScore: unknown;
  } | null,
  field: keyof NonNullable<typeof history>,
): number | null {
  if (!history) return null;
  return roundScore(history[field]);
}

export async function getTechnologyLifecycleDashboard(
  clientId: string,
  role: UserRole,
): Promise<TechnologyLifecycleDashboard | null> {
  void role;
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      companyName: true,
      quarterlyReviewAnchorAt: true,
      technologyProfile: true,
      scoreHistory: {
        orderBy: { recordedDate: "asc" },
        take: 24,
      },
      clientTechnologies: {
        where: { isActive: true },
        include: {
          technology: {
            select: {
              name: true,
              category: { select: { name: true } },
            },
          },
        },
      },
      recurringServices: {
        where: { status: { in: ["active", "pending_activation"] } },
        select: {
          serviceName: true,
          unitPriceCents: true,
          quantity: true,
          billingFrequency: true,
          status: true,
        },
      },
      subscriptions: {
        where: { status: { in: ["active", "trialing", "past_due"] } },
        select: { serviceType: true, status: true },
      },
      lifecycleOpportunities: {
        where: { status: { in: ["open", "accepted"] } },
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        take: 12,
      },
      quarterlyBusinessReviews: {
        orderBy: { reviewPeriodEnd: "desc" },
        take: 1,
        select: { reviewPeriodEnd: true, generatedAt: true },
      },
    },
  });

  if (!client) return null;

  const roadmap = await prisma.clientRoadmap.findFirst({
    where: { clientId, status: { in: ["active", "draft"] } },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      phases: {
        orderBy: { sortOrder: "asc" },
        include: {
          initiatives: {
            orderBy: { sortOrder: "asc" },
            include: {
              recommendation: {
                select: {
                  status: true,
                  completedAt: true,
                  businessImpact: true,
                  estimatedImpactPoints: true,
                  category: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  const profile = client.technologyProfile;
  const history = client.scoreHistory;
  const latestHistory = history.at(-1) ?? null;
  const previousHistory = history.length > 1 ? history.at(-2) ?? null : null;

  const currentStackScore = roundScore(profile?.overallStackScore) ?? roundScore(latestHistory?.overallScore);
  const previousStackScore = roundScore(previousHistory?.overallScore);
  const scoreDelta =
    currentStackScore !== null && previousStackScore !== null
      ? currentStackScore - previousStackScore
      : null;

  const phases = roadmap?.phases ?? [];
  const initiativeInputs = phases.flatMap((phase) =>
    phase.initiatives.map((initiative) => ({
      id: initiative.recommendationId,
      title: initiative.title,
      description: "",
      businessImpact: initiative.recommendation.businessImpact,
      suggestedService: null,
      priority: "medium" as const,
      estimatedImpactPoints: initiative.estimatedImpactPoints,
      categoryName: initiative.recommendation.category.name,
      status: initiative.recommendation.status,
    })),
  );

  const metrics = computeRoadmapProgressMetrics(
    phases.map((phase) => ({
      status: phase.status,
      oneTimeInvestment: decimalToNumber(phase.oneTimeInvestment),
      monthlyRecurringInvestment: decimalToNumber(phase.monthlyRecurringInvestment),
      name: phase.name,
      sortOrder: phase.sortOrder,
    })),
    initiativeInputs,
  );

  const targetStackScore = roadmap?.projectedFinalScore ?? null;

  const activeMonthlyFromBilling = client.recurringServices.reduce((sum, service) => {
    const qty = decimalToNumber(service.quantity);
    const monthly =
      service.billingFrequency === "monthly"
        ? (service.unitPriceCents / 100) * qty
        : service.billingFrequency === "annual"
          ? ((service.unitPriceCents / 100) * qty) / 12
          : service.billingFrequency === "quarterly"
            ? ((service.unitPriceCents / 100) * qty) / 3
            : (service.unitPriceCents / 100) * qty;
    return sum + monthly;
  }, 0);

  const budget = computeLifecycleBudget(
    phases.map((phase) => ({
      status: phase.status,
      oneTimeInvestment: decimalToNumber(phase.oneTimeInvestment),
      monthlyRecurringInvestment: decimalToNumber(phase.monthlyRecurringInvestment),
      annualRecurringInvestment: decimalToNumber(phase.annualRecurringInvestment),
    })),
    client.clientTechnologies.map((tech) => ({
      budgetAmountCents: tech.budgetAmountCents,
      budgetPeriod: tech.budgetPeriod,
      plannedReplacementDate: tech.plannedReplacementDate,
    })),
    activeMonthlyFromBilling,
  );

  const refreshEvents = buildRefreshEvents(
    client.clientTechnologies.map((tech) => ({
      id: tech.id,
      displayName: tech.displayName,
      technologyName: tech.technology.name,
      categoryName: tech.technology.category.name,
      lifecycleStatus: tech.lifecycleStatus,
      warrantyExpiresAt: tech.warrantyExpiresAt,
      licenseRenewalDate: tech.licenseRenewalDate,
      renewalDate: tech.renewalDate,
      plannedReplacementDate: tech.plannedReplacementDate,
    })),
  );

  const initiativeEffectiveness: LifecycleInitiativeEffectiveness[] = phases.flatMap((phase) =>
    phase.initiatives.map((initiative) => ({
      initiativeId: initiative.id,
      title: initiative.title,
      completionDate: initiative.recommendation.completedAt?.toISOString() ?? null,
      estimatedCost:
        initiative.estimatedOneTimeCost != null
          ? decimalToNumber(initiative.estimatedOneTimeCost)
          : null,
      actualCost:
        initiative.actualOneTimeCost != null
          ? decimalToNumber(initiative.actualOneTimeCost)
          : null,
      estimatedScoreIncrease: initiative.estimatedImpactPoints,
      actualScoreIncrease: initiative.actualScoreIncrease,
      businessValue:
        initiative.businessValueNotes ??
        initiative.businessOutcomeDescription ??
        initiative.recommendation.businessImpact,
      status: initiative.recommendation.status,
    })),
  );

  const objectives = [
    ...phases.map((phase) => phase.name),
    ...initiativeInputs.map((item) => item.title),
  ];
  const activeServiceKeys = new Set<string>();
  for (const service of client.recurringServices) {
    const key = inferServiceKeyFromName(service.serviceName);
    if (key) activeServiceKeys.add(key);
  }
  for (const subscription of client.subscriptions) {
    const key = inferServiceKeyFromName(subscription.serviceType);
    if (key) activeServiceKeys.add(key);
  }
  if (client.quarterlyBusinessReviews.length > 0) {
    activeServiceKeys.add("quarterly_reviews");
  }
  activeServiceKeys.add("technology_assessments");

  const managedServices = linkManagedServicesToObjectives(objectives, activeServiceKeys);

  const scoreTrends: LifecycleTrendPoint[] = history.map((row) => ({
    date: row.recordedDate.toISOString(),
    overallScore: roundScore(row.overallScore) ?? 0,
    securityScore: roundScore(row.securityScore),
    infrastructureScore: roundScore(row.infrastructureScore),
    backupScore: roundScore(row.backupScore),
    documentationScore: roundScore(row.documentationScore),
    businessContinuityScore: roundScore(row.bcdrScore),
    strategicScore: roundScore(row.strategicScore),
  }));

  const securityMaturity = pillarScore(latestHistory, "securityScore");
  const infrastructureMaturity = pillarScore(latestHistory, "infrastructureScore");
  const operationalMaturity =
    pillarScore(latestHistory, "documentationScore") ??
    pillarScore(latestHistory, "strategicScore");

  const technologyHealth = scoreToHealthBand(currentStackScore);
  const businessRisk = scoreToBusinessRisk(currentStackScore);

  const currentPhase =
    phases.find(
      (phase) =>
        !["completed", "deferred", "cancelled"].includes(phase.status),
    ) ?? null;
  const upcomingPhase =
    phases.find(
      (phase) =>
        phase.status === "planned" &&
        (!currentPhase || phase.sortOrder > currentPhase.sortOrder),
    ) ?? null;

  const lastReviewDate =
    client.quarterlyBusinessReviews[0]?.generatedAt?.toISOString() ??
    client.quarterlyBusinessReviews[0]?.reviewPeriodEnd?.toISOString() ??
    profile?.lastAssessedAt?.toISOString() ??
    null;

  const nextReviewDate =
    profile?.nextRecommendedAssessmentAt?.toISOString() ??
    client.quarterlyReviewAnchorAt?.toISOString() ??
    null;

  return {
    clientId: client.id,
    clientName: client.companyName,
    currentStackScore,
    previousStackScore,
    targetStackScore,
    scoreDelta,
    roadmapCompletionPercent: metrics.completionPercent,
    technologyHealth,
    technologyHealthLabel: LIFECYCLE_HEALTH_LABELS[technologyHealth],
    businessRisk,
    businessRiskLabel: LIFECYCLE_HEALTH_LABELS[businessRisk],
    securityMaturity,
    infrastructureMaturity,
    operationalMaturity,
    lastReviewDate,
    nextReviewDate,
    overallTechnologyTrend: profile?.trendDirection ?? null,
    trendLabel: trendLabel(profile?.trendDirection, scoreDelta),
    pillars: [
      { key: "security", label: "Security Maturity", score: securityMaturity },
      {
        key: "infrastructure",
        label: "Infrastructure Maturity",
        score: infrastructureMaturity,
      },
      { key: "operations", label: "Operational Maturity", score: operationalMaturity },
      {
        key: "backup",
        label: "Backup Maturity",
        score: pillarScore(latestHistory, "backupScore"),
      },
      {
        key: "continuity",
        label: "Business Continuity",
        score: pillarScore(latestHistory, "bcdrScore"),
      },
      {
        key: "documentation",
        label: "Documentation",
        score: pillarScore(latestHistory, "documentationScore"),
      },
    ],
    scoreTrends,
    budget,
    refreshEvents,
    initiativeEffectiveness,
    managedServices,
    opportunities: client.lifecycleOpportunities.map((item) => ({
      id: item.id,
      source: item.source,
      status: item.status,
      title: item.title,
      description: item.description,
      priority: item.priority,
      estimatedImpactPoints: item.estimatedImpactPoints,
      estimatedOneTimeInvestment: decimalToNumber(item.estimatedOneTimeInvestment),
      relatedServiceKey: item.relatedServiceKey,
      createdAt: item.createdAt.toISOString(),
    })),
    currentPhaseName: currentPhase?.name ?? null,
    upcomingPhaseName: upcomingPhase?.name ?? null,
    phases: phases.map((phase) => ({
      id: phase.id,
      name: phase.name,
      subtitle: phase.subtitle,
      status: phase.status,
      statusLabel: ROADMAP_PHASE_STATUS_LABELS[phase.status],
      oneTimeInvestment: decimalToNumber(phase.oneTimeInvestment),
      monthlyRecurringInvestment: decimalToNumber(phase.monthlyRecurringInvestment),
    })),
    completedProjectsCount: initiativeInputs.filter((item) => item.status === "completed").length,
    upcomingProjectsCount: initiativeInputs.filter((item) =>
      ["open", "accepted", "in_progress"].includes(item.status),
    ).length,
    openOpportunityCount: client.lifecycleOpportunities.filter((item) => item.status === "open")
      .length,
  };
}

export async function evaluateAndPersistPhaseOpportunities(input: {
  clientId: string;
  roadmapId: string;
  phaseId: string;
  phaseName: string;
}) {
  const [openRecommendations, roadmapInitiativeIds, technologies] = await Promise.all([
    prisma.assessmentRecommendation.findMany({
      where: {
        clientId: input.clientId,
        status: { in: ["open", "accepted"] },
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        estimatedImpactPoints: true,
      },
    }),
    prisma.clientRoadmapInitiative.findMany({
      where: { phase: { roadmapId: input.roadmapId } },
      select: { recommendationId: true },
    }),
    prisma.clientTechnology.findMany({
      where: { clientId: input.clientId, isActive: true },
      include: {
        technology: {
          select: { name: true, category: { select: { name: true } } },
        },
      },
    }),
  ]);

  const onRoadmap = new Set(roadmapInitiativeIds.map((item) => item.recommendationId));
  const refreshEvents = buildRefreshEvents(
    technologies.map((tech) => ({
      id: tech.id,
      displayName: tech.displayName,
      technologyName: tech.technology.name,
      categoryName: tech.technology.category.name,
      lifecycleStatus: tech.lifecycleStatus,
      warrantyExpiresAt: tech.warrantyExpiresAt,
      licenseRenewalDate: tech.licenseRenewalDate,
      renewalDate: tech.renewalDate,
      plannedReplacementDate: tech.plannedReplacementDate,
    })),
  );

  const candidates = evaluatePostPhaseOpportunities({
    completedPhaseName: input.phaseName,
    openRecommendations: openRecommendations.map((item) => ({
      ...item,
      alreadyOnRoadmap: onRoadmap.has(item.id),
    })),
    refreshEvents,
    criticalOpenCount: openRecommendations.filter((item) => item.priority === "critical").length,
  });

  if (candidates.length === 0) return [];

  const existing = await prisma.lifecycleOpportunity.findMany({
    where: {
      clientId: input.clientId,
      status: { in: ["open", "accepted"] },
      title: { in: candidates.map((item) => item.title) },
    },
    select: { title: true },
  });
  const existingTitles = new Set(existing.map((item) => item.title));

  const created = [];
  for (const candidate of candidates) {
    if (existingTitles.has(candidate.title)) continue;
    created.push(
      await prisma.lifecycleOpportunity.create({
        data: {
          clientId: input.clientId,
          roadmapId: input.roadmapId,
          phaseId: input.phaseId,
          recommendationId: candidate.recommendationId,
          source: candidate.source,
          title: candidate.title,
          description: candidate.description,
          priority: candidate.priority,
          estimatedImpactPoints: candidate.estimatedImpactPoints,
          estimatedOneTimeInvestment: candidate.estimatedOneTimeInvestment,
          relatedServiceKey: candidate.relatedServiceKey,
          metadataJson: (candidate.metadata ?? {}) as Prisma.InputJsonValue,
        },
      }),
    );
  }

  return created;
}
