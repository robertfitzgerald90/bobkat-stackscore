import type {
  LifecycleOpportunitySource,
  LifecycleOpportunityStatus,
  Priority,
  RoadmapPhaseStatus,
  TrendDirection,
} from "@/generated/prisma/client";

export type LifecycleHealthBand = "healthy" | "watch" | "at_risk" | "critical";

export type LifecycleMaturityPillar = {
  key: string;
  label: string;
  score: number | null;
};

export type LifecycleTrendPoint = {
  date: string;
  overallScore: number;
  securityScore: number | null;
  infrastructureScore: number | null;
  backupScore: number | null;
  documentationScore: number | null;
  businessContinuityScore: number | null;
  strategicScore: number | null;
};

export type LifecycleRefreshEvent = {
  id: string;
  title: string;
  category: string;
  eventType:
    | "warranty_expiration"
    | "license_renewal"
    | "planned_replacement"
    | "renewal"
    | "end_of_support";
  dueDate: string;
  daysUntilDue: number;
  lifecycleStatus: string;
  urgency: "overdue" | "upcoming" | "planned";
};

export type LifecycleBudgetPlan = {
  completedInvestment: number;
  plannedInvestment: number;
  deferredInvestment: number;
  monthlyServices: number;
  annualServices: number;
  futureRefreshBudget: number;
  estimatedThreeYearInvestment: number;
};

export type LifecycleInitiativeEffectiveness = {
  initiativeId: string;
  title: string;
  completionDate: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  estimatedScoreIncrease: number;
  actualScoreIncrease: number | null;
  businessValue: string | null;
  status: string;
};

export type LifecycleManagedServiceLink = {
  serviceKey: string;
  serviceName: string;
  description: string;
  supportsObjectives: string[];
  active: boolean;
};

export type LifecycleOpportunityView = {
  id: string;
  source: LifecycleOpportunitySource;
  status: LifecycleOpportunityStatus;
  title: string;
  description: string;
  priority: Priority;
  estimatedImpactPoints: number;
  estimatedOneTimeInvestment: number;
  relatedServiceKey: string | null;
  createdAt: string;
};

export type LifecyclePhaseSnapshot = {
  id: string;
  name: string;
  subtitle: string;
  status: RoadmapPhaseStatus;
  statusLabel: string;
  oneTimeInvestment: number;
  monthlyRecurringInvestment: number;
};

export type TechnologyLifecycleDashboard = {
  clientId: string;
  clientName: string;
  currentStackScore: number | null;
  previousStackScore: number | null;
  targetStackScore: number | null;
  scoreDelta: number | null;
  roadmapCompletionPercent: number;
  technologyHealth: LifecycleHealthBand;
  technologyHealthLabel: string;
  businessRisk: LifecycleHealthBand;
  businessRiskLabel: string;
  securityMaturity: number | null;
  infrastructureMaturity: number | null;
  operationalMaturity: number | null;
  lastReviewDate: string | null;
  nextReviewDate: string | null;
  overallTechnologyTrend: TrendDirection | null;
  trendLabel: string;
  pillars: LifecycleMaturityPillar[];
  scoreTrends: LifecycleTrendPoint[];
  budget: LifecycleBudgetPlan;
  refreshEvents: LifecycleRefreshEvent[];
  initiativeEffectiveness: LifecycleInitiativeEffectiveness[];
  managedServices: LifecycleManagedServiceLink[];
  opportunities: LifecycleOpportunityView[];
  currentPhaseName: string | null;
  upcomingPhaseName: string | null;
  phases: LifecyclePhaseSnapshot[];
  completedProjectsCount: number;
  upcomingProjectsCount: number;
  openOpportunityCount: number;
};

export type ConsultingWorkspaceClient = {
  clientId: string;
  clientName: string;
  stackScore: number | null;
  riskBand: LifecycleHealthBand;
  trend: TrendDirection | null;
  nextQbrDate: string | null;
  nextPhaseOpportunity: string | null;
  proposalPipelineCount: number;
  implementationPipelineCount: number;
  monthlyManagedRevenue: number;
  requiresAttention: boolean;
  attentionReasons: string[];
};

export type ConsultingWorkspaceSummary = {
  clientsByStackScore: ConsultingWorkspaceClient[];
  clientsByRisk: ConsultingWorkspaceClient[];
  upcomingQbrs: Array<{ clientId: string; clientName: string; nextReviewDate: string }>;
  upcomingPhaseOpportunities: Array<{
    clientId: string;
    clientName: string;
    phaseName: string;
  }>;
  proposalPipeline: Array<{
    clientId: string;
    clientName: string;
    proposalNumber: string;
    status: string;
    oneTimeInvestment: number;
  }>;
  implementationPipeline: Array<{
    clientId: string;
    clientName: string;
    phaseName: string;
    status: string;
  }>;
  managedServiceRevenueMonthly: number;
  clientsRequiringAttention: ConsultingWorkspaceClient[];
  technologyTrendAverageDelta: number | null;
};
