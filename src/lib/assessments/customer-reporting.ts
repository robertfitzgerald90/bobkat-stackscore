/**
 * SS-REL-016 — Customer-facing maturity, count, and terminology helpers.
 *
 * DOC-119 six-level maturity is authoritative for customers.
 * Legacy Prisma Rating / MaturityTier enums remain for storage and staff tooling.
 */

import type { RecommendationStatus } from "@/generated/prisma/client";
import {
  getTechnologyMaturityLevel,
  getTechnologyMaturityLevelLabel,
  type TechnologyMaturityLevel,
} from "@/lib/scoring/v2/maturity-level";

/** Customer vocabulary — StackScore is the official assessment maturity score. */
export const CUSTOMER_TERM_STACKSCORE = "StackScore";

/** Customer vocabulary — completion of approved roadmap initiatives (not reassessment). */
export const CUSTOMER_TERM_ROADMAP_PROGRESS = "Roadmap Progress";

/** Customer vocabulary — actionable assessment recommendations still in play. */
export const CUSTOMER_TERM_IMPROVEMENT_OPPORTUNITIES = "Improvement Opportunities";

/**
 * Statuses that count as active improvement opportunities for customers.
 * Intentionally excludes deferred, declined, completed, and archived.
 * Do not treat “not completed” as open.
 */
export const CUSTOMER_ACTIVE_OPPORTUNITY_STATUSES: RecommendationStatus[] = [
  "open",
  "accepted",
  "in_progress",
];

export type CustomerRecommendationCounts = {
  /** Client-visible recommendations excluding declined/archived. */
  identified: number;
  /** status === open only */
  open: number;
  /** status === accepted */
  accepted: number;
  /** status === in_progress */
  inProgress: number;
  /** status === completed */
  completed: number;
  /** open + accepted + in_progress (improvement opportunities) */
  activeOpportunities: number;
  deferred: number;
  declined: number;
};

export function getCustomerMaturityLevel(score: number): TechnologyMaturityLevel {
  return getTechnologyMaturityLevel(score);
}

/** DOC-119 label for customer surfaces (Initial … Optimized). */
export function getCustomerMaturityLabel(score: number): string {
  return getTechnologyMaturityLevelLabel(score);
}

export function isCustomerActiveOpportunityStatus(status: RecommendationStatus): boolean {
  return CUSTOMER_ACTIVE_OPPORTUNITY_STATUSES.includes(status);
}

export function countCustomerRecommendations(
  recommendations: Array<{ status: RecommendationStatus }>,
): CustomerRecommendationCounts {
  const counts: CustomerRecommendationCounts = {
    identified: 0,
    open: 0,
    accepted: 0,
    inProgress: 0,
    completed: 0,
    activeOpportunities: 0,
    deferred: 0,
    declined: 0,
  };

  for (const row of recommendations) {
    switch (row.status) {
      case "open":
        counts.open += 1;
        counts.activeOpportunities += 1;
        counts.identified += 1;
        break;
      case "accepted":
        counts.accepted += 1;
        counts.activeOpportunities += 1;
        counts.identified += 1;
        break;
      case "in_progress":
        counts.inProgress += 1;
        counts.activeOpportunities += 1;
        counts.identified += 1;
        break;
      case "completed":
        counts.completed += 1;
        counts.identified += 1;
        break;
      case "deferred":
        counts.deferred += 1;
        counts.identified += 1;
        break;
      case "declined":
        counts.declined += 1;
        break;
      case "archived":
        break;
      default:
        break;
    }
  }

  return counts;
}

/**
 * Customer-facing label for recommendation count KPIs.
 * Prefer “Improvement Opportunities” for the active set; “Open” only when counting status=open.
 */
export function customerOpportunityCountLabel(count: number, kind: "active" | "open" = "active"): string {
  if (kind === "open") {
    return `${count} open recommendation${count === 1 ? "" : "s"}`;
  }
  return `${count} improvement opportunit${count === 1 ? "y" : "ies"}`;
}

/** Clarifies that roadmap completion does not rewrite official StackScore. */
export function customerRoadmapProgressFootnote(): string {
  return (
    "Roadmap progress tracks approved improvement initiatives. " +
    "Official StackScore updates only after a completed reassessment."
  );
}
