import type { RoadmapPhaseStatus } from "@/generated/prisma/client";
import { computeImpactPoints, type ScoreImpactInput } from "./effective-score";
import { ROADMAP_PHASE_STATUS_LABELS } from "./labels";
import type { DomainImprovementMetrics, RoadmapProgressMetrics } from "./types";

type PhaseInvestmentInput = {
  status: RoadmapPhaseStatus;
  oneTimeInvestment: number;
  monthlyRecurringInvestment: number;
  name: string;
  sortOrder: number;
  proposalStatusLabel?: string | null;
};

const ACTIVE_SERVICE_PHASE_STATUSES: RoadmapPhaseStatus[] = [
  "approved",
  "in_progress",
  "completed",
];

type InitiativeMetricInput = ScoreImpactInput & {
  categoryName: string;
};

const TERMINAL_PHASE_STATUSES: RoadmapPhaseStatus[] = [
  "completed",
  "deferred",
  "cancelled",
];

function categorizeDomain(categoryName: string): keyof DomainImprovementMetrics | null {
  const value = categoryName.toLowerCase();
  if (value.includes("security") || value.includes("identity") || value.includes("access")) {
    return "securityImprovement";
  }
  if (
    value.includes("infrastructure") ||
    value.includes("network") ||
    value.includes("endpoint") ||
    value.includes("cloud")
  ) {
    return "infrastructureImprovement";
  }
  if (
    value.includes("backup") ||
    value.includes("continuity") ||
    value.includes("disaster") ||
    value.includes("bcdr")
  ) {
    return "businessContinuityImprovement";
  }
  if (
    value.includes("operations") ||
    value.includes("documentation") ||
    value.includes("governance") ||
    value.includes("strategic")
  ) {
    return "operationalMaturityImprovement";
  }
  return null;
}

export function computeRoadmapProgressMetrics(
  phases: PhaseInvestmentInput[],
  initiatives: InitiativeMetricInput[],
): RoadmapProgressMetrics {
  const initiativesTotal = initiatives.length;
  const initiativesCompleted = initiatives.filter((item) => item.status === "completed").length;
  const initiativesRemaining = initiativesTotal - initiativesCompleted;
  const completionPercent =
    initiativesTotal === 0
      ? 0
      : Math.round((initiativesCompleted / initiativesTotal) * 100);

  const totalPlannedImpact = computeImpactPoints(initiatives);
  const completedImpact = computeImpactPoints(
    initiatives.filter((item) => item.status === "completed"),
  );
  const riskReductionPercent =
    totalPlannedImpact === 0
      ? 0
      : Math.round((completedImpact / totalPlannedImpact) * 100);

  const sortedPhases = [...phases].sort((left, right) => left.sortOrder - right.sortOrder);
  const currentPhase =
    sortedPhases.find((phase) => !TERMINAL_PHASE_STATUSES.includes(phase.status)) ?? null;

  const incompletePhases = phases.filter(
    (phase) => !TERMINAL_PHASE_STATUSES.includes(phase.status),
  );
  const remainingOneTimeInvestment = roundCurrency(
    incompletePhases.reduce((sum, phase) => sum + phase.oneTimeInvestment, 0),
  );
  const remainingMonthlyRecurring = roundCurrency(
    incompletePhases.reduce((sum, phase) => sum + phase.monthlyRecurringInvestment, 0),
  );

  const currentMonthlyServices = roundCurrency(
    phases
      .filter((phase) => ACTIVE_SERVICE_PHASE_STATUSES.includes(phase.status))
      .reduce((sum, phase) => sum + phase.monthlyRecurringInvestment, 0),
  );
  const projectedMonthlyServicesAfterCompletion = roundCurrency(
    phases.reduce((sum, phase) => sum + phase.monthlyRecurringInvestment, 0),
  );

  const domainImprovements: DomainImprovementMetrics = {
    securityImprovement: 0,
    infrastructureImprovement: 0,
    businessContinuityImprovement: 0,
    operationalMaturityImprovement: 0,
  };

  for (const initiative of initiatives.filter((item) => item.status === "completed")) {
    const domain = categorizeDomain(initiative.categoryName);
    if (!domain) continue;
    domainImprovements[domain] += initiative.estimatedImpactPoints;
  }

  return {
    completionPercent,
    initiativesCompleted,
    initiativesRemaining,
    initiativesTotal,
    riskReductionPercent,
    currentPhaseName: currentPhase ? currentPhase.name : null,
    currentPhaseStatus: currentPhase ? currentPhase.status : null,
    currentPhaseProposalStatusLabel: currentPhase?.proposalStatusLabel ?? null,
    currentPhaseImplementationStatusLabel: currentPhase
      ? ROADMAP_PHASE_STATUS_LABELS[currentPhase.status]
      : null,
    remainingOneTimeInvestment,
    remainingMonthlyRecurring,
    currentMonthlyServices,
    projectedMonthlyServicesAfterCompletion,
    domainImprovements,
  };
}

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}
