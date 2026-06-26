import { calculateProjectionImpacts } from "@/lib/recommendations";
import { calculateProjectedScore } from "@/lib/scoring";
import type { TipRecommendationView, TipRoadmapPhase, TipRoadmapPhaseView } from "./types";

function toProjectionInput(recommendation: TipRecommendationView) {
  return {
    templateCode: recommendation.id,
    consolidationGroupId: null,
    title: recommendation.title,
    description: recommendation.description,
    businessImpact: recommendation.businessImpact,
    suggestedService: recommendation.suggestedService ?? "",
    priority: recommendation.priority,
    estimatedImpactPoints: recommendation.estimatedImpactPoints,
    categoryName: recommendation.categoryName,
    isConsolidated: false,
  };
}

export function computePhaseProjectedScore(
  currentScore: number,
  recommendations: TipRecommendationView[],
  phaseRecommendationIds: string[],
  priorPhaseIds: string[] = [],
): number {
  const cumulativeIds = new Set([...priorPhaseIds, ...phaseRecommendationIds]);
  const subset = recommendations.filter((rec) => cumulativeIds.has(rec.id));
  if (subset.length === 0) return currentScore;

  const impact = calculateProjectionImpacts(subset.map(toProjectionInput));
  return calculateProjectedScore(currentScore, [impact]);
}

export function buildRoadmapPhaseViews(
  currentScore: number,
  recommendations: TipRecommendationView[],
  phases: TipRoadmapPhase[],
): TipRoadmapPhaseView[] {
  const sorted = [...phases].sort((left, right) => left.sortOrder - right.sortOrder);
  const recById = new Map(recommendations.map((rec) => [rec.id, rec]));
  const priorIds: string[] = [];
  let previousScore = currentScore;

  return sorted.map((phase) => {
    const phaseRecs = phase.recommendationIds
      .map((id) => recById.get(id))
      .filter((rec): rec is TipRecommendationView => !!rec);

    const projectedScore = computePhaseProjectedScore(
      currentScore,
      recommendations,
      phase.recommendationIds,
      priorIds,
    );
    const scoreDelta = projectedScore - previousScore;
    priorIds.push(...phase.recommendationIds);
    previousScore = projectedScore;

    return {
      id: phase.id,
      label: phase.label,
      sortOrder: phase.sortOrder,
      recommendationIds: phase.recommendationIds,
      recommendations: phaseRecs,
      projectedScore,
      scoreDelta,
    };
  });
}

export function computeOverallProjectedScore(
  currentScore: number,
  recommendations: TipRecommendationView[],
): number {
  if (recommendations.length === 0) return currentScore;
  const impact = calculateProjectionImpacts(recommendations.map(toProjectionInput));
  return calculateProjectedScore(currentScore, [impact]);
}
