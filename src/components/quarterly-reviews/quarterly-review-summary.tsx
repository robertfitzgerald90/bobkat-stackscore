import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { formatDisplayDate } from "@/lib/display";
import { cn } from "@/lib/utils";

export type QuarterlyReviewSummaryProps = {
  currentQuarter: string;
  nextReviewDate: string | null;
  previousReviewDate?: string | null;
  supportingText?: string;
  readOnly?: boolean;
  compact?: boolean;
  showGenerateReport?: boolean;
  viewReviewsHref?: string;
  generateReportHref?: string;
  onViewReviews?: () => void;
  onGenerateReport?: () => void;
};

function formatReviewDate(value: string | null | undefined, fallback: string) {
  return value ? formatDisplayDate(value) : fallback;
}

function PreviewActionButton({ label }: { label: string }) {
  return (
    <span
      aria-disabled="true"
      tabIndex={-1}
      className={cn(
        buttonClassName({ variant: "outline" }),
        "cursor-default hover:bg-background dark:hover:bg-card",
      )}
    >
      {label}
    </span>
  );
}

export function QuarterlyReviewSummary({
  currentQuarter,
  nextReviewDate,
  previousReviewDate = null,
  supportingText = "Completed reviews will appear in the quarterly reviews workspace.",
  readOnly = false,
  compact = false,
  showGenerateReport = true,
  viewReviewsHref,
  generateReportHref,
  onViewReviews,
  onGenerateReport,
}: QuarterlyReviewSummaryProps) {
  return (
    <Card className={cn(CLIENT_SURFACE_CARD, compact && "shadow-sm")}>
      <CardHeader className={cn(compact && "pb-3")}>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-primary" />
          Quarterly Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-3 text-sm", compact && "pt-0")}>
        <p>Current quarter: {currentQuarter}</p>
        <p>Next scheduled review: {formatReviewDate(nextReviewDate, "Not scheduled")}</p>
        <p>Previous review: {formatReviewDate(previousReviewDate, "None yet")}</p>
        <p className="text-muted-foreground">{supportingText}</p>
        <div className="flex flex-wrap gap-2">
          {readOnly ? (
            <>
              <PreviewActionButton label="View Reviews" />
              {showGenerateReport ? <PreviewActionButton label="Generate Report" /> : null}
            </>
          ) : (
            <>
              {viewReviewsHref ? (
                <Link href={viewReviewsHref} className={buttonClassName({ variant: "outline" })}>
                  View Reviews
                </Link>
              ) : onViewReviews ? (
                <button
                  type="button"
                  onClick={onViewReviews}
                  className={buttonClassName({ variant: "outline" })}
                >
                  View Reviews
                </button>
              ) : null}
              {showGenerateReport ? (
                generateReportHref ? (
                  <Link
                    href={generateReportHref}
                    className={buttonClassName({ variant: "outline" })}
                  >
                    Generate Report
                  </Link>
                ) : onGenerateReport ? (
                  <button
                    type="button"
                    onClick={onGenerateReport}
                    className={buttonClassName({ variant: "outline" })}
                  >
                    Generate Report
                  </button>
                ) : null
              ) : null}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
