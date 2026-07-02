import type { Priority, RecommendationStatus } from "@/generated/prisma/client";
import { OPEN_PROJECT_STATUSES, ACTIVE_PROJECT_STATUSES } from "@/lib/projects";

/** Open recommendations counted on portfolio cards (excludes deferred per dashboard alignment). */
export const PORTFOLIO_OPEN_RECOMMENDATION_STATUSES: RecommendationStatus[] = [
  "open",
  "accepted",
  "in_progress",
];

/** Priorities that contribute to Immediate Focus and urgency signals. */
export const PORTFOLIO_URGENT_PRIORITIES: Priority[] = ["critical", "high"];

export const PORTFOLIO_SPARKLINE_POINT_COUNT = 8;

export { OPEN_PROJECT_STATUSES, ACTIVE_PROJECT_STATUSES };
