import type { PortfolioReadinessStatus } from "@/lib/portfolio/types";

const READINESS_WEIGHT: Record<PortfolioReadinessStatus, number> = {
  blocked: 100,
  ready: 80,
  partial: 60,
  healthy: 10,
};

export type RecommendedSortInput = {
  readinessStatus: PortfolioReadinessStatus;
  criticalRecommendationsCount: number;
  projectedImprovement: number | null;
  openProjectsCount: number;
  daysSinceLastAssessment: number | null;
  daysSinceLastImprovement: number | null;
};

const MS_PER_DAY = 86_400_000;

export function daysSince(date: Date | null, now: Date): number | null {
  if (!date) return null;
  const diff = now.getTime() - date.getTime();
  if (diff < 0) return 0;
  return Math.floor(diff / MS_PER_DAY);
}

/**
 * Higher score = higher portfolio priority (Recommended sort).
 * Weights align with DOC-160 §8.2 until DOC-152 owns the full algorithm.
 */
export function calculateRecommendedSortScore(input: RecommendedSortInput): number {
  const readinessPoints = READINESS_WEIGHT[input.readinessStatus];
  const criticalPoints = input.criticalRecommendationsCount * 25;
  const improvementPoints = (input.projectedImprovement ?? 0) * 2;
  const projectPoints = input.openProjectsCount * 5;
  const assessmentStaleness = Math.min(input.daysSinceLastAssessment ?? 0, 365);
  const improvementStaleness = Math.min(input.daysSinceLastImprovement ?? 0, 365);

  return (
    readinessPoints +
    criticalPoints +
    improvementPoints +
    projectPoints +
    assessmentStaleness * 0.5 +
    improvementStaleness * 0.75
  );
}
