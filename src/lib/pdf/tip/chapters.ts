/**
 * Intentional chapter rhythm for the TIP executive PDF.
 *
 * Each chapter is rendered as its own `<Page wrap>` so major sections begin at the
 * top of a fresh sheet instead of filling leftover space on the prior page.
 *
 * Page 1 — Cover
 * Page 2 — Assessment Scope + Executive Summary
 * Page 3 — Business Value Snapshot (+ Current State Findings continues here)
 * Page 4+ — Strategic Improvement Roadmap (implementation phases)
 * Next — Phase Investment Summary
 * Next — From Roadmap to Results + Next Steps
 */

export const TIP_PDF_CHAPTER_ORDER = [
  "opening",
  "valueAndFindings",
  "implementation",
  "investment",
  "outcomes",
] as const;

export type TipPdfChapterId = (typeof TIP_PDF_CHAPTER_ORDER)[number];
