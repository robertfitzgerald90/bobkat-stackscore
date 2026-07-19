export type MaturityLabel = "Initial" | "Developing" | "Defined" | "Managed" | "Optimized";

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
  isQuickWin?: boolean;
  isPlannedThisQuarter?: boolean;
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
};

export type DemoRoadmapQuarter = {
  quarter: string;
  items: string[];
};

export type DemoQuarterlyReview = {
  nextReviewDate: string;
  status: string;
  scoreChange: number;
  projectsCompleted: number;
  recommendationsClosed: number;
  budgetVariance: string;
  executiveSummary: string[];
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
  featuredRecommendationId: string;
  projects: DemoProject[];
  roadmapQuarters: DemoRoadmapQuarter[];
  quarterlyReview: DemoQuarterlyReview;
  budget: DemoBudgetPlan;
  nextAction: DemoNextAction;
};

export type ProductOverviewNavItem = {
  id: string;
  label: string;
  phase: 1 | 2;
  teaserTitle?: string;
  teaserDescription?: string;
};

export type DemoDetailPanel =
  | { type: "pillar"; pillarId: string }
  | { type: "recommendation"; recommendationId: string }
  | { type: "project"; projectId: string }
  | { type: "roadmap" }
  | { type: "qbr" }
  | { type: "nextAction" }
  | null;
