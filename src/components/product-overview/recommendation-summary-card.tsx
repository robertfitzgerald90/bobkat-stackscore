"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLIENT_METRIC_WELL, CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { cn } from "@/lib/utils";
import type { DemoDashboardMetrics } from "@/lib/product-overview/types";

type RecommendationSummaryCardProps = {
  metrics: DemoDashboardMetrics;
  compact?: boolean;
  onViewExample?: () => void;
};

export function RecommendationSummaryCard({
  metrics,
  compact = false,
  onViewExample,
}: RecommendationSummaryCardProps) {
  return (
    <Card className={CLIENT_SURFACE_CARD}>
      <CardHeader className={cn("pb-3", compact && "px-4 pt-4")}>
        <CardTitle className={cn("text-base", compact && "text-sm")}>Recommendation Summary</CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-4", compact && "px-4 pb-4")}>
        <dl className="grid grid-cols-2 gap-3">
          <div className={CLIENT_METRIC_WELL}>
            <dt className="text-xs text-muted-foreground">Open recommendations</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{metrics.openRecommendations}</dd>
          </div>
          <div className={CLIENT_METRIC_WELL}>
            <dt className="text-xs text-muted-foreground">High priority</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{metrics.highPriorityRecommendations}</dd>
          </div>
          <div className={CLIENT_METRIC_WELL}>
            <dt className="text-xs text-muted-foreground">Quick wins</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{metrics.quickWins}</dd>
          </div>
          <div className={CLIENT_METRIC_WELL}>
            <dt className="text-xs text-muted-foreground">Planned this quarter</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{metrics.plannedThisQuarter}</dd>
          </div>
        </dl>
        {!compact ? (
          <Button variant="outline" className="w-full sm:w-auto" onClick={onViewExample}>
            View Example Recommendation
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
