import { prisma } from "@/lib/db";
import { normalizeToMonthlyCents } from "@/lib/billing/calculations";
import { computeRoadmapProgressMetrics } from "@/lib/client-roadmap/metrics";
import { scoreToHealthBand } from "@/lib/technology-lifecycle/health";
import { buildRefreshEvents } from "@/lib/technology-lifecycle/refresh";
import type { Customer360Dashboard } from "./types";

function decimalToNumber(value: { toNumber?: () => number } | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
}

function roundScore(value: unknown): number | null {
  if (value == null) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return Math.round(numeric);
}

function computeClientHealthScore(input: {
  stackScore: number | null;
  roadmapCompletion: number;
  openCritical: number;
  mrr: number;
  overdueRenewals: number;
}): number {
  const scorePart = input.stackScore ?? 50;
  const roadmapPart = input.roadmapCompletion;
  const riskPenalty = Math.min(30, input.openCritical * 5 + input.overdueRenewals * 8);
  const serviceBonus = input.mrr > 0 ? 5 : 0;
  return Math.max(
    0,
    Math.min(100, Math.round(scorePart * 0.55 + roadmapPart * 0.25 + serviceBonus - riskPenalty + 20)),
  );
}

export async function getCustomer360Dashboard(
  clientId: string,
): Promise<Customer360Dashboard | null> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      technologyProfile: true,
      assessments: {
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 5,
        select: {
          id: true,
          assessmentName: true,
          completedAt: true,
          overallScore: true,
        },
      },
      projects: {
        select: { status: true },
      },
      phaseProposals: {
        where: { status: { in: ["draft", "internal_review", "sent", "viewed"] } },
        select: { oneTimeInvestment: true },
      },
      recurringServices: {
        where: { status: { in: ["active", "pending_activation"] } },
        select: {
          serviceName: true,
          unitPriceCents: true,
          quantity: true,
          billingFrequency: true,
          customFrequencyDays: true,
        },
      },
      lifecycleOpportunities: {
        where: { status: "open" },
        select: { id: true },
      },
      communicationMessages: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, subject: true, createdAt: true, sentAt: true },
      },
      clientTechnologies: {
        where: { isActive: true },
        include: {
          technology: {
            select: { name: true, category: { select: { name: true } } },
          },
        },
      },
      clientRoadmaps: {
        where: { status: { in: ["active", "draft"] } },
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        take: 1,
        include: {
          phases: {
            orderBy: { sortOrder: "asc" },
            include: {
              initiatives: {
                include: {
                  recommendation: {
                    select: {
                      status: true,
                      estimatedImpactPoints: true,
                      category: { select: { name: true } },
                      title: true,
                      description: true,
                      businessImpact: true,
                      priority: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!client) return null;

  const roadmap = client.clientRoadmaps[0];
  const phases = roadmap?.phases ?? [];
  const initiativeInputs = phases.flatMap((phase) =>
    phase.initiatives.map((initiative) => ({
      id: initiative.recommendationId,
      title: initiative.recommendation.title,
      description: initiative.recommendation.description,
      businessImpact: initiative.recommendation.businessImpact,
      suggestedService: null,
      priority: initiative.recommendation.priority as "low" | "medium" | "high" | "critical",
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

  const mrrCents = client.recurringServices.reduce(
    (sum, service) =>
      sum +
      normalizeToMonthlyCents(
        service.unitPriceCents,
        Number(service.quantity),
        service.billingFrequency,
        service.customFrequencyDays,
      ),
    0,
  );
  const monthlyRecurringRevenue = mrrCents / 100;

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

  const currentStackScore = roundScore(client.technologyProfile?.overallStackScore);
  const openCritical = await prisma.assessmentRecommendation.count({
    where: { clientId, status: { in: ["open", "accepted"] }, priority: "critical" },
  });

  const currentPhase =
    phases.find((phase) => !["completed", "deferred", "cancelled"].includes(phase.status)) ??
    null;

  return {
    clientId: client.id,
    companyName: client.companyName,
    industry: client.industry,
    primaryContactName: client.primaryContactName,
    primaryContactEmail: client.primaryContactEmail,
    status: client.status,
    currentStackScore,
    technologyTrend: client.technologyProfile?.trendDirection ?? null,
    technologyHealth: scoreToHealthBand(currentStackScore),
    overallClientHealthScore: computeClientHealthScore({
      stackScore: currentStackScore,
      roadmapCompletion: metrics.completionPercent,
      openCritical,
      mrr: monthlyRecurringRevenue,
      overdueRenewals: refreshEvents.filter((event) => event.urgency === "overdue").length,
    }),
    roadmapProgressPercent: metrics.completionPercent,
    activeProjects: client.projects.filter((project) =>
      ["proposed", "approved", "scheduled", "in_progress"].includes(project.status),
    ).length,
    completedProjects: client.projects.filter((project) => project.status === "completed").length,
    managedServicesCount: client.recurringServices.length,
    monthlyRecurringRevenue,
    proposalPipelineCount: client.phaseProposals.length,
    proposalPipelineValue: client.phaseProposals.reduce(
      (sum, proposal) => sum + decimalToNumber(proposal.oneTimeInvestment),
      0,
    ),
    upcomingReviewDate:
      client.technologyProfile?.nextRecommendedAssessmentAt?.toISOString() ??
      client.quarterlyReviewAnchorAt?.toISOString() ??
      null,
    recentAssessments: client.assessments.map((assessment) => ({
      id: assessment.id,
      name: assessment.assessmentName,
      completedAt: assessment.completedAt?.toISOString() ?? null,
      score: roundScore(assessment.overallScore),
    })),
    openOpportunities: client.lifecycleOpportunities.length,
    recentCommunications: client.communicationMessages.map((message) => ({
      id: message.id,
      subject: message.subject,
      sentAt: (message.sentAt ?? message.createdAt).toISOString(),
    })),
    upcomingRenewals: refreshEvents.slice(0, 6).map((event) => ({
      title: event.title,
      dueDate: event.dueDate,
      kind: event.eventType,
    })),
    activeManagedServices: client.recurringServices.map((service) => service.serviceName),
    currentPhaseName: currentPhase ? `${currentPhase.subtitle} — ${currentPhase.name}` : null,
  };
}
