import type {
  PhaseProposalStatus,
  RecommendationStatus,
  RoadmapPhaseStatus,
} from "@/generated/prisma/client";
import type { RecommendationCostType } from "@/lib/technology-improvement-plan/roadmap-engine/types";

/** Local demo lifecycle — never persisted to production data. */
export type InteractiveDemoStage =
  | "assessment_complete"
  | "phase1_awaiting_approval"
  | "phase1_approved"
  | "phase1_in_progress"
  | "phase1_completed";

export type DemoInitiativeStatus = Extract<
  RecommendationStatus,
  "open" | "accepted" | "in_progress" | "completed" | "deferred"
>;

export type DemoCompany = {
  id: string;
  name: string;
  industry: string;
  employeeCount: number;
  locationCount: number;
  managedDeviceCount: number;
  summary: string;
  primaryConcerns: string[];
};

export type DemoAssessmentSnapshot = {
  initialStackScore: number;
  projectedFinalStackScore: number;
  availableImprovement: number;
  phaseCount: number;
  recommendationCount: number;
  strengths: string[];
  priorityGaps: string[];
  primaryRisks: string[];
};

export type DemoPhaseInitiative = {
  id: string;
  title: string;
  description: string;
  businessBenefit: string;
  stackScoreContribution: number;
  costType: RecommendationCostType;
  oneTimeInvestment: number;
  monthlyRecurringInvestment: number;
  /** When true, omit dollar recurring and show retainer inclusion copy. */
  includedInStrategicConsulting?: boolean;
  initialStatus: DemoInitiativeStatus;
};

export type DemoRoadmapPhase = {
  id: string;
  phaseNumber: number;
  name: string;
  timeline: string;
  executiveSummary: string;
  whyItMatters: string;
  riskLevel: "Critical" | "High" | "Medium" | "Low";
  stackScoreImprovement: number;
  oneTimeInvestment: number;
  monthlyRecurringInvestment: number;
  /** Omit recurring line in UI when falsey and not retainer-covered. */
  showMonthlyRecurring: boolean;
  monthlyRecurringLabel?: "standard" | "strategic_consulting_included";
  primaryBusinessOutcome: string;
  businessOutcomes: string[];
  completionOutcomes: string[];
  deliverables: string[];
  assumptions: string[];
  initiatives: DemoPhaseInitiative[];
  initialStatus: RoadmapPhaseStatus;
};

export type DemoProposalSeed = {
  id: string;
  proposalNumber: string;
  version: number;
  phaseId: string;
  initialStatus: PhaseProposalStatus;
  scopeSummary: string;
  approvalLanguage: string;
};

export type DemoScoreProgression = {
  initialScore: number;
  phase1Improvement: number;
  afterPhase1Score: number;
  projectedFinalScore: number;
  pillarBeforeAfter: Array<{
    id: string;
    label: string;
    before: number;
    afterPhase1: number;
  }>;
};

export type InteractiveDemoScenario = {
  company: DemoCompany;
  assessment: DemoAssessmentSnapshot;
  phases: DemoRoadmapPhase[];
  proposals: DemoProposalSeed[];
  scoreProgression: DemoScoreProgression;
  strategicConsultingMonthlyCents: number;
  managedItPerDeviceMonthlyCents: number;
};

export type InteractiveDemoPersistedState = {
  stage: InteractiveDemoStage;
  /** Initiative completion overrides keyed by initiative id (Phase 1 simulation). */
  initiativeStatuses: Record<string, DemoInitiativeStatus>;
  proposalStatuses: Record<string, PhaseProposalStatus>;
  phaseStatuses: Record<string, RoadmapPhaseStatus>;
  selectedPhaseId: string;
  implementationStartedAt: string | null;
  implementationTargetAt: string | null;
};

export type DerivedDemoPhase = Omit<DemoRoadmapPhase, "initiatives" | "initialStatus"> & {
  status: RoadmapPhaseStatus;
  initiativeCount: number;
  completedInitiativeCount: number;
  completionPercent: number;
  initiatives: Array<DemoPhaseInitiative & { status: DemoInitiativeStatus }>;
};

export type DerivedDemoView = {
  stage: InteractiveDemoStage;
  company: DemoCompany;
  assessment: DemoAssessmentSnapshot;
  phases: DerivedDemoPhase[];
  selectedPhase: DerivedDemoPhase;
  phase1: DerivedDemoPhase;
  phase2: DerivedDemoPhase | undefined;
  proposal: DemoProposalSeed & { status: PhaseProposalStatus };
  effectiveScore: number;
  completedImprovement: number;
  projectedFinalScore: number;
  roadmapCompletionPercent: number;
  completedInitiativeCount: number;
  remainingInitiativeCount: number;
  totalOneTimeInvestment: number;
  totalMonthlyRecurring: number;
  currentPhaseNumber: number;
  canApprovePhase1: boolean;
  canStartImplementation: boolean;
  canSimulateCompletion: boolean;
  showNextPhaseIntro: boolean;
};
