import type { RecommendationSummary } from "@/lib/assessments/results-summary";
import { calculateProjectionImpacts } from "@/lib/recommendations";
import { calculateProjectedScore, getRating } from "@/lib/scoring";
import type { Priority } from "@/generated/prisma/client";
import { PRIORITY_ORDER } from "@/lib/pdf/types";

export function sortRecommendationsForDisplay(
  recommendations: RecommendationSummary[],
): RecommendationSummary[] {
  return [...recommendations].sort((left, right) => {
    const priorityDiff =
      PRIORITY_ORDER.indexOf(left.priority) - PRIORITY_ORDER.indexOf(right.priority);
    if (priorityDiff !== 0) return priorityDiff;
    return right.estimatedImpactPoints - left.estimatedImpactPoints;
  });
}

function toProjectionRecommendation(recommendation: RecommendationSummary) {
  return {
    templateCode: recommendation.id,
    consolidationGroupId: recommendation.consolidationGroupId,
    title: recommendation.title,
    description: recommendation.description,
    businessImpact: recommendation.businessImpact,
    suggestedService: recommendation.suggestedService ?? "",
    priority: recommendation.priority,
    estimatedImpactPoints: recommendation.estimatedImpactPoints,
    categoryName: recommendation.categoryName,
    isConsolidated: !!recommendation.consolidationGroupId,
  };
}

function actionableRecommendations(recommendations: RecommendationSummary[]) {
  return recommendations.filter(
    (recommendation) =>
      recommendation.status !== "completed" && recommendation.status !== "declined",
  );
}

export function computeRoadmapScores(
  overallScore: number,
  recommendations: RecommendationSummary[],
) {
  const actionable = actionableRecommendations(recommendations);

  const projectForPriorities = (priorities: Priority[]) => {
    const subset = actionable.filter((recommendation) =>
      priorities.includes(recommendation.priority),
    );
    const impact = calculateProjectionImpacts(
      subset.map((recommendation) => toProjectionRecommendation(recommendation)),
    );
    return calculateProjectedScore(overallScore, [impact]);
  };

  return {
    current: overallScore,
    afterCritical: projectForPriorities(["critical"]),
    afterCriticalAndHigh: projectForPriorities(["critical", "high"]),
    afterAll: projectForPriorities(["critical", "high", "medium", "low"]),
  };
}

export function countByPriority(
  recommendations: RecommendationSummary[],
  priority: Priority,
) {
  return recommendations.filter(
    (recommendation) =>
      recommendation.priority === priority &&
      recommendation.status !== "completed" &&
      recommendation.status !== "declined",
  ).length;
}

export { getRating };
