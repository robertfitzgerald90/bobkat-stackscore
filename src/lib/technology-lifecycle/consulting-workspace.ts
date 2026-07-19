import { prisma } from "@/lib/db";
import { scoreToBusinessRisk, scoreToHealthBand } from "./health";
import type { ConsultingWorkspaceClient, ConsultingWorkspaceSummary } from "./types";

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

export async function getConsultingWorkspaceSummary(): Promise<ConsultingWorkspaceSummary> {
  const now = new Date();
  const inSixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const clients = await prisma.client.findMany({
    where: { status: { not: "archived" } },
    orderBy: { companyName: "asc" },
    select: {
      id: true,
      companyName: true,
      technologyProfile: {
        select: {
          overallStackScore: true,
          trendDirection: true,
          nextRecommendedAssessmentAt: true,
          criticalExposureCount: true,
          openRecommendationCount: true,
        },
      },
      scoreHistory: {
        orderBy: { recordedDate: "desc" },
        take: 2,
        select: { overallScore: true },
      },
      quarterlyBusinessReviews: {
        orderBy: { reviewPeriodEnd: "desc" },
        take: 1,
        select: { reviewPeriodEnd: true },
      },
      clientRoadmaps: {
        where: { status: { in: ["active", "draft"] } },
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        take: 1,
        include: {
          phases: {
            orderBy: { sortOrder: "asc" },
            select: {
              name: true,
              status: true,
              subtitle: true,
            },
          },
        },
      },
      phaseProposals: {
        where: {
          status: { in: ["draft", "internal_review", "sent", "viewed"] },
        },
        select: {
          proposalNumber: true,
          status: true,
          oneTimeInvestment: true,
        },
      },
      recurringServices: {
        where: { status: { in: ["active", "pending_activation"] } },
        select: {
          unitPriceCents: true,
          quantity: true,
          billingFrequency: true,
        },
      },
    },
  });

  const workspaceClients: ConsultingWorkspaceClient[] = clients.map((client) => {
    const stackScore = roundScore(client.technologyProfile?.overallStackScore);
    const previous = roundScore(client.scoreHistory[1]?.overallScore);
    const riskBand = scoreToBusinessRisk(stackScore);
    const health = scoreToHealthBand(stackScore);

    const roadmap = client.clientRoadmaps[0];
    const nextPhase =
      roadmap?.phases.find((phase) =>
        ["planned", "awaiting_approval", "approved"].includes(phase.status),
      ) ?? null;
    const implementationCount =
      roadmap?.phases.filter((phase) =>
        ["approved", "in_progress"].includes(phase.status),
      ).length ?? 0;

    const monthlyManagedRevenue = client.recurringServices.reduce((sum, service) => {
      const qty = decimalToNumber(service.quantity);
      const amount = (service.unitPriceCents / 100) * qty;
      if (service.billingFrequency === "annual") return sum + amount / 12;
      if (service.billingFrequency === "quarterly") return sum + amount / 3;
      return sum + amount;
    }, 0);

    const nextQbrDate =
      client.technologyProfile?.nextRecommendedAssessmentAt?.toISOString() ??
      client.quarterlyBusinessReviews[0]?.reviewPeriodEnd?.toISOString() ??
      null;

    const attentionReasons: string[] = [];
    if (health === "critical" || health === "at_risk") {
      attentionReasons.push(`Technology health: ${health.replace("_", " ")}`);
    }
    if ((client.technologyProfile?.criticalExposureCount ?? 0) > 0) {
      attentionReasons.push(
        `${client.technologyProfile!.criticalExposureCount} critical exposures`,
      );
    }
    if (client.phaseProposals.some((proposal) => proposal.status === "sent" || proposal.status === "viewed")) {
      attentionReasons.push("Proposal awaiting client decision");
    }
    if (
      nextQbrDate &&
      new Date(nextQbrDate).getTime() <= inSixtyDays.getTime() &&
      new Date(nextQbrDate).getTime() >= now.getTime() - 14 * 24 * 60 * 60 * 1000
    ) {
      attentionReasons.push("Upcoming review window");
    }
    if (previous !== null && stackScore !== null && stackScore < previous) {
      attentionReasons.push("StackScore declined since last assessment");
    }

    return {
      clientId: client.id,
      clientName: client.companyName,
      stackScore,
      riskBand,
      trend: client.technologyProfile?.trendDirection ?? null,
      nextQbrDate,
      nextPhaseOpportunity: nextPhase
        ? `${nextPhase.subtitle} — ${nextPhase.name}`
        : null,
      proposalPipelineCount: client.phaseProposals.length,
      implementationPipelineCount: implementationCount,
      monthlyManagedRevenue: Math.round(monthlyManagedRevenue * 100) / 100,
      requiresAttention: attentionReasons.length > 0,
      attentionReasons,
    };
  });

  const upcomingQbrs = workspaceClients
    .filter((client) => client.nextQbrDate)
    .sort(
      (left, right) =>
        new Date(left.nextQbrDate!).getTime() - new Date(right.nextQbrDate!).getTime(),
    )
    .slice(0, 12)
    .map((client) => ({
      clientId: client.clientId,
      clientName: client.clientName,
      nextReviewDate: client.nextQbrDate!,
    }));

  const upcomingPhaseOpportunities = workspaceClients
    .filter((client) => client.nextPhaseOpportunity)
    .slice(0, 12)
    .map((client) => ({
      clientId: client.clientId,
      clientName: client.clientName,
      phaseName: client.nextPhaseOpportunity!,
    }));

  const proposalRows = clients.flatMap((client) =>
    client.phaseProposals.map((proposal) => ({
      clientId: client.id,
      clientName: client.companyName,
      proposalNumber: proposal.proposalNumber,
      status: proposal.status,
      oneTimeInvestment: decimalToNumber(proposal.oneTimeInvestment),
    })),
  );

  const implementationPipeline = clients.flatMap((client) => {
    const roadmap = client.clientRoadmaps[0];
    if (!roadmap) return [];
    return roadmap.phases
      .filter((phase) => ["approved", "in_progress"].includes(phase.status))
      .map((phase) => ({
        clientId: client.id,
        clientName: client.companyName,
        phaseName: `${phase.subtitle} — ${phase.name}`,
        status: phase.status,
      }));
  });

  const managedServiceRevenueMonthly = Math.round(
    workspaceClients.reduce((sum, client) => sum + client.monthlyManagedRevenue, 0) * 100,
  ) / 100;

  const deltas = clients
    .map((client) => {
      const current = roundScore(client.scoreHistory[0]?.overallScore);
      const previous = roundScore(client.scoreHistory[1]?.overallScore);
      if (current === null || previous === null) return null;
      return current - previous;
    })
    .filter((value): value is number => value !== null);

  const technologyTrendAverageDelta =
    deltas.length === 0
      ? null
      : Math.round((deltas.reduce((sum, value) => sum + value, 0) / deltas.length) * 10) / 10;

  return {
    clientsByStackScore: [...workspaceClients].sort(
      (left, right) => (right.stackScore ?? -1) - (left.stackScore ?? -1),
    ),
    clientsByRisk: [...workspaceClients].sort((left, right) => {
      const order = { critical: 0, at_risk: 1, watch: 2, healthy: 3 };
      return order[left.riskBand] - order[right.riskBand];
    }),
    upcomingQbrs,
    upcomingPhaseOpportunities,
    proposalPipeline: proposalRows.slice(0, 20),
    implementationPipeline: implementationPipeline.slice(0, 20),
    managedServiceRevenueMonthly,
    clientsRequiringAttention: workspaceClients.filter((client) => client.requiresAttention),
    technologyTrendAverageDelta,
  };
}
