"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, LineChart, Milestone } from "lucide-react";
import { CategoryTrendsChart } from "@/components/analytics/category-trends-chart";
import { MaturityTimeline } from "@/components/analytics/maturity-timeline";
import { ScoreTrendChart } from "@/components/analytics/score-trend-chart";
import { TrendIndicator } from "@/components/analytics/trend-indicator";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClientImprovementAnalytics } from "@/lib/analytics/types";
import { getRating, RATING_LABELS } from "@/lib/scoring";
import { RATING_BADGE_VARIANT } from "@/lib/scoring/rating-display";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ClientImprovementDashboardProps = {
  analytics: ClientImprovementAnalytics;
};

export function ClientImprovementDashboard({ analytics }: ClientImprovementDashboardProps) {
  const currentRating =
    analytics.currentScore !== null ? getRating(analytics.currentScore) : null;
  const initialRating =
    analytics.initialScore !== null ? getRating(analytics.initialScore) : null;

  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="page-header">
          <p className="text-sm text-muted-foreground">{analytics.clientName}</p>
          <h2 className="page-title">Client Improvement Dashboard</h2>
          <p className="page-description">
            Track StackScore momentum, category maturity, and business outcomes over time.
          </p>
        </div>
        <Link
          href={`/clients/${analytics.clientId}`}
          className={buttonClassName({ variant: "outline", className: "w-full sm:w-auto" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Client
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Initial Score"
          value={analytics.initialScore !== null ? String(analytics.initialScore) : "—"}
          subtitle={initialRating ? RATING_LABELS[initialRating] : "No baseline yet"}
          valueClassName={getScoreTextColorClass(analytics.initialScore)}
        />
        <MetricCard
          title="Current Score"
          value={analytics.currentScore !== null ? String(analytics.currentScore) : "—"}
          subtitle={currentRating ? RATING_LABELS[currentRating] : "Not assessed"}
          valueClassName={getScoreTextColorClass(analytics.currentScore)}
          trailing={
            currentRating ? (
              <Badge variant={RATING_BADGE_VARIANT[currentRating]}>{RATING_LABELS[currentRating]}</Badge>
            ) : null
          }
        />
        <MetricCard
          title="Net Improvement"
          value={
            analytics.netImprovement !== null
              ? `${analytics.netImprovement > 0 ? "+" : ""}${analytics.netImprovement}`
              : "—"
          }
          subtitle="Since first recorded assessment"
          trailing={<TrendIndicator delta={analytics.netImprovement} showLabel={false} />}
        />
        <MetricCard
          title="Milestones"
          value={String(analytics.timeline.length)}
          subtitle={`${analytics.assessmentCount} assessments · ${analytics.projectsCompleted} projects · ${analytics.recommendationsClosed} recommendations closed`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-brand" />
              Overall Score Trend
            </CardTitle>
            <CardDescription>Historical StackScore from completed assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={analytics.scoreTrend} />
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand" />
              Category Score Trends
            </CardTitle>
            <CardDescription>Technology maturity movement across assessment cycles</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryTrendsChart series={analytics.categoryTrends} />
          </CardContent>
        </Card>
      </div>

      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Milestone className="h-5 w-5 text-brand" />
            Technology Maturity Timeline
          </CardTitle>
          <CardDescription>
            Assessments completed, projects delivered, and recommendations closed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaturityTimeline events={analytics.timeline} />
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  valueClassName,
  trailing,
}: {
  title: string;
  value: string;
  subtitle: string;
  valueClassName?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <Card className="stat-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <p className={cn("text-3xl font-bold tabular-nums", valueClassName)}>{value}</p>
          {trailing}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
