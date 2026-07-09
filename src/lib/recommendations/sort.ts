import type { Priority } from "@/generated/prisma/client";

const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export type PrioritizedRecommendation = {
  priority: Priority;
  estimatedImpactPoints: number;
};

/** Sort by priority (critical first), then estimated impact descending. */
export function sortRecommendationsByPriority<T extends PrioritizedRecommendation>(
  recommendations: T[],
): T[] {
  return [...recommendations].sort((a, b) => {
    const priorityDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.estimatedImpactPoints - a.estimatedImpactPoints;
  });
}

export function takeTopRecommendations<T extends PrioritizedRecommendation>(
  recommendations: T[],
  limit: number,
): T[] {
  return sortRecommendationsByPriority(recommendations).slice(0, limit);
}
