import {
  calculateProjectionImpacts,
  type GeneratedRecommendation,
} from "@/lib/recommendations";
import { calculateProjectedScore, getRating, RATING_LABELS } from "@/lib/scoring";
import type { Priority, Rating, RecommendationStatus } from "@/generated/prisma/client";

export type CategoryScoreSummary = {
  categoryId: string;
  categoryName: string;
  percentScore: number;
  rating: Rating;
};

export type RecommendationSummary = {
  id: string;
  title: string;
  description: string;
  businessImpact: string;
  suggestedService: string | null;
  priority: Priority;
  status: RecommendationStatus;
  estimatedImpactPoints: number;
  categoryId: string;
  categoryName: string;
  consolidationGroupId: string | null;
  hasProject: boolean;
  projectId: string | null;
};

export type AssessmentResultsSummary = {
  overallScore: number;
  overallRating: Rating;
  overallRatingLabel: string;
  projectedScore: number;
  hasCriticalExposure: boolean;
  criticalFindingsCount: number;
  openRecommendationsCount: number;
  categoryScores: CategoryScoreSummary[];
  topStrengths: CategoryScoreSummary[];
  topRisks: CategoryScoreSummary[];
  immediateActions: RecommendationSummary[];
  recommendations: RecommendationSummary[];
};

type RecommendationInput = {
  id: string;
  title: string;
  description: string;
  businessImpact: string;
  suggestedService: string | null;
  priority: Priority;
  status: RecommendationStatus;
  estimatedImpactPoints: number;
  consolidationGroupId: string | null;
  categoryId: string;
  category: { name: string };
  project: { id: string } | null;
};

export function buildAssessmentResultsSummary(
  overallScore: number,
  hasCriticalExposure: boolean,
  criticalFindingsCount: number,
  categoryScores: Array<{
    categoryId: string;
    percentScore: unknown;
    rating: Rating;
    category: { name: string };
  }>,
  recommendations: RecommendationInput[],
): AssessmentResultsSummary {
  const overallRating = getRating(overallScore);

  const categories: CategoryScoreSummary[] = categoryScores.map((score) => ({
    categoryId: score.categoryId,
    categoryName: score.category.name,
    percentScore: Number(score.percentScore),
    rating: score.rating,
  }));

  const topStrengths = [...categories]
    .sort((a, b) => b.percentScore - a.percentScore)
    .slice(0, 3);

  const topRisks = [...categories]
    .sort((a, b) => a.percentScore - b.percentScore)
    .slice(0, 3);

  const recommendationSummaries: RecommendationSummary[] = recommendations.map(
    (recommendation) => ({
      id: recommendation.id,
      title: recommendation.title,
      description: recommendation.description,
      businessImpact: recommendation.businessImpact,
      suggestedService: recommendation.suggestedService,
      priority: recommendation.priority,
      status: recommendation.status,
      estimatedImpactPoints: recommendation.estimatedImpactPoints,
      categoryId: recommendation.categoryId,
      categoryName: recommendation.category.name,
      consolidationGroupId: recommendation.consolidationGroupId,
      hasProject: !!recommendation.project,
      projectId: recommendation.project?.id ?? null,
    }),
  );

  const openRecommendationsCount = recommendationSummaries.filter(
    (recommendation) => recommendation.status === "open",
  ).length;

  const actionableForProjection = recommendations.filter(
    (recommendation) =>
      recommendation.status !== "completed" && recommendation.status !== "declined",
  );

  const projectionRecommendations: GeneratedRecommendation[] = actionableForProjection.map(
    (recommendation) => ({
      templateCode: recommendation.id,
      consolidationGroupId: recommendation.consolidationGroupId,
      title: recommendation.title,
      description: recommendation.description,
      businessImpact: recommendation.businessImpact,
      suggestedService: recommendation.suggestedService ?? "",
      priority: recommendation.priority,
      estimatedImpactPoints: recommendation.estimatedImpactPoints,
      categoryName: recommendation.category.name,
      isConsolidated: !!recommendation.consolidationGroupId,
    }),
  );

  const projectionImpact = calculateProjectionImpacts(projectionRecommendations);
  const projectedScore = calculateProjectedScore(overallScore, [projectionImpact]);

  const priorityOrder: Priority[] = ["critical", "high", "medium", "low"];
  const immediateActions = recommendationSummaries
    .filter(
      (recommendation) =>
        (recommendation.status === "open" ||
          recommendation.status === "accepted" ||
          recommendation.status === "in_progress") &&
        (recommendation.priority === "critical" || recommendation.priority === "high"),
    )
    .sort(
      (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority),
    )
    .slice(0, 5);

  return {
    overallScore,
    overallRating,
    overallRatingLabel: RATING_LABELS[overallRating],
    projectedScore,
    hasCriticalExposure,
    criticalFindingsCount,
    openRecommendationsCount,
    categoryScores: categories,
    topStrengths,
    topRisks,
    immediateActions,
    recommendations: recommendationSummaries,
  };
}

export const RECOMMENDATION_STATUS_LABELS: Record<RecommendationStatus, string> = {
  open: "Open",
  accepted: "Accepted",
  in_progress: "In Progress",
  completed: "Completed",
  deferred: "Deferred",
  declined: "Declined",
};
