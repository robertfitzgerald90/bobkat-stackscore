import { QuarterlyReviewSummary } from "@/components/quarterly-reviews/quarterly-review-summary";
import type { QuarterlyReviewSummaryProps } from "@/components/quarterly-reviews/quarterly-review-summary";
import { cn } from "@/lib/utils";

type QuarterlyReviewPreviewProps = {
  data: QuarterlyReviewSummaryProps;
  className?: string;
};

/**
 * Focused Business Reviews summary panel for marketing pages.
 * Static demo data only — no auth, database, or interactive controls.
 */
export function QuarterlyReviewPreview({ data, className }: QuarterlyReviewPreviewProps) {
  return (
    <div className={cn("w-full min-w-0", className)} aria-label="Quarterly reviews preview">
      <QuarterlyReviewSummary {...data} readOnly compact />
    </div>
  );
}
