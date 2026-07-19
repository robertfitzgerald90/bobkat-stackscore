import { TIP_PAGINATION, TIP_PDF_PAGE, TIP_PDF_SPACING, TIP_PDF_TYPOGRAPHY } from "@/lib/pdf/tip/tokens";
import type { TipCategoryFinding, TipStrategicInitiative } from "@/lib/pdf/types";

const CONTENT_WIDTH = 612 - TIP_PDF_SPACING.pagePaddingX * 2;

function estimateWrappedLines(text: string, fontSize: number, lineHeight: number, width = CONTENT_WIDTH) {
  const avgCharWidth = fontSize * 0.48;
  const charsPerLine = Math.max(18, Math.floor(width / avgCharWidth));
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  return lines * fontSize * lineHeight;
}

/**
 * Rough card-height estimate (pt) so normal cards can use wrap={false}
 * while oversized cards split only between logical groups.
 */
export function estimateInitiativeCardHeight(initiative: TipStrategicInitiative): number {
  const padY = TIP_PDF_SPACING.cardPaddingY * 2;
  const title = estimateWrappedLines(
    initiative.name,
    TIP_PDF_TYPOGRAPHY.initiativeTitle,
    1.2,
  );
  const badges = 18;
  const objective =
    TIP_PDF_TYPOGRAPHY.label +
    4 +
    estimateWrappedLines(initiative.businessObjective, TIP_PDF_TYPOGRAPHY.body, 1.4);
  const why =
    TIP_PDF_TYPOGRAPHY.label +
    4 +
    estimateWrappedLines(initiative.whyItMatters, TIP_PDF_TYPOGRAPHY.body, 1.4);
  const benefits =
    initiative.expectedBenefits.length > 0
      ? TIP_PDF_TYPOGRAPHY.label +
        4 +
        initiative.expectedBenefits.reduce(
          (sum, benefit) =>
            sum + estimateWrappedLines(benefit, TIP_PDF_TYPOGRAPHY.body, 1.35, CONTENT_WIDTH - 16),
          0,
        )
      : 0;

  return (
    padY +
    title +
    TIP_PDF_SPACING.titleGap +
    badges +
    TIP_PDF_SPACING.badgeToContent +
    objective +
    TIP_PDF_SPACING.fieldGap +
    why +
    (benefits ? TIP_PDF_SPACING.fieldGap + benefits : 0) +
    TIP_PDF_SPACING.block
  );
}

export function estimateFindingCardHeight(finding: TipCategoryFinding): number {
  const padY = TIP_PDF_SPACING.cardPaddingY * 2;
  const title = estimateWrappedLines(finding.categoryName, TIP_PDF_TYPOGRAPHY.findingTitle, 1.2);
  const badges = 18;
  const current =
    TIP_PDF_TYPOGRAPHY.label +
    4 +
    estimateWrappedLines(finding.currentState, TIP_PDF_TYPOGRAPHY.body, 1.4);
  const impact =
    TIP_PDF_TYPOGRAPHY.label +
    4 +
    estimateWrappedLines(finding.businessImpact, TIP_PDF_TYPOGRAPHY.body, 1.4);
  return padY + title + badges + current + impact + TIP_PDF_SPACING.block + 16;
}

/** Section accent, title rule, and optional subtitle chrome (pt). */
export function estimateSectionChromeHeight(hasSubtitle: boolean): number {
  return hasSubtitle ? 52 : 40;
}

export function estimateBusinessValueMetricCardHeight(): number {
  return 72;
}

/** First row of snapshot cards (two 48%-width cards). */
export function estimateBusinessValueFirstRowHeight(metricCount: number): number {
  return metricCount > 0 ? estimateBusinessValueMetricCardHeight() : 0;
}

export function estimateExecutiveHeroHeight(): number {
  return 118;
}

export function estimateScopeBoxHeight(): number {
  return 58;
}

export function estimateCalloutIntroHeight(paragraphCount = 2): number {
  return 34 + paragraphCount * 26;
}

export function estimateNextStepCardHeight(): number {
  return 56;
}

export function estimateInvestmentTableHeight(rowCount: number): number {
  return 26 + rowCount * 22;
}

/** Header chrome + first block — used to keep section titles with their opening content. */
export function estimateSectionIntroHeight(
  hasSubtitle: boolean,
  firstBlockHeight: number,
): number {
  return estimateSectionChromeHeight(hasSubtitle) + firstBlockHeight;
}

export function canKeepCardIntact(estimatedHeight: number): boolean {
  return (
    estimatedHeight <=
    TIP_PDF_PAGE.printableContentHeight * TIP_PAGINATION.maxUnbrokenCardRatio
  );
}

/** Presence needed before starting a card so headers are never stranded. */
export function cardStartPresence(estimatedHeight: number, intactFallback: number): number {
  if (canKeepCardIntact(estimatedHeight)) {
    return Math.min(estimatedHeight + 8, Math.floor(TIP_PDF_PAGE.printableContentHeight * 0.85));
  }
  return intactFallback;
}
