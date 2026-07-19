"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BUSINESS_REVIEW_LABEL } from "@/lib/customer-deliverable-labels";
import { cn } from "@/lib/utils";
import type { DemoQuarterlyReview } from "@/lib/product-overview/types";

type QuarterlyReviewCardProps = {
  review: DemoQuarterlyReview;
  compact?: boolean;
  onPreview?: (anchor: HTMLElement) => void;
};

export function QuarterlyReviewCard({ review, compact = false, onPreview }: QuarterlyReviewCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className={cn("pb-3", compact && "px-4 pt-4")}>
        <CardTitle className={cn("text-base", compact && "text-sm")}>{BUSINESS_REVIEW_LABEL}</CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-4", compact && "px-4 pb-4")}>
        <div>
          <p className="text-sm text-muted-foreground">Next Business Review</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{review.nextReviewDate}</p>
          <p className="mt-1 text-sm text-muted-foreground">Status: {review.status}</p>
        </div>
        {!compact ? (
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <dt className="text-xs text-muted-foreground">Score change</dt>
              <dd className="mt-1 text-xl font-semibold text-success">+{review.scoreChange}</dd>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <dt className="text-xs text-muted-foreground">Projects completed</dt>
              <dd className="mt-1 text-xl font-semibold">{review.projectsCompleted}</dd>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <dt className="text-xs text-muted-foreground">Recommendations closed</dt>
              <dd className="mt-1 text-xl font-semibold">{review.recommendationsClosed}</dd>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <dt className="text-xs text-muted-foreground">Budget variance</dt>
              <dd className="mt-1 text-xl font-semibold">{review.budgetVariance}</dd>
            </div>
          </dl>
        ) : null}
        {!compact ? (
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={(event) => onPreview?.(event.currentTarget)}
          >
            Preview Executive Review
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
