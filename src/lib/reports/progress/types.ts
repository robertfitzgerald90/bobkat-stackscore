export type ProgressCategoryChange = {
  categoryName: string;
  previousScore: number | null;
  currentScore: number | null;
  change: number | null;
};

export type ProgressProjectSummary = {
  id: string;
  title: string;
  completedAt: string | null;
  estimatedImpactPoints: number | null;
  actualImpactPoints: number | null;
  recommendationTitle: string | null;
};

export type ProgressReportData = {
  clientId: string;
  clientName: string;
  generatedAt: string;
  generatedDateLabel: string;
  reportPeriodLabel: string;
  executiveSummary: string;
  currentStackScore: number | null;
  currentMaturityLabel: string | null;
  previousStackScore: number | null;
  scoreChange: number | null;
  lastAssessedAt: string | null;
  lastAssessmentName: string | null;
  categoryChanges: ProgressCategoryChange[];
  completedProjectsSinceAssessment: ProgressProjectSummary[];
  activeProjectCount: number;
  openRecommendationsCount: number;
  journeyPhaseLabel: string;
  nextSteps: string[];
};
