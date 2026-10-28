/**
 * SS-REL-015 — Customer trust presentation helpers.
 *
 * Catalog-impact projection math remains available for staff/internal use.
 * Customer surfaces must not present that heuristic as a future StackScore.
 */

import type { UserRole } from "@/generated/prisma/client";
import { isClientFacingRecommendationAudience } from "@/lib/recommendations/visibility";

/**
 * Absolute demonstrated-strength floor = DOC-119 Developing band (≥55).
 * SS-REL-016 review: keep absolute maturity threshold (not relative ranking alone).
 * Pillars below Developing are gaps/risks, not “strengths,” even if relatively highest.
 * Separate approval required to switch to relative-only or dual “demonstrated vs comparative” framing.
 */
export const MEANINGFUL_STRENGTH_MIN_PERCENT = 55;

export type StrengthPillarCandidate = {
  categoryName: string;
  percentScore: number;
};

/**
 * Select demonstrated assessment strengths from pillar/category scores.
 * Does not use recommendation titles. Returns empty when evidence is weak.
 */
export function selectDemonstratedAssessmentStrengths(
  pillars: StrengthPillarCandidate[],
  options?: { limit?: number; minPercent?: number },
): string[] {
  const limit = options?.limit ?? 3;
  const minPercent = options?.minPercent ?? MEANINGFUL_STRENGTH_MIN_PERCENT;
  return [...pillars]
    .filter((pillar) => Number.isFinite(pillar.percentScore) && pillar.percentScore >= minPercent)
    .sort((a, b) => b.percentScore - a.percentScore)
    .slice(0, limit)
    .map((pillar) => pillar.categoryName);
}

/** True when catalog-impact projected maturity may be shown for this audience. */
export function exposeCatalogProjectedMaturity(role: UserRole): boolean {
  return !isClientFacingRecommendationAudience(role);
}

/**
 * Customer-safe opportunity language — no catalog-impact projected StackScore figures.
 */
export function buildCustomerOpportunityFollowThroughParagraph(): string {
  return (
    "Addressing the prioritized recommendations in this report will strengthen technology maturity over time. " +
    "Actual outcomes depend on implementation quality, sequencing, and organizational follow-through. " +
    "StackScore improvement is confirmed through reassessment after remediation work is completed."
  );
}

/**
 * Client profile KPIs must not inherit unfinished TIP wizard projection or catalog-impact
 * projected maturity numbers (SS-REL-015 / REL-014-H2 / REL-014-C1).
 * Staff retain tip-derived or recommendation-fallback projection for planning.
 */
export function resolveAudienceProjectedMaturityKpi(input: {
  isClientAudience: boolean;
  tipProjectedScore: number | null;
  catalogFallbackProjectedScore: number | null;
}): number | null {
  if (input.isClientAudience) return null;
  return input.tipProjectedScore ?? input.catalogFallbackProjectedScore;
}
