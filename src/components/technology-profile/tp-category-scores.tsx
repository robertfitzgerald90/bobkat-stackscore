import { ArrowDown, ArrowUp, BarChart3, Lightbulb, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { hasAnyCategoryScore } from "@/lib/technology-profile/display";
import { getScoreBarColorClass, getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { CategoryScoreInsight } from "@/lib/technology-profile/types";
import { cn } from "@/lib/utils";

type TpCategoryScoresProps = {
  clientId: string;
  insights: CategoryScoreInsight[];
  assessmentsCompleted: number;
  showRecommendationCounts?: boolean;
};

function TrendIndicator({ delta }: { delta: number | null }) {
  if (delta === null) return null;

  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-primary">
        <ArrowUp className="h-3 w-3" />+{delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-destructive">
        <ArrowDown className="h-3 w-3" />
        {delta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" />
      0
    </span>
  );
}

export function TpCategoryScores({
  clientId,
  insights,
  assessmentsCompleted,
  showRecommendationCounts = true,
}: TpCategoryScoresProps) {
  const scored = hasAnyCategoryScore(insights);

  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle>Category Maturity</CardTitle>
        <CardDescription>
          v2 technology categories with score trends and open opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!scored ? (
          <TpEmptyState
            icon={BarChart3}
            title="Categories not assessed"
            message="Category scores appear after the first completed assessment. Productivity and other v2 categories will populate as assessments cover those domains."
            actionLabel={assessmentsCompleted === 0 ? "Start assessment" : undefined}
            actionHref={
              assessmentsCompleted === 0 ? clientTechnologyProfilePath(clientId) : undefined
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {insights.map((insight) => {
              const hasScore = insight.percentScore !== null;
              const score = insight.percentScore ?? 0;

              return (
                <div
                  key={insight.categoryCode}
                  className="flex min-h-[140px] flex-col gap-3 rounded-lg border border-border/60 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-tight">{insight.categoryName}</p>
                    <TrendIndicator delta={insight.trendDelta} />
                  </div>

                  {hasScore ? (
                    <>
                      <p
                        className={cn(
                          "text-3xl font-bold tabular-nums",
                          getScoreTextColorClass(score),
                        )}
                      >
                        {Math.round(score)}
                      </p>
                      {insight.maturityTier ? (
                        <Badge variant="outline" className="w-fit text-[10px]">
                          {insight.maturityTier}
                        </Badge>
                      ) : null}
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", getScoreBarColorClass(score))}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not assessed</p>
                  )}

                  {showRecommendationCounts && insight.openRecommendationCount > 0 ? (
                    <p className="mt-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <Lightbulb className="h-3 w-3" />
                      {insight.openRecommendationCount} open{" "}
                      {insight.openRecommendationCount === 1 ? "opportunity" : "opportunities"}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
