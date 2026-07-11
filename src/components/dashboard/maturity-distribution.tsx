import type { Rating } from "@/generated/prisma/client";
import {
  MATURITY_CATEGORY_ORDER,
  RATING_DISPLAY_LABELS,
} from "@/lib/scoring/rating-display";
import { cn } from "@/lib/utils";

const BAR_COLORS: Record<Rating, string> = {
  critical: "bg-destructive",
  at_risk: "bg-warning",
  stable: "bg-chart-2",
  strong: "bg-success",
  exceptional: "bg-success",
};

type MaturityDistributionProps = {
  distribution: Record<Rating, number>;
};

export function MaturityDistribution({ distribution }: MaturityDistributionProps) {
  const total = MATURITY_CATEGORY_ORDER.reduce(
    (sum, rating) => sum + distribution[rating],
    0,
  );

  if (total === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
        No assessed clients yet. Distribution appears after assessments are completed.
      </p>
    );
  }

  const maxCount = Math.max(...MATURITY_CATEGORY_ORDER.map((rating) => distribution[rating]));

  return (
    <div className="space-y-3">
      {MATURITY_CATEGORY_ORDER.map((rating) => {
        const count = distribution[rating];
        const widthPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;

        return (
          <div key={rating} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-foreground">{RATING_DISPLAY_LABELS[rating]}</span>
              <span className="tabular-nums text-muted-foreground">
                {count} client{count === 1 ? "" : "s"}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", BAR_COLORS[rating])}
                style={{ width: `${widthPercent}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-xs text-muted-foreground">
        {total} assessed client{total === 1 ? "" : "s"} across maturity categories
      </p>
    </div>
  );
}
