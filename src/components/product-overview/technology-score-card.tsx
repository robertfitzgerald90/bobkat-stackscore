"use client";

import { useState } from "react";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TechnologyScoreState } from "@/lib/product-overview/types";

type TechnologyScoreCardProps = {
  scoreState: TechnologyScoreState;
  compact?: boolean;
  readOnly?: boolean;
};

export function TechnologyScoreCard({ scoreState, compact = false, readOnly = false }: TechnologyScoreCardProps) {
  const [view, setView] = useState<"current" | "projected">("current");
  const active =
    view === "current"
      ? {
          score: scoreState.score,
          maturityLabel: scoreState.maturityLabel,
        }
      : {
          score: scoreState.projectedScore,
          maturityLabel: scoreState.projectedMaturityLabel,
        };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className={cn("pb-3", compact && "px-4 pt-4")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className={cn("text-base", compact && "text-sm")}>Overall Technology Score</CardTitle>
            {!compact ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Executive view of current posture and approved roadmap target
              </p>
            ) : null}
          </div>
          {!readOnly ? (
            <div className="inline-flex rounded-full border border-border bg-muted/40 p-1">
              {(["current", "projected"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={view === option}
                  onClick={() => setView(option)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    view === option ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  {option === "current" ? "Current State" : "Projected State"}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className={cn(compact && "px-4 pb-4")}>
        <div className="flex items-end gap-4">
          <div>
            <p className={cn("font-semibold tabular-nums text-foreground", compact ? "text-4xl" : "text-5xl")}>
              {active.score}
              <span className="text-lg text-muted-foreground">/{scoreState.maxScore}</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{active.maturityLabel}</Badge>
              {view === "current" ? (
                <span className="inline-flex items-center gap-1 text-sm text-success">
                  <TrendingUp className="h-4 w-4" aria-hidden />
                  +{scoreState.changeSinceLastReview} since last review
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                  Target after approved roadmap
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{scoreState.projectedNote}</p>
      </CardContent>
    </Card>
  );
}
