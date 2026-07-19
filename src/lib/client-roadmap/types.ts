import type {
  ClientRoadmapStatus,
  RecommendationStatus,
  RoadmapPhaseStatus,
  UserRole,
} from "@/generated/prisma/client";

export {
  RECOMMENDATION_LIFECYCLE_LABELS,
  ROADMAP_PHASE_STATUS_LABELS,
} from "./labels";

export type EffectiveScoreJourney = {
  baselineScore: number;
  completedImprovement: number;
  effectiveScore: number;
  remainingOpportunity: number;
  projectedFinalScore: number;
};

export type DomainImprovementMetrics = {
  securityImprovement: number;
  infrastructureImprovement: number;
  businessContinuityImprovement: number;
  operationalMaturityImprovement: number;
};

export type RoadmapProgressMetrics = {
  completionPercent: number;
  initiativesCompleted: number;
  initiativesRemaining: number;
  initiativesTotal: number;
  riskReductionPercent: number;
  currentPhaseName: string | null;
  currentPhaseStatus: RoadmapPhaseStatus | null;
  remainingOneTimeInvestment: number;
  remainingMonthlyRecurring: number;
  domainImprovements: DomainImprovementMetrics;
};

export type RoadmapInitiativeView = {
  id: string;
  recommendationId: string;
  title: string;
  description: string;
  businessImpact: string;
  categoryName: string;
  priority: string;
  estimatedImpactPoints: number;
  status: RecommendationStatus;
  statusLabel: string;
  sortOrder: number;
  businessOutcomeTitle: string | null;
  businessOutcomeDescription: string | null;
  completedAt: string | null;
};

export type RoadmapPhaseView = {
  id: string;
  phaseKey: string;
  subtitle: string;
  name: string;
  timeline: string;
  sortOrder: number;
  executiveSummary: string;
  status: RoadmapPhaseStatus;
  statusLabel: string;
  oneTimeInvestment: number;
  monthlyRecurringInvestment: number;
  annualRecurringInvestment: number;
  expectedScoreImprovement: number;
  projectedScoreAfterPhase: number;
  approvedAt: string | null;
  approvedByName: string | null;
  completionDate: string | null;
  actualCompletionDate: string | null;
  initiatives: RoadmapInitiativeView[];
  businessOutcomes: Array<{ title: string; description: string }>;
  canClientApprove: boolean;
};

export type ClientRoadmapDashboard = {
  id: string;
  clientId: string;
  assessmentId: string;
  tipId: string | null;
  status: ClientRoadmapStatus;
  title: string;
  assessmentName: string | null;
  clientName: string;
  scoreJourney: EffectiveScoreJourney;
  metrics: RoadmapProgressMetrics;
  phases: RoadmapPhaseView[];
  viewerRole: UserRole;
  isConsultant: boolean;
};

export type ClientRoadmapPhaseDetail = RoadmapPhaseView & {
  roadmapId: string;
  roadmapTitle: string;
  roadmapStatus: ClientRoadmapStatus;
  clientId: string;
  scoreJourney: EffectiveScoreJourney;
  events: Array<{
    id: string;
    fromStatus: RoadmapPhaseStatus | null;
    toStatus: RoadmapPhaseStatus;
    changedByName: string;
    note: string | null;
    createdAt: string;
  }>;
  isConsultant: boolean;
};
