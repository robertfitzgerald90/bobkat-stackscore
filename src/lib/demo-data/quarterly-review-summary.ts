import type { QuarterlyReviewSummaryProps } from "@/components/quarterly-reviews/quarterly-review-summary";

/** Static demo data for public marketing previews — never loaded from the database. */
export const quarterlyReviewSummaryDemoData: QuarterlyReviewSummaryProps = {
  currentQuarter: "Q3 2026",
  previousReviewDate: "2026-06-30T00:00:00.000Z",
  nextReviewDate: "2026-09-30T00:00:00.000Z",
  supportingText: "Completed reviews will appear in the quarterly reviews workspace.",
  readOnly: true,
  showGenerateReport: true,
};
