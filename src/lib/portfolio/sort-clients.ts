import type { PortfolioClientCard, PortfolioReadinessStatus } from "@/lib/portfolio/types";

export type PortfolioSortMode =
  | "recommended"
  | "needs_attention"
  | "biggest_opportunity"
  | "recently_active"
  | "alphabetical";

export const PORTFOLIO_SORT_OPTIONS: Array<{ value: PortfolioSortMode; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "needs_attention", label: "Needs Attention" },
  { value: "biggest_opportunity", label: "Biggest Opportunity" },
  { value: "recently_active", label: "Recently Active" },
  { value: "alphabetical", label: "Alphabetical" },
];

const READINESS_PRIORITY: Record<PortfolioReadinessStatus, number> = {
  blocked: 4,
  ready: 3,
  partial: 2,
  healthy: 1,
};

function projectedGap(card: PortfolioClientCard): number {
  if (card.currentStackScore === null || card.projectedStackScore === null) return 0;
  return card.projectedStackScore - card.currentStackScore;
}

function lastAssessmentTime(card: PortfolioClientCard): number {
  if (!card.lastAssessmentDate) return 0;
  return new Date(card.lastAssessmentDate).getTime();
}

/** Applies Portfolio sort modes from DOC-160 §8; ties break on client name ascending. */
export function sortPortfolioClients(
  clients: PortfolioClientCard[],
  mode: PortfolioSortMode,
): PortfolioClientCard[] {
  const sorted = [...clients];

  switch (mode) {
    case "recommended":
      sorted.sort((left, right) => {
        const scoreDiff = right.recommendedSortScore - left.recommendedSortScore;
        if (scoreDiff !== 0) return scoreDiff;
        return left.companyName.localeCompare(right.companyName);
      });
      break;
    case "needs_attention":
      sorted.sort((left, right) => {
        const readinessDiff =
          READINESS_PRIORITY[right.readinessStatus] - READINESS_PRIORITY[left.readinessStatus];
        if (readinessDiff !== 0) return readinessDiff;
        const criticalDiff =
          right.criticalRecommendationsCount - left.criticalRecommendationsCount;
        if (criticalDiff !== 0) return criticalDiff;
        const focusDiff = right.immediateFocusCount - left.immediateFocusCount;
        if (focusDiff !== 0) return focusDiff;
        return left.companyName.localeCompare(right.companyName);
      });
      break;
    case "biggest_opportunity":
      sorted.sort((left, right) => {
        const gapDiff = projectedGap(right) - projectedGap(left);
        if (gapDiff !== 0) return gapDiff;
        return left.companyName.localeCompare(right.companyName);
      });
      break;
    case "recently_active":
      sorted.sort((left, right) => {
        const dateDiff = lastAssessmentTime(right) - lastAssessmentTime(left);
        if (dateDiff !== 0) return dateDiff;
        return left.companyName.localeCompare(right.companyName);
      });
      break;
    case "alphabetical":
      sorted.sort((left, right) => left.companyName.localeCompare(right.companyName));
      break;
  }

  return sorted;
}
