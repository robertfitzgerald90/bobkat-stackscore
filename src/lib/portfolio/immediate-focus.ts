import type { Priority, RecommendationStatus } from "@/generated/prisma/client";
import {
  PORTFOLIO_OPEN_RECOMMENDATION_STATUSES,
  PORTFOLIO_URGENT_PRIORITIES,
} from "@/lib/portfolio/constants";

export type ImmediateFocusRecommendation = {
  priority: Priority;
  status: RecommendationStatus;
};

export type ImmediateFocusInput = {
  recommendations: ImmediateFocusRecommendation[];
  hasDraftAssessment: boolean;
  isReassessmentOverdue: boolean;
};

/** Counts urgent portfolio signals: draft assessment, overdue reassessment, critical/high open recs (DOC-160). */
export function countImmediateFocusItems(input: ImmediateFocusInput): number {
  let count = 0;

  if (input.hasDraftAssessment) {
    count += 1;
  }

  if (input.isReassessmentOverdue) {
    count += 1;
  }

  for (const recommendation of input.recommendations) {
    if (!PORTFOLIO_OPEN_RECOMMENDATION_STATUSES.includes(recommendation.status)) {
      continue;
    }
    if (PORTFOLIO_URGENT_PRIORITIES.includes(recommendation.priority)) {
      count += 1;
    }
  }

  return count;
}
