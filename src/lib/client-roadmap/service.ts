import type { PhaseProposalStatus, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { PHASE_PROPOSAL_STATUS_LABELS } from "@/lib/phase-proposals/types";
import { computeEffectiveScoreJourney } from "./effective-score";
import { computeRoadmapProgressMetrics } from "./metrics";
import { isConsultantRole } from "./permissions";
import {
  RECOMMENDATION_LIFECYCLE_LABELS,
  ROADMAP_PHASE_STATUS_LABELS,
  type ClientRoadmapDashboard,
  type ClientRoadmapPhaseDetail,
  type RoadmapInitiativeView,
  type RoadmapPhaseJourneyMilestone,
  type RoadmapPhaseProposalSummary,
  type RoadmapPhaseView,
} from "./types";

const roadmapInclude = {
  client: { select: { companyName: true } },
  assessment: { select: { assessmentName: true } },
  phases: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      approvedBy: { select: { name: true } },
      proposals: {
        where: { status: { not: "superseded" as const } },
        orderBy: [{ version: "desc" as const }, { createdAt: "desc" as const }],
        take: 1,
        include: { document: { select: { fileUrl: true } } },
      },
      initiatives: {
        orderBy: { sortOrder: "asc" as const },
        include: {
          recommendation: {
            include: { category: { select: { name: true } } },
          },
        },
      },
    },
  },
};

function decimalToNumber(value: { toNumber?: () => number } | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
}

function toInitiativeView(
  initiative: {
    id: string;
    recommendationId: string;
    title: string;
    estimatedImpactPoints: number;
    sortOrder: number;
    businessOutcomeTitle: string | null;
    businessOutcomeDescription: string | null;
    recommendation: {
      description: string;
      businessImpact: string;
      priority: string;
      status: keyof typeof RECOMMENDATION_LIFECYCLE_LABELS;
      completedAt: Date | null;
      suggestedService: string | null;
      category: { name: string };
    };
  },
): RoadmapInitiativeView {
  return {
    id: initiative.id,
    recommendationId: initiative.recommendationId,
    title: initiative.title,
    description: initiative.recommendation.description,
    businessImpact: initiative.recommendation.businessImpact,
    categoryName: initiative.recommendation.category.name,
    priority: initiative.recommendation.priority,
    estimatedImpactPoints: initiative.estimatedImpactPoints,
    status: initiative.recommendation.status,
    statusLabel: RECOMMENDATION_LIFECYCLE_LABELS[initiative.recommendation.status],
    sortOrder: initiative.sortOrder,
    businessOutcomeTitle: initiative.businessOutcomeTitle,
    businessOutcomeDescription: initiative.businessOutcomeDescription,
    completedAt: initiative.recommendation.completedAt?.toISOString() ?? null,
  };
}

function toProposalSummary(
  proposal: {
    id: string;
    proposalNumber: string;
    version: number;
    status: PhaseProposalStatus;
    createdAt: Date;
    sentAt: Date | null;
    approvedAt: Date | null;
    document?: { fileUrl: string } | null;
  } | null | undefined,
): RoadmapPhaseProposalSummary | null {
  if (!proposal) return null;
  return {
    id: proposal.id,
    proposalNumber: proposal.proposalNumber,
    version: proposal.version,
    status: proposal.status,
    statusLabel: PHASE_PROPOSAL_STATUS_LABELS[proposal.status],
    documentUrl: proposal.document?.fileUrl ?? null,
    createdAt: proposal.createdAt.toISOString(),
    sentAt: proposal.sentAt?.toISOString() ?? null,
    approvedAt: proposal.approvedAt?.toISOString() ?? null,
  };
}

function buildJourneyMilestones(input: {
  proposalGeneratedAt: Date | null;
  proposalAcceptedAt: Date | null;
  projectStartedAt: Date | null;
  projectCompletedAt: Date | null;
  latestProposal: RoadmapPhaseProposalSummary | null;
}): RoadmapPhaseJourneyMilestone[] {
  const milestones: RoadmapPhaseJourneyMilestone[] = [];
  if (input.proposalGeneratedAt || input.latestProposal) {
    milestones.push("proposal_generated");
  }
  if (
    input.latestProposal?.sentAt ||
    input.latestProposal?.status === "sent" ||
    input.latestProposal?.status === "viewed" ||
    input.latestProposal?.status === "approved"
  ) {
    milestones.push("proposal_sent");
  }
  if (input.proposalAcceptedAt || input.latestProposal?.status === "approved") {
    milestones.push("proposal_approved");
  }
  if (input.projectStartedAt) {
    milestones.push("implementation_started");
  }
  if (input.projectCompletedAt) {
    milestones.push("implementation_completed");
  }
  return milestones;
}

function toPhaseView(
  phase: {
    id: string;
    phaseKey: string;
    subtitle: string;
    name: string;
    timeline: string;
    sortOrder: number;
    executiveSummary: string;
    status: keyof typeof ROADMAP_PHASE_STATUS_LABELS;
    oneTimeInvestment: { toNumber?: () => number } | number;
    monthlyRecurringInvestment: { toNumber?: () => number } | number;
    annualRecurringInvestment: { toNumber?: () => number } | number;
    expectedScoreImprovement: number;
    projectedScoreAfterPhase: number;
    approvedAt: Date | null;
    completionDate: Date | null;
    actualCompletionDate: Date | null;
    proposalGeneratedAt: Date | null;
    proposalAcceptedAt: Date | null;
    projectStartedAt: Date | null;
    projectCompletedAt: Date | null;
    approvedBy: { name: string } | null;
    proposals?: Array<{
      id: string;
      proposalNumber: string;
      version: number;
      status: PhaseProposalStatus;
      createdAt: Date;
      sentAt: Date | null;
      approvedAt: Date | null;
      document?: { fileUrl: string } | null;
    }>;
    initiatives: Array<Parameters<typeof toInitiativeView>[0]>;
  },
  isConsultant: boolean,
): RoadmapPhaseView {
  const initiatives = phase.initiatives.map(toInitiativeView);
  const businessOutcomes = initiatives
    .filter((item) => item.businessOutcomeTitle || item.businessOutcomeDescription)
    .map((item) => ({
      title: item.businessOutcomeTitle ?? item.title,
      description: item.businessOutcomeDescription ?? item.businessImpact,
    }));

  const latestProposal = toProposalSummary(phase.proposals?.[0]);
  const proposalNeedsClientAction =
    latestProposal?.status === "sent" || latestProposal?.status === "viewed";

  return {
    id: phase.id,
    phaseKey: phase.phaseKey,
    subtitle: phase.subtitle,
    name: phase.name,
    timeline: phase.timeline,
    sortOrder: phase.sortOrder,
    executiveSummary: phase.executiveSummary,
    status: phase.status,
    statusLabel: ROADMAP_PHASE_STATUS_LABELS[phase.status],
    oneTimeInvestment: decimalToNumber(phase.oneTimeInvestment),
    monthlyRecurringInvestment: decimalToNumber(phase.monthlyRecurringInvestment),
    annualRecurringInvestment: decimalToNumber(phase.annualRecurringInvestment),
    expectedScoreImprovement: phase.expectedScoreImprovement,
    projectedScoreAfterPhase: phase.projectedScoreAfterPhase,
    approvedAt: phase.approvedAt?.toISOString() ?? null,
    approvedByName: phase.approvedBy?.name ?? null,
    completionDate: phase.completionDate?.toISOString() ?? null,
    actualCompletionDate: phase.actualCompletionDate?.toISOString() ?? null,
    proposalGeneratedAt: phase.proposalGeneratedAt?.toISOString() ?? null,
    proposalAcceptedAt: phase.proposalAcceptedAt?.toISOString() ?? null,
    projectStartedAt: phase.projectStartedAt?.toISOString() ?? null,
    projectCompletedAt: phase.projectCompletedAt?.toISOString() ?? null,
    latestProposal,
    journeyMilestones: buildJourneyMilestones({
      proposalGeneratedAt: phase.proposalGeneratedAt,
      proposalAcceptedAt: phase.proposalAcceptedAt,
      projectStartedAt: phase.projectStartedAt,
      projectCompletedAt: phase.projectCompletedAt,
      latestProposal,
    }),
    initiatives,
    businessOutcomes,
    canClientApprove:
      !isConsultant && phase.status === "awaiting_approval" && !proposalNeedsClientAction,
  };
}

async function findPrimaryRoadmap(clientId: string) {
  const active = await prisma.clientRoadmap.findFirst({
    where: { clientId, status: "active" },
    include: roadmapInclude,
    orderBy: { activatedAt: "desc" },
  });
  if (active) return active;

  return prisma.clientRoadmap.findFirst({
    where: { clientId, status: "draft" },
    include: roadmapInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getClientRoadmapDashboard(
  clientId: string,
  role: UserRole,
): Promise<ClientRoadmapDashboard | null> {
  const roadmap = await findPrimaryRoadmap(clientId);
  if (!roadmap) return null;

  const isConsultant = isConsultantRole(role);
  const phases = roadmap.phases.map((phase) => toPhaseView(phase, isConsultant));
  const initiativeInputs = phases.flatMap((phase) =>
    phase.initiatives.map((initiative) => ({
      id: initiative.recommendationId,
      title: initiative.title,
      description: initiative.description,
      businessImpact: initiative.businessImpact,
      suggestedService: null,
      priority: initiative.priority as "low" | "medium" | "high" | "critical",
      estimatedImpactPoints: initiative.estimatedImpactPoints,
      categoryName: initiative.categoryName,
      status: initiative.status,
    })),
  );

  const scoreJourney = computeEffectiveScoreJourney(
    roadmap.baselineScore,
    roadmap.projectedFinalScore,
    initiativeInputs,
  );

  const metrics = computeRoadmapProgressMetrics(
    phases.map((phase) => ({
      status: phase.status,
      oneTimeInvestment: phase.oneTimeInvestment,
      monthlyRecurringInvestment: phase.monthlyRecurringInvestment,
      name: phase.name,
      sortOrder: phase.sortOrder,
      proposalStatusLabel: phase.latestProposal?.statusLabel ?? null,
    })),
    initiativeInputs,
  );

  return {
    id: roadmap.id,
    clientId: roadmap.clientId,
    assessmentId: roadmap.assessmentId,
    tipId: roadmap.tipId,
    status: roadmap.status,
    title: roadmap.title,
    assessmentName: roadmap.assessment.assessmentName,
    clientName: roadmap.client.companyName,
    scoreJourney,
    metrics,
    phases,
    viewerRole: role,
    isConsultant,
  };
}

export async function getClientRoadmapPhaseDetail(
  clientId: string,
  phaseId: string,
  role: UserRole,
): Promise<ClientRoadmapPhaseDetail | null> {
  const phase = await prisma.clientRoadmapPhase.findFirst({
    where: {
      id: phaseId,
      roadmap: { clientId },
    },
    include: {
      approvedBy: { select: { name: true } },
      proposals: {
        where: { status: { not: "superseded" } },
        orderBy: [{ version: "desc" }, { createdAt: "desc" }],
        take: 1,
        include: { document: { select: { fileUrl: true } } },
      },
      roadmap: {
        include: {
          client: { select: { companyName: true } },
        },
      },
      initiatives: {
        orderBy: { sortOrder: "asc" },
        include: {
          recommendation: {
            include: { category: { select: { name: true } } },
          },
        },
      },
      events: {
        orderBy: { createdAt: "desc" },
        include: { changedBy: { select: { name: true } } },
        take: 20,
      },
    },
  });

  if (!phase) return null;

  const dashboard = await getClientRoadmapDashboard(clientId, role);
  if (!dashboard) return null;

  const isConsultant = isConsultantRole(role);
  const phaseView = toPhaseView(phase, isConsultant);

  return {
    ...phaseView,
    roadmapId: phase.roadmapId,
    roadmapTitle: phase.roadmap.title,
    roadmapStatus: phase.roadmap.status,
    clientId,
    scoreJourney: dashboard.scoreJourney,
    events: phase.events.map((event) => ({
      id: event.id,
      fromStatus: event.fromStatus,
      toStatus: event.toStatus,
      changedByName: event.changedBy.name,
      note: event.note,
      createdAt: event.createdAt.toISOString(),
    })),
    isConsultant,
  };
}
