import type { Priority } from "@/generated/prisma/client";
import catalog from "../../../data/RecommendationRuleCatalog.json";

export const RECOMMENDATION_PRIORITY_ORDER: Priority[] = [
  "critical",
  "high",
  "medium",
  "low",
];

export const PRIORITY_TIMELINES: Record<Priority, string> = {
  critical: catalog.priorityTimelines.critical,
  high: catalog.priorityTimelines.high,
  medium: catalog.priorityTimelines.medium,
  low: catalog.priorityTimelines.low,
};

export function getPriorityTimeline(priority: Priority): string {
  return PRIORITY_TIMELINES[priority];
}

export function sortByRecommendationPriority<
  T extends { priority: Priority; estimatedImpactPoints: number },
>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    const priorityDiff =
      RECOMMENDATION_PRIORITY_ORDER.indexOf(left.priority) -
      RECOMMENDATION_PRIORITY_ORDER.indexOf(right.priority);
    if (priorityDiff !== 0) return priorityDiff;
    return right.estimatedImpactPoints - left.estimatedImpactPoints;
  });
}

export function groupRecommendationsByPriority<
  T extends { priority: Priority },
>(items: T[]): Array<{ priority: Priority; items: T[] }> {
  return RECOMMENDATION_PRIORITY_ORDER.map((priority) => ({
    priority,
    items: items.filter((item) => item.priority === priority),
  })).filter((group) => group.items.length > 0);
}
