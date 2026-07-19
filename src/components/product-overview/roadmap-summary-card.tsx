"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DemoRoadmapQuarter } from "@/lib/product-overview/types";

type RoadmapSummaryCardProps = {
  completionPercent: number;
  quarters: DemoRoadmapQuarter[];
  compact?: boolean;
  onExplore?: () => void;
};

export function RoadmapSummaryCard({
  completionPercent,
  quarters,
  compact = false,
  onExplore,
}: RoadmapSummaryCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className={cn("pb-3", compact && "px-4 pt-4")}>
        <CardTitle className={cn("text-base", compact && "text-sm")}>Roadmap Summary</CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-4", compact && "px-4 pb-4")}>
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current roadmap progress</span>
            <span className="font-semibold tabular-nums">{completionPercent}% complete</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
        <div className="space-y-3">
          {quarters.slice(0, compact ? 2 : quarters.length).map((quarter) => (
            <div key={quarter.quarter} className="rounded-lg border border-border/60 p-3">
              <p className="text-sm font-medium text-foreground">{quarter.quarter}</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {quarter.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {!compact ? (
          <Button variant="outline" className="w-full sm:w-auto" onClick={onExplore}>
            Explore Roadmap Preview
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
