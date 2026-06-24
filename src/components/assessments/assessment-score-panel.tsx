import { AlertTriangle, ArrowUpRight, ShieldAlert, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PRIORITY_LABELS } from "@/lib/display";
import { RATING_LABELS } from "@/lib/scoring";
import { getScoreBarColorClass, getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { AssessmentPreview } from "@/types/assessment-preview";
import type { Rating } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const RATING_VARIANT: Record<
  Rating,
  "success" | "default" | "secondary" | "warning" | "destructive"
> = {
  exceptional: "success",
  strong: "success",
  stable: "secondary",
  at_risk: "warning",
  critical: "destructive",
};

type AssessmentScorePanelProps = {
  preview: AssessmentPreview | null;
  saving?: boolean;
};

export function AssessmentScorePanel({ preview, saving }: AssessmentScorePanelProps) {
  if (!preview) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Loading analytics...
        </CardContent>
      </Card>
    );
  }

  const overallRating = preview.overallRating;

  return (
    <Card className="xl:sticky xl:top-6 xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Live Analytics
          </CardTitle>
          {saving ? (
            <Badge variant="outline" className="text-xs">
              Saving...
            </Badge>
          ) : preview.answeredCount > 0 ? (
            <Badge variant="secondary" className="text-xs">
              Saved
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Overall StackScore
          </p>
          <p
            className={cn(
              "text-5xl font-bold tabular-nums",
              getScoreTextColorClass(preview.overallScore),
            )}
          >
            {preview.overallScore !== null ? preview.overallScore : "—"}
          </p>
          {overallRating ? (
            <Badge variant={RATING_VARIANT[overallRating]} className="mt-2">
              {RATING_LABELS[overallRating]}
            </Badge>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Answer questions to preview score</p>
          )}
        </div>

        {preview.projectedScore !== null && preview.openRecommendationsCount > 0 ? (
          <div className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Projected if addressed</span>
            </div>
            <span className="text-lg font-bold tabular-nums text-primary">
              {preview.projectedScore}
            </span>
          </div>
        ) : null}

        <div className="rounded-md bg-muted/50 px-3 py-2 text-center text-sm">
          <span className="font-medium">{preview.answeredCount}</span>
          <span className="text-muted-foreground"> of {preview.totalCount} answered</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border px-3 py-2 text-center">
            <p className="text-2xl font-bold tabular-nums text-destructive">
              {preview.criticalFindingsCount}
            </p>
            <p className="text-xs text-muted-foreground">Critical Findings</p>
          </div>
          <div className="rounded-md border px-3 py-2 text-center">
            <p className="text-2xl font-bold tabular-nums">{preview.openRecommendationsCount}</p>
            <p className="text-xs text-muted-foreground">Open Recommendations</p>
          </div>
        </div>

        {preview.hasCriticalExposure ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Critical Exposure</p>
              <p className="text-muted-foreground">
                Immediate remediation recommended
              </p>
            </div>
          </div>
        ) : null}

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-medium">Category Scores</p>
          {preview.categoryScores.map((category) => (
            <div key={category.categoryId} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate">{category.categoryName}</span>
                <div className="flex shrink-0 items-center gap-2">
                  {category.rating ? (
                    <Badge variant={RATING_VARIANT[category.rating]} className="text-[10px]">
                      {RATING_LABELS[category.rating]}
                    </Badge>
                  ) : null}
                  <span className="font-medium tabular-nums">
                    {category.percentScore !== null ? Math.round(category.percentScore) : "—"}
                  </span>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    getScoreBarColorClass(category.percentScore),
                  )}
                  style={{ width: `${category.percentScore ?? 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {category.answeredCount}/{category.totalCount} answered
              </p>
            </div>
          ))}
        </div>

        {preview.topRisks.length > 0 ? (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-medium">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                Top Current Risks
              </p>
              <ul className="space-y-2">
                {preview.topRisks.map((risk) => (
                  <li
                    key={risk.categoryName}
                    className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
                  >
                    <span className="min-w-0 truncate">{risk.categoryName}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={RATING_VARIANT[risk.rating]} className="text-[10px]">
                        {RATING_LABELS[risk.rating]}
                      </Badge>
                      <span className="font-medium tabular-nums">
                        {Math.round(risk.percentScore)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}

        {preview.recommendations.length > 0 ? (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Open Recommendations ({preview.openRecommendationsCount})
              </p>
              <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {preview.recommendations.map((recommendation, index) => (
                  <li
                    key={`${recommendation.title}-${index}`}
                    className="rounded-md border p-2 text-sm"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          recommendation.priority === "critical" ? "destructive" : "secondary"
                        }
                        className="text-xs"
                      >
                        {PRIORITY_LABELS[recommendation.priority]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        +{recommendation.estimatedImpactPoints} pts
                      </span>
                    </div>
                    <p className="leading-snug">{recommendation.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {recommendation.categoryName}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
