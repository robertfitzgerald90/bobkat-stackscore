import type { ProjectStatus } from "@/generated/prisma/client";
import type { PortfolioReadinessStatus } from "@/lib/portfolio/types";
import { ACTIVE_PROJECT_STATUSES } from "@/lib/portfolio/constants";

export type PortfolioReadinessInput = {
  openRecommendationsCount: number;
  openProjectsCount: number;
  activeProjectsCount: number;
  proposedProjectsCount: number;
  actionableRecommendationsCount: number;
  blockedRecommendationsCount: number;
  criticalRecommendationsCount: number;
  highPriorityRecommendationsCount: number;
  hasDraftAssessment: boolean;
  isReassessmentOverdue: boolean;
};

export function isActionableProjectStatus(status: ProjectStatus): boolean {
  return ACTIVE_PROJECT_STATUSES.includes(status);
}

export function isBlockedProjectStatus(status: ProjectStatus): boolean {
  return status === "proposed";
}

/**
 * Evaluates portfolio readiness per DOC-160 §7.
 * Precedence when multiple signals apply: blocked > ready > partial > healthy.
 */
export function evaluatePortfolioReadiness(
  input: PortfolioReadinessInput,
): PortfolioReadinessStatus {
  const hasOpenWork =
    input.openRecommendationsCount > 0 ||
    input.openProjectsCount > 0 ||
    input.hasDraftAssessment;

  const hasActionableWork =
    input.activeProjectsCount > 0 || input.actionableRecommendationsCount > 0;

  const hasBlockedWork =
    input.blockedRecommendationsCount > 0 || input.proposedProjectsCount > 0;

  const hasUrgentWork =
    input.criticalRecommendationsCount > 0 ||
    input.highPriorityRecommendationsCount > 0 ||
    input.isReassessmentOverdue ||
    input.hasDraftAssessment;

  if (hasOpenWork && !hasActionableWork) {
    return "blocked";
  }

  if (hasActionableWork && hasBlockedWork) {
    return "partial";
  }

  if (hasActionableWork) {
    return "ready";
  }

  if (hasUrgentWork) {
    return "blocked";
  }

  if (!hasOpenWork && !hasUrgentWork) {
    return "healthy";
  }

  return "healthy";
}
