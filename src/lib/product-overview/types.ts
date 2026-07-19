export type MaturityLabel = "Initial" | "Developing" | "Defined" | "Managed" | "Optimized";

export type PillarTrend = "up" | "down" | "stable";

export type PillarStatusColor = "success" | "warning" | "critical" | "neutral";

export type RecommendationStatus = "Open" | "Planned" | "Completed";

export type RecommendationFilterTag =
  | "all"
  | "critical"
  | "high"
  | "quick-win"
  | "planned"
  | "completed";

export type RoadmapViewMode = "quarter" | "timeline" | "priority";

export type DemoOrganization = {
  id: string;
  name: string;
  employeeCount: number;
  locationCount: number;
  industry: string;
  summary: string;
  environmentHighlights: string[];
};

export type TechnologyScoreState = {
  score: number;
  maxScore: number;
  maturityLabel: MaturityLabel;
  changeSinceLastReview: number;
  projectedScore: number;
  projectedMaturityLabel: MaturityLabel;
  projectedNote: string;
};

export type DemoPillar = {
  id: string;
  name: string;
  score: number;
  maturityLabel: MaturityLabel;
  summary: string;
  primaryRisk: string;
  exampleRecommendation: string;
  targetScore: number;
  businessImpact: string;
  trend: PillarTrend;
  trendDelta: number;
  keyFinding: string;
  priorityLevel: "Critical" | "High" | "Medium" | "Low";
  recommendedImprovement: string;
  expectedBusinessOutcome: string;
  statusColor: PillarStatusColor;
  linkedRecommendationId: string;
  linkedRoadmapInitiativeId: string;
};

export type DemoRecommendation = {
  id: string;
  title: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  effort: "Low" | "Medium" | "High";
  estimatedCost: string;
  target: string;
  whyItMatters: string;
  expectedOutcome: string;
  pillarId: string;
  pillarName: string;
  businessImpact: string;
  status: RecommendationStatus;
  riskIfIgnored: string;
  estimatedTimeline: string;
  dependencies: string[];
  relatedRoadmapInitiativeId: string;
  relatedProjectId?: string;
  filterTags: Exclude<RecommendationFilterTag, "all">[];
  isQuickWin?: boolean;
  isPlannedThisQuarter?: boolean;
};

export type DemoProjectTimelinePhase = {
  id: string;
  label: string;
  status: "completed" | "current" | "upcoming";
};

export type DemoProject = {
  id: string;
  title: string;
  status: "In Progress" | "Planning" | "On Track" | "At Risk";
  progress: number;
  owner: string;
  targetCompletion: string;
  description: string;
  milestones: string[];
  relatedRecommendation: string;
  businessOutcome: string;
  budgetRange: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  pillarId: string;
  pillarName: string;
  relatedRecommendationId: string;
  relatedRoadmapInitiativeId: string;
  relatedQuarterlyReviewId: string;
  businessObjective: string;
  timelinePhases: DemoProjectTimelinePhase[];
  currentRisks: string[];
  dependencies: string[];
  projectNotes: string[];
};

export type DemoRoadmapQuarter = {
  quarter: string;
  items: string[];
};

export type DemoRoadmapInitiative = {
  id: string;
  title: string;
  quarter: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  description: string;
  budget: string;
  expectedBusinessOutcome: string;
  relatedRecommendationId: string;
  relatedPillarId: string;
  status: string;
  completionPercent: number;
};

export type DemoQuarterlyReview = {
  nextReviewDate: string;
  status: string;
  scoreChange: number;
  projectsCompleted: number;
  recommendationsClosed: number;
  budgetVariance: string;
  executiveSummary: string[];
  currentScore: number;
  previousScore: number;
  openHighPriority: number;
  roadmapCompletionPercent: number;
  budgetUtilizationPercent: number;
};

export type DemoExecutiveReview = {
  executiveSummary: string[];
  scoreTrend: { quarter: string; score: number }[];
  completedInitiatives: string[];
  openRisks: string[];
  budgetSummary: string[];
  roadmapProgress: string[];
  topPrioritiesNextQuarter: string[];
  executiveRecommendations: string[];
};

export type DemoExecutiveReportType =
  | "assessment"
  | "improvement-plan"
  | "qbr"
  | "roadmap"
  | "budget"
  | "strategic-summary";

export type DemoExecutiveReport = {
  id: string;
  title: string;
  description: string;
  generatedDate: string;
  reportType: DemoExecutiveReportType;
};

export type DemoReportPreviewSection = {
  heading: string;
  body?: string;
  bullets?: string[];
};

export type DemoReportPreview = {
  reportId: string;
  title: string;
  subtitle: string;
  generatedDate: string;
  sections: DemoReportPreviewSection[];
  metrics?: { label: string; value: string }[];
};

export type DemoBudgetCategory = {
  id: string;
  label: string;
  amount: number;
};

export type DemoBudgetPeriodId = "current-year" | "next-year" | "three-year";

export type DemoBudgetPeriod = {
  id: DemoBudgetPeriodId;
  label: string;
  annual: DemoBudgetPlan;
  categories: DemoBudgetCategory[];
};

export type DemoBusinessOutcomeKpi = {
  id: string;
  label: string;
  currentValue: string;
  targetValue?: string;
  detail?: string;
};

export type DemoValueProposition = {
  id: string;
  title: string;
  description: string;
  icon:
    | "compass"
    | "target"
    | "trending"
    | "shield"
    | "wallet"
    | "lock"
    | "refresh"
    | "sparkles";
};

export type DemoPlatformMapStep = {
  id: string;
  label: string;
  description: string;
};

export type DemoBudgetPlan = {
  planned: number;
  approved: number;
  committed: number;
  remaining: number;
};

export type DemoNextAction = {
  title: string;
  body: string;
  reason: string;
  relatedProjectId: string;
  relatedRecommendationId: string;
};

export type DemoDashboardMetrics = {
  openRecommendations: number;
  highPriorityRecommendations: number;
  quickWins: number;
  plannedThisQuarter: number;
  activeProjects: number;
  roadmapCompletionPercent: number;
  annualTechnologyPlan: number;
  approvedSpend: number;
};

export type DemoDashboard = {
  organization: DemoOrganization;
  technologyScore: TechnologyScoreState;
  metrics: DemoDashboardMetrics;
  pillars: DemoPillar[];
  recommendations: DemoRecommendation[];
  featuredRecommendationId: string;
  projects: DemoProject[];
  roadmapQuarters: DemoRoadmapQuarter[];
  roadmapInitiatives: DemoRoadmapInitiative[];
  quarterlyReview: DemoQuarterlyReview;
  budget: DemoBudgetPlan;
  nextAction: DemoNextAction;
};

export type JourneyStage = {
  id: string;
  label: string;
  description: string;
};

export type BusinessOutcome = {
  id: string;
  title: string;
  description: string;
  icon:
    | "shield"
    | "chart"
    | "eye"
    | "wallet"
    | "trending"
    | "lock"
    | "clipboard"
    | "refresh";
};

export type DemoConnectionMap = {
  pillarId: string;
  recommendationId: string;
  roadmapInitiativeId: string;
};

export type ProductOverviewNavItem = {
  id: string;
  label: string;
  phase: 1 | 2 | 3;
  sectionId?: string;
  teaserTitle?: string;
  teaserDescription?: string;
};

export type ProductOverviewHighlight = {
  pillarId?: string;
  recommendationId?: string;
  roadmapInitiativeId?: string;
  projectId?: string;
  reportId?: string;
};

export type DemoDetailPanel =
  | { type: "pillar"; pillarId: string }
  | { type: "assessmentPillar"; pillarId: string }
  | { type: "recommendation"; recommendationId: string }
  | { type: "project"; projectId: string }
  | { type: "projectExecution"; projectId: string }
  | { type: "roadmap" }
  | { type: "roadmapInitiative"; initiativeId: string }
  | { type: "qbr" }
  | { type: "executiveReview" }
  | { type: "report"; reportId: string }
  | { type: "nextAction" }
  | null;
