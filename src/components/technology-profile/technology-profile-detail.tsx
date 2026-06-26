"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  FolderKanban,
  Lightbulb,
  Minus,
  Route,
} from "lucide-react";
import { ScoreTrendChart } from "@/components/analytics/score-trend-chart";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPriority, PRIORITY_LABELS, formatDisplayDate } from "@/lib/display";
import { RECOMMENDATION_STATUS_LABELS } from "@/lib/assessments/results-summary";
import { formatProjectStatus } from "@/lib/projects";
import { RATING_LABELS, getRating } from "@/lib/scoring";
import { getScoreBarColorClass, getScoreTextColorClass } from "@/lib/scoring/score-display";
import { V2_CATEGORY_DISPLAY_ORDER } from "@/lib/assessment-library/category-mapping";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";
import { cn } from "@/lib/utils";
import type { Priority, Rating, TrendDirection } from "@/generated/prisma/client";

const TREND_CONFIG: Record<
  TrendDirection,
  { label: string; icon: typeof ArrowUp; className: string }
> = {
  improving: { label: "Improving", icon: ArrowUp, className: "text-primary" },
  stable: { label: "Stable", icon: Minus, className: "text-muted-foreground" },
  declining: { label: "Declining", icon: ArrowDown, className: "text-destructive" },
};

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

const PRIORITY_BADGE: Record<
  Priority,
  "destructive" | "warning" | "secondary" | "outline"
> = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
};

type TechnologyProfileDetailViewProps = {
  detail: TechnologyProfileDetail;
};

export function TechnologyProfileDetailView({ detail }: TechnologyProfileDetailViewProps) {
  const { profile, client, scoreTrend, journey } = detail;
  const score = profile.overallStackScore;
  const rating = score !== null ? getRating(score) : null;
  const trend = profile.trendDirection ? TREND_CONFIG[profile.trendDirection] : null;
  const TrendIcon = trend?.icon ?? Minus;

  const categoryMap = new Map(
    profile.categoryScores.map((category) => [category.categoryCode, category]),
  );

  const lastAssessed = formatDisplayDate(profile.lastAssessedAt, null);
  const nextAssessment = formatDisplayDate(profile.nextRecommendedAssessmentAt, null);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="stat-card md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall StackScore
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-4">
            <p
              className={cn(
                "text-5xl font-bold tabular-nums",
                getScoreTextColorClass(score),
              )}
            >
              {score !== null ? score : "—"}
            </p>
            {rating ? (
              <Badge variant={RATING_VARIANT[rating]} className="mb-2">
                {RATING_LABELS[rating]}
              </Badge>
            ) : null}
            {profile.maturityTierLabel ? (
              <Badge variant="outline" className="mb-2">
                {profile.maturityTierLabel}
              </Badge>
            ) : null}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {trend ? (
              <p className={cn("flex items-center gap-2 text-lg font-semibold", trend.className)}>
                <TrendIcon className="h-5 w-5" />
                {trend.label}
              </p>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
            {journey.scoreDelta !== null ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {journey.scoreDelta >= 0 ? "+" : ""}
                {journey.scoreDelta} pts since first assessment
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Assessed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{lastAssessed ?? "Not yet"}</p>
            {nextAssessment ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Next: {nextAssessment}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="stat-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Route className="h-4 w-4 text-brand" />
              Technology Journey
            </CardTitle>
            <CardDescription>DOC-113 minimal progress model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Current phase</p>
              <p className="text-xl font-semibold">{journey.phaseLabel}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${journey.progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {journey.progressPercent}% journey milestones reached
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <JourneyStat label="Assessments" value={journey.assessmentsCompleted} />
              <JourneyStat label="Open recs" value={journey.openRecommendations} />
              <JourneyStat label="Active projects" value={journey.activeProjects} />
              <JourneyStat label="Completed" value={journey.completedProjects} />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Client Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Primary contact</p>
              <p className="font-medium">{client.primaryContactName}</p>
              <p className="text-muted-foreground">{client.primaryContactEmail}</p>
            </div>
            {client.industry ? (
              <div>
                <p className="text-muted-foreground">Industry</p>
                <p className="font-medium">{client.industry}</p>
              </div>
            ) : null}
            {profile.riskSummary.criticalExposure ? (
              <div className="col-span-full flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm">
                  Critical exposure: {profile.criticalExposureCount} finding(s) need immediate
                  attention.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Score History</CardTitle>
          <CardDescription>Historical StackScore from completed assessments</CardDescription>
        </CardHeader>
        <CardContent>
          {scoreTrend.length === 0 ? (
            <p className="text-sm text-muted-foreground">Complete an assessment to begin tracking.</p>
          ) : (
            <ScoreTrendChart data={scoreTrend} />
          )}
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Category Maturity</CardTitle>
          <CardDescription>v2 category scores (DOC-114 mapping)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {V2_CATEGORY_DISPLAY_ORDER.map((code) => {
            const category = categoryMap.get(code);
            if (!category) return null;
            return (
              <div key={code} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span>{category.categoryName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {category.maturityTier}
                    </Badge>
                    <span className="font-medium tabular-nums">
                      {Math.round(category.percentScore)}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", getScoreBarColorClass(category.percentScore))}
                    style={{ width: `${category.percentScore}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Open Recommendations
            </CardTitle>
            <CardDescription>{detail.openRecommendations.length} actionable items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.openRecommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open recommendations.</p>
            ) : (
              detail.openRecommendations.map((recommendation) => (
                <div key={recommendation.id} className="rounded-md border p-3 text-sm">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="font-medium">{recommendation.title}</p>
                    <Badge variant={PRIORITY_BADGE[recommendation.priority]}>
                      {PRIORITY_LABELS[recommendation.priority]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {recommendation.categoryName} · +
                    {recommendation.estimatedImpactPoints} pts ·{" "}
                    {RECOMMENDATION_STATUS_LABELS[recommendation.status]}
                  </p>
                  <Link
                    href={`/assessments/${recommendation.assessmentId}/results`}
                    className={buttonClassName({ variant: "link", size: "sm", className: "mt-2 h-auto p-0" })}
                  >
                    View in assessment
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              Active Projects
            </CardTitle>
            <CardDescription>{detail.activeProjects.length} in progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.activeProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active projects.</p>
            ) : (
              detail.activeProjects.map((project) => (
                <div key={project.id} className="rounded-md border p-3 text-sm">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="font-medium">{project.title}</p>
                    <Badge variant="secondary">{formatProjectStatus(project.status)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPriority(project.priority)}
                    {project.estimatedImpactPoints !== null
                      ? ` · +${project.estimatedImpactPoints} pts`
                      : ""}
                  </p>
                  <Link
                    href={`/projects?selected=${project.id}`}
                    className={buttonClassName({ variant: "link", size: "sm", className: "mt-2 h-auto p-0" })}
                  >
                    Open project
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Completed Projects</CardTitle>
          <CardDescription>Improvements delivered for this client</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {detail.completedProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed projects yet.</p>
          ) : (
            detail.completedProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col gap-2 rounded-md border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{project.title}</p>
                  {project.recommendationTitle ? (
                    <p className="text-xs text-muted-foreground">From: {project.recommendationTitle}</p>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground sm:text-right">
                  {formatDisplayDate(project.completedAt)}
                  {project.estimatedImpactPoints !== null
                    ? ` · +${project.estimatedImpactPoints} pts`
                    : ""}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {profile.currentAssessmentId ? (
        <div className="flex justify-end">
          <Link
            href={`/assessments/${profile.currentAssessmentId}/results`}
            className={buttonClassName({ variant: "outline" })}
          >
            View current assessment results
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function JourneyStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border/60 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}
