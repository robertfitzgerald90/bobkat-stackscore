export type ScoreTrendPoint = {
  date: string;
  dateLabel: string;
  overallScore: number;
  assessmentId: string | null;
  assessmentName: string | null;
  categories: Record<string, number | null>;
};

export type CategoryTrendSeries = {
  categoryCode: string;
  categoryName: string;
  points: Array<{ date: string; dateLabel: string; score: number | null }>;
};

export type MaturityTimelineEvent = {
  id: string;
  date: string;
  dateLabel: string;
  type: "assessment" | "project" | "recommendation";
  title: string;
  subtitle: string;
  score?: number;
};

export type ClientImprovementAnalytics = {
  clientId: string;
  clientName: string;
  initialScore: number | null;
  currentScore: number | null;
  netImprovement: number | null;
  assessmentCount: number;
  projectsCompleted: number;
  recommendationsClosed: number;
  scoreTrend: ScoreTrendPoint[];
  categoryTrends: CategoryTrendSeries[];
  timeline: MaturityTimelineEvent[];
};
