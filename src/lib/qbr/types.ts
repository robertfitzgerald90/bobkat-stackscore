import type { Priority, RecommendationStatus } from "@/generated/prisma/client";
import type { JourneyTimelineEvent } from "@/lib/technology-profile/timeline";

export type QbrSummary = {
  id: string;
  clientId: string;
  title: string;
  status: "draft" | "generated";
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  reviewPeriodLabel: string;
  generatedAt: string | null;
  createdAt: string;
  documentId: string | null;
};

export type QbrCategoryImprovement = {
  categoryName: string;
  previousScore: number | null;
  currentScore: number | null;
  change: number | null;
};

export type QbrProjectSummary = {
  id: string;
  title: string;
  completedAt: string;
  impactPoints: number | null;
  description: string | null;
};

export type QbrRecommendationSummary = {
  id: string;
  title: string;
  priority: Priority;
  status: RecommendationStatus;
  categoryName: string;
  resolvedAt: string | null;
  businessImpact: string;
};

export type QbrRoadmapPhaseSummary = {
  phaseName: string;
  timeframe: string;
  initiativeCount: number;
  summary: string;
};

export type QbrReportData = {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  reviewPeriodLabel: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  generatedAt: string | null;
  generatedDateLabel: string;
  executiveSummary: string;
  currentStackScore: number | null;
  currentMaturityLabel: string | null;
  scoreAtPeriodStart: number | null;
  scoreAtPeriodEnd: number | null;
  scoreChange: number | null;
  assessmentsCompletedInPeriod: number;
  projectsCompletedInPeriod: number;
  recommendationsResolvedInPeriod: number;
  journeyEvents: JourneyTimelineEvent[];
  completedProjects: QbrProjectSummary[];
  categoryImprovements: QbrCategoryImprovement[];
  resolvedRecommendations: QbrRecommendationSummary[];
  remainingOpportunities: QbrRecommendationSummary[];
  roadmapPhases: QbrRoadmapPhaseSummary[];
  businessGoalLabel: string | null;
  businessGoalProgress: string;
  technologyVision: string | null;
  visionProgress: string;
  nextQuarterPriorities: string[];
};
