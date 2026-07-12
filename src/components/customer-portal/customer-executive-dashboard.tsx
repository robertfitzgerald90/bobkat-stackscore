"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Download,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { BookingButton } from "@/components/support/booking-button";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { formatDisplayDate, PRIORITY_LABELS } from "@/lib/display";
import { RATING_LABELS, getRating } from "@/lib/scoring";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";
import { takeTopRecommendations } from "@/lib/recommendations/sort";
import { conciseFocusTitle } from "@/lib/client-workspace";
import { cn } from "@/lib/utils";

type CustomerExecutiveDashboardProps = {
  detail: TechnologyProfileDetail;
  companyName: string;
};

function MetricCard({
  label,
  value,
  emphasize = false,
  sublabel,
}: {
  label: string;
  value: string | number;
  emphasize?: boolean;
  sublabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 text-3xl font-bold tabular-nums",
          emphasize && typeof value === "number" ? getScoreTextColorClass(value) : undefined,
        )}
      >
        {value}
      </p>
      {sublabel ? <p className="mt-1 text-sm text-muted-foreground">{sublabel}</p> : null}
    </div>
  );
}

export function CustomerExecutiveDashboard({
  detail,
  companyName,
}: CustomerExecutiveDashboardProps) {
  const { profile, journeyScores, pillarInsights, openRecommendations, journey, draftAssessmentId } =
    detail;
  const score = profile.overallStackScore;
  const rating = score !== null ? getRating(score) : null;
  const hasCompletedAssessment = journey.assessmentsCompleted > 0;
  const assessmentInProgress = Boolean(draftAssessmentId);

  const topStrengths = [...pillarInsights]
    .filter((p) => p.percentScore !== null)
    .sort((a, b) => (b.percentScore ?? 0) - (a.percentScore ?? 0))
    .slice(0, 3);

  const topRisks = [...pillarInsights]
    .filter((p) => p.percentScore !== null)
    .sort((a, b) => (a.percentScore ?? 0) - (b.percentScore ?? 0))
    .slice(0, 3);

  const priorities = takeTopRecommendations(openRecommendations, 5);
  const hasRecommendations = openRecommendations.length > 0;
  const recommendationsHref = `/clients/${profile.clientId}/recommendations`;

  const reportHref = profile.currentAssessmentId
    ? `/assessments/${profile.currentAssessmentId}/report`
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Executive Dashboard</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{companyName}</h1>
        <p className="max-w-2xl text-muted-foreground">
          Your technology health at a glance — where you stand, what matters most, and how BobKat
          can help you improve.
        </p>
      </header>

      {assessmentInProgress && !hasCompletedAssessment ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Your assessment is in progress</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Continue where you left off — your answers are saved automatically.
                </p>
              </div>
            </div>
            <Link href="/assessment/start" className={buttonClassName({ size: "lg" })}>
              Continue Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {hasCompletedAssessment ? (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-6 w-6 text-primary" />
              <div>
                <p className="text-lg font-semibold">Assessment complete</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your executive report is ready. Review your results and schedule a strategy
                  session with our team.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {reportHref ? (
                <Link href={reportHref} className={buttonClassName({ variant: "outline" })}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Link>
              ) : null}
              <BookingButton
                label="primary"
                icon={<Calendar className="mr-2 h-4 w-4" />}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Overall StackScore"
          value={score ?? "—"}
          emphasize={score !== null}
          sublabel={rating ? RATING_LABELS[rating] : "Complete your assessment"}
        />
        <MetricCard
          label="Projected Improvement"
          value={journeyScores.projectedScore ?? "—"}
          emphasize={journeyScores.projectedScore !== null}
          sublabel="With recommended actions"
        />
        <MetricCard
          label="Technology Health"
          value={profile.maturityTierLabel ?? "—"}
          sublabel={
            profile.lastAssessedAt
              ? `Assessed ${formatDisplayDate(profile.lastAssessedAt)}`
              : undefined
          }
        />
        <MetricCard
          label="Assessment Status"
          value={
            hasCompletedAssessment
              ? "Complete"
              : assessmentInProgress
                ? "In Progress"
                : "Not Started"
          }
          sublabel={
            profile.nextRecommendedAssessmentAt
              ? `Next review ${formatDisplayDate(profile.nextRecommendedAssessmentAt)}`
              : undefined
          }
        />
      </div>

      {topStrengths.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Top Strengths</h2>
            <p className="text-sm text-muted-foreground">
              Technology pillars where your organization is performing well.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {topStrengths.map((pillar) => (
              <Card key={pillar.pillarCode} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{pillar.pillarName}</CardTitle>
                  <CardDescription>{pillar.maturityTier ?? "Strong performance"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p
                    className={cn(
                      "text-2xl font-bold tabular-nums",
                      pillar.percentScore !== null
                        ? getScoreTextColorClass(pillar.percentScore)
                        : undefined,
                    )}
                  >
                    {pillar.percentScore !== null ? `${pillar.percentScore}%` : "—"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {topRisks.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Top Risks</h2>
            <p className="text-sm text-muted-foreground">
              Areas that may expose your business to operational or security risk.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {topRisks.map((pillar) => (
              <Card key={pillar.pillarCode} className="border-destructive/20 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{pillar.pillarName}</CardTitle>
                  <CardDescription>{pillar.maturityTier ?? "Needs attention"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p
                    className={cn(
                      "text-2xl font-bold tabular-nums",
                      pillar.percentScore !== null
                        ? getScoreTextColorClass(pillar.percentScore)
                        : undefined,
                    )}
                  >
                    {pillar.percentScore !== null ? `${pillar.percentScore}%` : "—"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Immediate Priorities</h2>
            <p className="text-sm text-muted-foreground">
              The highest-impact opportunities identified in your assessment.
            </p>
          </div>
          {hasRecommendations ? (
            <Link href={recommendationsHref} className={buttonClassName({ variant: "outline", size: "sm" })}>
              View All Recommendations
            </Link>
          ) : null}
        </div>
        {!hasCompletedAssessment ? (
          <TpEmptyState
            icon={TrendingUp}
            title="Complete your assessment"
            message="Finish your assessment to see personalized priorities for your organization."
            actionLabel="Continue Assessment"
            actionHref="/assessment/start"
          />
        ) : priorities.length === 0 ? (
          <TpEmptyState
            icon={TrendingUp}
            title="No priorities identified"
            message="Your assessment did not surface active recommendations at this time."
            positive
          />
        ) : (
          <div className="space-y-3">
            {priorities.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{conciseFocusTitle(item.title)}</p>
                    <Badge variant={PRIORITY_BADGE[item.priority]} className="text-xs">
                      {PRIORITY_LABELS[item.priority]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.businessImpact || item.description}
                  </p>
                  <p className="text-xs font-medium text-foreground">
                    +{item.estimatedImpactPoints} StackScore points estimated improvement
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {journeyScores.projectedScore !== null && score !== null ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Projected Improvement
            </CardTitle>
            <CardDescription>
              Implementing recommended actions could improve your StackScore from {score} to{" "}
              {journeyScores.projectedScore} points.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {pillarInsights.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Technology Pillars</h2>
            <p className="text-sm text-muted-foreground">
              How each area of your technology environment contributes to overall health.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pillarInsights.map((pillar) => (
              <div
                key={pillar.pillarCode}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{pillar.pillarName}</p>
                  <p className="text-xs text-muted-foreground">{pillar.maturityTier ?? "—"}</p>
                </div>
                <p
                  className={cn(
                    "text-lg font-bold tabular-nums",
                    pillar.percentScore !== null
                      ? getScoreTextColorClass(pillar.percentScore)
                      : undefined,
                  )}
                >
                  {pillar.percentScore !== null ? `${pillar.percentScore}%` : "—"}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
