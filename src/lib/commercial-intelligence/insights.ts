import { prisma } from "@/lib/db";
import { normalizeToMonthlyCents } from "@/lib/billing/calculations";
import { buildClientSuccessMetrics, getProposalPhaseSortOrder } from "./client-success";
import { buildSalesFunnel } from "./funnel";
import { computeRevenueForecast } from "./forecast";
import { logCommercialInsightsFailure } from "./logging";
import type {
  BusinessIntelligenceKpis,
  CommercialInsightsDashboard,
  ExecutivePortfolioInsight,
} from "./types";

function decimalToNumber(
  value: { toNumber?: () => number } | number | null | undefined | unknown,
): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    const toNumber = (value as { toNumber?: () => number }).toNumber;
    if (typeof toNumber === "function") return toNumber();
  }
  return Number(value);
}

function roundScore(value: unknown): number | null {
  if (value == null) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return Math.round(numeric);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

export async function getCommercialInsightsDashboard(): Promise<CommercialInsightsDashboard> {
  const now = new Date();
  const inNinetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  let prospects: number;
  let purchases: Array<{ amountTotal: number | null; clientId: string | null; assessmentId: string | null }>;
  let completedAssessments: number;
  let roadmaps: number;
  let proposals: Array<{
    status: string;
    oneTimeInvestment: unknown;
    clientId: string;
    phaseId: string;
    phase: { sortOrder: number; status: string } | null;
  }>;
  let phases: Array<{
    status: string;
    oneTimeInvestment: unknown;
    projectStartedAt: Date | null;
    projectCompletedAt: Date | null;
  }>;
  let recurringServices: Array<{
    clientId: string;
    unitPriceCents: number;
    quantity: unknown;
    billingFrequency: string;
    customFrequencyDays: number | null;
    renewalDate: Date | null;
    serviceName: string;
  }>;
  let subscriptions: number;
  let clients: Array<{
    id: string;
    companyName: string;
    technologyProfile: {
      overallStackScore: unknown;
      nextRecommendedAssessmentAt: Date | null;
      criticalExposureCount: number;
    } | null;
    scoreHistory: Array<{
      overallScore: unknown;
      securityScore: unknown;
      infrastructureScore: unknown;
      documentationScore: unknown;
    }>;
    clientRoadmaps: Parameters<typeof buildClientSuccessMetrics>[0]["clientRoadmaps"];
    clientTechnologies: Array<{
      displayName: string | null;
      renewalDate: Date | null;
      licenseRenewalDate: Date | null;
      warrantyExpiresAt: Date | null;
      plannedReplacementDate: Date | null;
      budgetAmountCents: number | null;
      technology: { name: string } | null;
    }>;
  }>;
  let scoreHistory: Array<{ clientId: string; overallScore: unknown; recordedDate: Date }>;
  let projectInvoices: Array<{ totalCents: number; projectId: string | null; clientId: string }>;

  try {
    [
      prospects,
      purchases,
      completedAssessments,
      roadmaps,
      proposals,
      phases,
      recurringServices,
      subscriptions,
      clients,
      scoreHistory,
      projectInvoices,
    ] = await Promise.all([
    prisma.prospect.count({ where: { status: { not: "archived" } } }),
    prisma.assessmentPurchase.findMany({
      where: { status: "fulfilled" },
      select: { amountTotal: true, clientId: true, assessmentId: true },
    }),
    prisma.assessment.count({ where: { status: "completed" } }),
    prisma.clientRoadmap.count({ where: { status: { in: ["active", "completed"] } } }),
    prisma.phaseProposal.findMany({
      select: {
        status: true,
        oneTimeInvestment: true,
        clientId: true,
        phaseId: true,
        phase: { select: { sortOrder: true, status: true } },
      },
    }),
    prisma.clientRoadmapPhase.findMany({
      select: {
        status: true,
        sortOrder: true,
        oneTimeInvestment: true,
        projectStartedAt: true,
        projectCompletedAt: true,
        roadmap: { select: { clientId: true } },
      },
    }),
    prisma.recurringService.findMany({
      where: { status: { in: ["active", "pending_activation"] } },
      select: {
        clientId: true,
        unitPriceCents: true,
        quantity: true,
        billingFrequency: true,
        customFrequencyDays: true,
        renewalDate: true,
        serviceName: true,
      },
    }),
    prisma.subscription.count({
      where: {
        status: { in: ["active", "trialing"] },
      },
    }),
    prisma.client.findMany({
      where: { status: { not: "archived" } },
      select: {
        id: true,
        companyName: true,
        technologyProfile: {
          select: {
            overallStackScore: true,
            nextRecommendedAssessmentAt: true,
            criticalExposureCount: true,
          },
        },
        scoreHistory: {
          orderBy: { recordedDate: "desc" },
          take: 2,
          select: {
            overallScore: true,
            securityScore: true,
            infrastructureScore: true,
            documentationScore: true,
          },
        },
        clientRoadmaps: {
          where: { status: { in: ["active", "draft", "completed"] } },
          take: 1,
          orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
          include: {
            phases: {
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
        clientTechnologies: {
          where: {
            isActive: true,
            OR: [
              { renewalDate: { lte: inNinetyDays } },
              { licenseRenewalDate: { lte: inNinetyDays } },
              { warrantyExpiresAt: { lte: inNinetyDays } },
              { plannedReplacementDate: { lte: inNinetyDays } },
            ],
          },
          select: {
            displayName: true,
            renewalDate: true,
            licenseRenewalDate: true,
            warrantyExpiresAt: true,
            plannedReplacementDate: true,
            budgetAmountCents: true,
            technology: { select: { name: true } },
          },
        },
      },
    }),
    prisma.clientScoreHistory.findMany({
      orderBy: { recordedDate: "desc" },
      select: { clientId: true, overallScore: true, recordedDate: true },
    }),
    prisma.invoice.findMany({
      where: {
        status: { in: ["paid", "partially_paid", "sent"] },
        OR: [{ projectId: { not: null } }, { sourceType: "project" }],
      },
      select: { totalCents: true, projectId: true, clientId: true },
      take: 500,
    }),
    ]);
  } catch (error) {
    logCommercialInsightsFailure("database_fetch", error);
    throw error;
  }

  const invoices = projectInvoices;

  const recurringMonthly =
    recurringServices.reduce(
      (sum, service) =>
        sum +
        normalizeToMonthlyCents(
          service.unitPriceCents,
          Number(service.quantity),
          service.billingFrequency,
          service.customFrequencyDays,
        ),
      0,
    ) / 100;

  const pendingProposals = proposals
    .filter((proposal) =>
      ["draft", "internal_review", "sent", "viewed"].includes(proposal.status),
    )
    .map((proposal) => ({
      oneTimeInvestment: decimalToNumber(proposal.oneTimeInvestment),
      status: proposal.status,
      clientId: proposal.clientId,
    }));

  const approvedPhaseOneTimeRemaining = phases
    .filter((phase) => ["approved", "in_progress"].includes(phase.status))
    .reduce((sum, phase) => sum + decimalToNumber(phase.oneTimeInvestment), 0);

  const renewalRevenueNext90Days =
    recurringServices
      .filter(
        (service) =>
          service.renewalDate &&
          service.renewalDate.getTime() <= inNinetyDays.getTime() &&
          service.renewalDate.getTime() >= now.getTime(),
      )
      .reduce(
        (sum, service) =>
          sum +
          normalizeToMonthlyCents(
            service.unitPriceCents,
            Number(service.quantity),
            service.billingFrequency,
            service.customFrequencyDays,
          ),
        0,
      ) / 100;

  const expectedAssessmentRevenue =
    purchases
      .filter((purchase) => purchase.amountTotal != null)
      .reduce((sum, purchase) => sum + (purchase.amountTotal ?? 0), 0) / 100 /
    Math.max(1, Math.ceil(purchases.length / 12) || 1);

  const forecast = computeRevenueForecast({
    recurringMonthly,
    pendingProposals,
    approvedPhaseOneTimeRemaining,
    expectedAssessmentRevenue: Math.round(expectedAssessmentRevenue * 100) / 100,
    renewalRevenueNext90Days,
  });

  const generatedProposals = proposals.filter((proposal) => proposal.status !== "superseded");
  const approvedProposals = proposals.filter((proposal) => proposal.status === "approved");
  const phase1Proposals = proposals.filter(
    (proposal) => getProposalPhaseSortOrder(proposal) === 0,
  );
  const phase1Approved = phase1Proposals.filter((proposal) => proposal.status === "approved");
  const clientsWithPhase1 = new Set(
    phase1Approved.map((proposal) => proposal.clientId),
  );
  const expansionApprovals = approvedProposals.filter((proposal) => {
    const sortOrder = getProposalPhaseSortOrder(proposal);
    return sortOrder != null && sortOrder > 0 && clientsWithPhase1.has(proposal.clientId);
  });

  const implementationDurations = phases
    .filter((phase) => phase.projectStartedAt && phase.projectCompletedAt)
    .map(
      (phase) =>
        (phase.projectCompletedAt!.getTime() - phase.projectStartedAt!.getTime()) /
        (24 * 60 * 60 * 1000),
    );

  const completedRoadmaps = await prisma.clientRoadmap.count({ where: { status: "completed" } });
  const totalRoadmaps = await prisma.clientRoadmap.count({
    where: { status: { in: ["active", "completed"] } },
  });

  const scoreByClient = new Map<string, number[]>();
  for (const row of scoreHistory) {
    const list = scoreByClient.get(row.clientId) ?? [];
    if (list.length >= 2) continue;
    const score = roundScore(row.overallScore);
    if (score == null) continue;
    list.push(score);
    scoreByClient.set(row.clientId, list);
  }
  const improvements = [...scoreByClient.values()]
    .filter((scores) => scores.length === 2)
    .map(([latest, previous]) => latest - previous);

  const stackScores = clients
    .map((client) => roundScore(client.technologyProfile?.overallStackScore))
    .filter((score): score is number => score !== null);

  const projectRevenue =
    invoices
      .filter((invoice) => invoice.projectId)
      .reduce((sum, invoice) => sum + invoice.totalCents, 0) / 100;

  const consultingRevenue = recurringMonthly * 12;

  const kpis: BusinessIntelligenceKpis = {
    assessmentsCompleted: completedAssessments,
    averageStackScore: average(stackScores),
    averageImprovement: average(improvements),
    proposalAcceptanceRate:
      generatedProposals.length > 0
        ? Math.round((approvedProposals.length / generatedProposals.length) * 1000) / 10
        : null,
    phase1CloseRate:
      phase1Proposals.length > 0
        ? Math.round((phase1Approved.length / phase1Proposals.length) * 1000) / 10
        : null,
    phaseExpansionRate:
      clientsWithPhase1.size > 0
        ? Math.round((expansionApprovals.length / clientsWithPhase1.size) * 1000) / 10
        : null,
    recurringRevenueMonthly: Math.round(recurringMonthly * 100) / 100,
    projectRevenue: Math.round(projectRevenue * 100) / 100,
    consultingRevenue: Math.round(consultingRevenue * 100) / 100,
    averageClientLifetimeValue:
      clients.length > 0
        ? Math.round(((recurringMonthly * 24 + projectRevenue) / clients.length) * 100) / 100
        : null,
    assessmentConversionRate:
      purchases.length > 0
        ? Math.round(
            (purchases.filter((purchase) => purchase.assessmentId).length / purchases.length) *
              1000,
          ) / 10
        : null,
    averageImplementationDays: average(implementationDurations),
    roadmapCompletionRate:
      totalRoadmaps > 0
        ? Math.round((completedRoadmaps / totalRoadmaps) * 1000) / 10
        : null,
  };

  const managedServicesActive = new Set(recurringServices.map((service) => service.clientId)).size;
  const strategicConsultingActive = subscriptions;

  const funnel = buildSalesFunnel({
    marketing_lead: prospects,
    assessment_purchased: purchases.length,
    assessment_completed: completedAssessments,
    roadmap_delivered: roadmaps,
    proposal_generated: generatedProposals.length,
    proposal_approved: approvedProposals.length,
    implementation_started: phases.filter((phase) =>
      ["in_progress", "completed"].includes(phase.status),
    ).length,
    implementation_completed: phases.filter((phase) => phase.status === "completed").length,
    managed_services_active: managedServicesActive,
    strategic_consulting_active: strategicConsultingActive,
  });

  const clientSuccess = clients.map((client) =>
    buildClientSuccessMetrics(client, recurringServices),
  );

  const mrrByClient = new Map<string, number>();
  for (const service of recurringServices) {
    const current = mrrByClient.get(service.clientId) ?? 0;
    mrrByClient.set(
      service.clientId,
      current +
        normalizeToMonthlyCents(
          service.unitPriceCents,
          Number(service.quantity),
          service.billingFrequency,
          service.customFrequencyDays,
        ) /
          100,
    );
  }

  const opportunityByClient = new Map<string, number>();
  for (const proposal of pendingProposals) {
    opportunityByClient.set(
      proposal.clientId,
      (opportunityByClient.get(proposal.clientId) ?? 0) + proposal.oneTimeInvestment,
    );
  }

  const scoredClients = clients.map((client) => ({
    clientId: client.id,
    clientName: client.companyName,
    score: roundScore(client.technologyProfile?.overallStackScore),
    delta:
      roundScore(client.scoreHistory[0]?.overallScore) != null &&
      roundScore(client.scoreHistory[1]?.overallScore) != null
        ? roundScore(client.scoreHistory[0]?.overallScore)! -
          roundScore(client.scoreHistory[1]?.overallScore)!
        : null,
    mrr: mrrByClient.get(client.id) ?? 0,
    opportunity: opportunityByClient.get(client.id) ?? 0,
    nextReview: client.technologyProfile?.nextRecommendedAssessmentAt?.toISOString() ?? null,
  }));

  const portfolio: ExecutivePortfolioInsight = {
    highestRiskClients: [...scoredClients]
      .sort((left, right) => (left.score ?? 999) - (right.score ?? 999))
      .slice(0, 8)
      .map(({ clientId, clientName, score }) => ({ clientId, clientName, score })),
    fastestImprovingClients: scoredClients
      .filter((client) => client.delta != null && client.delta > 0)
      .sort((left, right) => (right.delta ?? 0) - (left.delta ?? 0))
      .slice(0, 8)
      .map(({ clientId, clientName, delta }) => ({
        clientId,
        clientName,
        delta: delta!,
      })),
    largestOpportunities: scoredClients
      .filter((client) => client.opportunity > 0)
      .sort((left, right) => right.opportunity - left.opportunity)
      .slice(0, 8)
      .map(({ clientId, clientName, opportunity }) => ({
        clientId,
        clientName,
        value: opportunity,
        label: "Pending phase proposals",
      })),
    largestRecurringRevenue: scoredClients
      .filter((client) => client.mrr > 0)
      .sort((left, right) => right.mrr - left.mrr)
      .slice(0, 8)
      .map(({ clientId, clientName, mrr }) => ({ clientId, clientName, mrr })),
    lowestTechnologyScores: [...scoredClients]
      .sort((left, right) => (left.score ?? 999) - (right.score ?? 999))
      .slice(0, 8)
      .map(({ clientId, clientName, score }) => ({ clientId, clientName, score })),
    highestTechnologyScores: [...scoredClients]
      .sort((left, right) => (right.score ?? -1) - (left.score ?? -1))
      .slice(0, 8)
      .map(({ clientId, clientName, score }) => ({ clientId, clientName, score })),
    upcomingQbrs: scoredClients
      .filter((client) => client.nextReview)
      .sort(
        (left, right) =>
          new Date(left.nextReview!).getTime() - new Date(right.nextReview!).getTime(),
      )
      .slice(0, 10)
      .map(({ clientId, clientName, nextReview }) => ({
        clientId,
        clientName,
        date: nextReview!,
      })),
    upcomingRenewals: clients.flatMap((client) =>
      client.clientTechnologies.slice(0, 2).map((tech) => ({
        clientId: client.id,
        clientName: client.companyName,
        title: tech.displayName ?? tech.technology?.name ?? "Technology renewal",
        date: (
          tech.renewalDate ??
          tech.licenseRenewalDate ??
          tech.warrantyExpiresAt ??
          tech.plannedReplacementDate ??
          now
        ).toISOString(),
      })),
    ).slice(0, 12),
  };

  return {
    kpis,
    funnel,
    forecast,
    portfolio,
    clientSuccess: clientSuccess
      .sort((left, right) => right.overallOutcomeScore - left.overallOutcomeScore)
      .slice(0, 20),
    generatedAt: now.toISOString(),
  };
}
