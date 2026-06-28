import Link from "next/link";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ImprovementSummary } from "@/lib/assessments/reassessment";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { RATING_DISPLAY_LABELS } from "@/lib/scoring/rating-display";
import { getRating } from "@/lib/scoring";
import { getScoreBarColorClass, getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

type ImprovementSummaryViewProps = {
  clientId: string;
  clientName: string;
  summary: ImprovementSummary;
};

export function ImprovementSummaryView({
  clientId,
  clientName,
  summary,
}: ImprovementSummaryViewProps) {
  const currentRating = getRating(summary.currentOverallScore);
  const previousRating = getRating(summary.previousOverallScore);

  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="page-header">
          <p className="text-sm text-muted-foreground">{clientName}</p>
          <h2 className="page-title">Improvement Summary</h2>
          <p className="page-description">
            Comparing {summary.currentAssessmentName} against {summary.sourceAssessmentName}
          </p>
        </div>
        <div className="action-bar">
          <Link
            href={`/assessments/${summary.currentAssessmentId}/results`}
            className={buttonClassName({ variant: "outline", className: "w-full sm:w-auto" })}
          >
            View Results
          </Link>
          <Link
            href={clientTechnologyProfilePath(clientId)}
            className={buttonClassName({ variant: "ghost", className: "w-full sm:w-auto" })}
          >
            Back to Technology Profile
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="StackScore Change"
          value={`${summary.scoreChange > 0 ? "+" : ""}${summary.scoreChange}`}
          subtitle={`${summary.previousOverallScore} → ${summary.currentOverallScore}`}
          tone={
            summary.scoreChange > 0 ? "positive" : summary.scoreChange < 0 ? "negative" : "neutral"
          }
        />
        <MetricCard
          title="Critical Finding Reduction"
          value={String(summary.criticalFindingReduction)}
          subtitle={`${summary.previousCriticalFindings} → ${summary.currentCriticalFindings}`}
          tone={summary.criticalFindingReduction > 0 ? "positive" : "neutral"}
        />
        <MetricCard
          title="Recommendation Closure Rate"
          value={`${summary.recommendationClosureRate}%`}
          subtitle={`${summary.sourceRecommendationsCompleted} of ${summary.sourceRecommendationCount} prior recommendations completed`}
          tone={summary.recommendationClosureRate >= 50 ? "positive" : "neutral"}
        />
        <MetricCard
          title="New Recommendations"
          value={String(summary.newRecommendationCount)}
          subtitle="Generated in this reassessment"
          tone="neutral"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Overall Score Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase text-muted-foreground">Previous</p>
                <p
                  className={cn(
                    "text-3xl font-bold tabular-nums",
                    getScoreTextColorClass(summary.previousOverallScore),
                  )}
                >
                  {summary.previousOverallScore}
                </p>
                <Badge variant="outline" className="mt-2">
                  {RATING_DISPLAY_LABELS[previousRating]}
                </Badge>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs uppercase text-muted-foreground">Current</p>
                <p
                  className={cn(
                    "text-3xl font-bold tabular-nums",
                    getScoreTextColorClass(summary.currentOverallScore),
                  )}
                >
                  {summary.currentOverallScore}
                </p>
                <Badge variant="outline" className="mt-2">
                  {RATING_DISPLAY_LABELS[currentRating]}
                </Badge>
              </div>
            </div>
            <ChangeIndicator change={summary.scoreChange} label="point change" />
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Category Score Changes</CardTitle>
            <CardDescription>Point change by maturity category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.categoryChanges.map((category) => (
              <div key={category.categoryId} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{category.categoryName}</span>
                  <div className="flex items-center gap-3 tabular-nums">
                    <span className="text-muted-foreground">{category.previousScore}</span>
                    <span>→</span>
                    <span className={getScoreTextColorClass(category.currentScore)}>
                      {category.currentScore}
                    </span>
                    <ChangeIndicator change={category.change} compact />
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", getScoreBarColorClass(category.currentScore))}
                    style={{ width: `${category.currentScore}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;
  tone: "positive" | "negative" | "neutral";
}) {
  return (
    <Card className="stat-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-3xl font-bold tabular-nums",
            tone === "positive" && "text-success",
            tone === "negative" && "text-destructive",
            tone === "neutral" && "text-brand",
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function ChangeIndicator({
  change,
  label,
  compact = false,
}: {
  change: number;
  label?: string;
  compact?: boolean;
}) {
  const Icon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;
  const color =
    change > 0 ? "text-success" : change < 0 ? "text-destructive" : "text-muted-foreground";

  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-medium", color)}>
      <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
      {change > 0 ? "+" : ""}
      {change}
      {label ? ` ${label}` : ""}
    </span>
  );
}
