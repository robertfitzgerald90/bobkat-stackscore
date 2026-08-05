/**
 * Shared TypeScript types for the StackScore portfolio export package.
 * Fully local. No application imports.
 */

export type PortfolioPriority = "critical" | "high" | "medium" | "low";

export type PortfolioRecommendationStatus =
  | "open"
  | "accepted"
  | "in_progress"
  | "planned";

export type PortfolioPillarScore = {
  id: string;
  name: string;
  currentScore: number;
  projectedScore: number;
  summary: string;
};

export type PortfolioRecommendation = {
  id: string;
  title: string;
  priority: PortfolioPriority;
  status: PortfolioRecommendationStatus;
  pillar: string;
  whyThisMatters: string;
  businessImpact: string;
  expectedOutcome: string;
  maturityPoints: number;
  implementationPhase: string;
  suggestedService: string;
};

export type PortfolioRoadmapItem = {
  id: string;
  title: string;
  pillar: string;
  priority: PortfolioPriority;
};

export type PortfolioRoadmapPhase = {
  id: string;
  name: string;
  timeframe: string;
  focus: string;
  outcomes: string[];
  items: PortfolioRoadmapItem[];
};

export type PortfolioMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "warning";
};

export type PortfolioExecutiveDashboardData = {
  organizationName: string;
  organizationStatus: string;
  pageTitle: string;
  pageSubtitle: string;
  overallScore: number;
  priorScore: number;
  scoreChange: number;
  maturityLabel: string;
  metrics: PortfolioMetric[];
  pillars: PortfolioPillarScore[];
  focusItems: Array<{
    id: string;
    title: string;
    priority: PortfolioPriority;
    pillar: string;
  }>;
};

export type PortfolioMaturityData = {
  organizationName: string;
  assessmentName: string;
  currentScore: number;
  projectedScore: number;
  expectedImprovement: number;
  maturityLabel: string;
  pillars: PortfolioPillarScore[];
};

export type PortfolioRecommendationsData = {
  organizationName: string;
  organizationStatus: string;
  pageTitle: string;
  pageSubtitle: string;
  navigation: Array<{ id: string; label: string }>;
  activeNavId: string;
  recommendations: PortfolioRecommendation[];
  includedCount: number;
  estimatedTimeline: string;
};

export type PortfolioRoadmapData = {
  organizationName: string;
  title: string;
  subtitle: string;
  currentScore: number;
  projectedScore: number;
  estimatedTimeline: string;
  phases: PortfolioRoadmapPhase[];
};

export type PortfolioExecutiveReportData = {
  organizationName: string;
  documentTitle: string;
  documentSubtitle: string;
  reviewPeriod: string;
  generatedDate: string;
  preparedBy: string;
  currentScore: number;
  projectedScore: number;
  expectedImprovement: number;
  maturityLabel: string;
  riskReduction: string;
  businessReadiness: string;
  executiveSummary: string;
  sections: Array<{
    id: string;
    title: string;
    summary: string;
  }>;
};

export type StackScorePortfolioPreviewData = {
  brandProductName: string;
  brandCompanyName: string;
  executiveDashboard: PortfolioExecutiveDashboardData;
  maturityProfile: PortfolioMaturityData;
  recommendationsWorkspace: PortfolioRecommendationsData;
  technologyRoadmap: PortfolioRoadmapData;
  executiveReport: PortfolioExecutiveReportData;
};
