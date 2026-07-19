import { calculateProjectionImpacts } from "@/lib/recommendations";
import { calculateProjectedScore } from "@/lib/scoring";
import type { RecommendationStatus } from "@/generated/prisma/client";
import type { EffectiveScoreJourney } from "./types";

export type ScoreImpactInput = {
  id: string;
  title: string;
  description: string;
  businessImpact: string;
  suggestedService: string | null;
  priority: "low" | "medium" | "high" | "critical";
  estimatedImpactPoints: number;
  categoryName: string;
  status: RecommendationStatus;
};

function toProjectionInput(item: ScoreImpactInput) {
  return {
    templateCode: item.id,
    consolidationGroupId: null,
    title: item.title,
    description: item.description,
    businessImpact: item.businessImpact,
    suggestedService: item.suggestedService ?? "",
    priority: item.priority,
    estimatedImpactPoints: item.estimatedImpactPoints,
    categoryName: item.categoryName,
    isConsolidated: false,
  };
}

export function computeImpactPoints(items: ScoreImpactInput[]): number {
  if (items.length === 0) return 0;
  return calculateProjectionImpacts(items.map(toProjectionInput));
}

export function computeEffectiveScoreJourney(
  baselineScore: number,
  projectedFinalScore: number,
  initiatives: ScoreImpactInput[],
): EffectiveScoreJourney {
  const completed = initiatives.filter((item) => item.status === "completed");
  const remaining = initiatives.filter(
    (item) =>
      item.status === "open" ||
      item.status === "accepted" ||
      item.status === "in_progress" ||
      item.status === "deferred",
  );

  const completedImprovement = computeImpactPoints(completed);
  const effectiveScore = calculateProjectedScore(baselineScore, [completedImprovement]);
  const remainingImpact = computeImpactPoints(remaining);
  const recomputedProjected = calculateProjectedScore(effectiveScore, [remainingImpact]);
  const projectedFinal = Math.max(projectedFinalScore, recomputedProjected);

  return {
    baselineScore,
    completedImprovement,
    effectiveScore,
    remainingOpportunity: Math.max(0, projectedFinal - effectiveScore),
    projectedFinalScore: projectedFinal,
  };
}
