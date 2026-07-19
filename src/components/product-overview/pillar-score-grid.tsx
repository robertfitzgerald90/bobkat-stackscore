"use client";

import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_FEATURE_ATTR, demoFeatureKey } from "@/lib/product-overview/feature-popover-types";
import { cn } from "@/lib/utils";
import type { DemoPillar } from "@/lib/product-overview/types";

type PillarScoreGridProps = {
  pillars: DemoPillar[];
  compact?: boolean;
  onPillarClick?: (pillarId: string, anchor: HTMLElement) => void;
};

export function PillarScoreGrid({ pillars, compact = false, onPillarClick }: PillarScoreGridProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className={cn("pb-3", compact && "px-4 pt-4")}>
        <CardTitle className={cn("text-base", compact && "text-sm")}>Technology Pillar Scores</CardTitle>
        {!compact ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Click a pillar to explore risks, recommendations, and business impact.
          </p>
        ) : null}
      </CardHeader>
      <CardContent className={cn(compact && "px-4 pb-4")}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => (
            <button
              key={pillar.id}
              type="button"
              {...{ [DEMO_FEATURE_ATTR]: demoFeatureKey("pillar", pillar.id) }}
              onClick={(event) => onPillarClick?.(pillar.id, event.currentTarget)}
              className="rounded-xl border border-border/70 bg-background p-4 text-left transition-colors hover:border-primary/30 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{pillar.name}</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{pillar.score}</p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </div>
              <Badge variant="outline" className="mt-3">
                {pillar.maturityLabel}
              </Badge>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
