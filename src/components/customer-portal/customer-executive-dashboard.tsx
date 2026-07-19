"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  History,
  TrendingUp,
} from "lucide-react";
import {
  ClientEmptyState,
  ClientMetricCard,
  ClientNextActionCard,
  ClientPageHeader,
  ClientPageShell,
  ClientScoreHero,
  ClientSectionHeader,
} from "@/components/client-ui";
import { BookingButton } from "@/components/support/booking-button";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { deriveCustomerNextAction } from "@/lib/customer-portal/next-action";
import { formatDisplayDate, PRIORITY_LABELS } from "@/lib/display";
import { RATING_LABELS, getRating } from "@/lib/scoring";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { getBookingUrl } from "@/lib/support/config";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";
import { takeTopRecommendations } from "@/lib/recommendations/sort";
import { conciseFocusTitle } from "@/lib/client-workspace";
import { cn } from "@/lib/utils";

type CustomerExecutiveDashboardProps = {
  detail: TechnologyProfileDetail;
  companyName: string;
};

export function CustomerExecutiveDashboard({
  detail,
  companyName,
}: CustomerExecutiveDashboardProps) {
  const {
    profile,
    client,
    journeyScores,
    pillarInsights,
    openRecommendations,
    journey,
    draftAssessmentId,
    scoreTrend,
  } = detail;

  const score = profile.overallStackScore;
  const rating = score !== null ? getRating(score) : null;
  const hasCompletedAssessment = journey.assessmentsCompleted > 0;
  const assessmentInProgress = Boolean(draftAssessmentId);
  const bookingUrl = getBookingUrl();
  const nextAction = deriveCustomerNextAction(detail);

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

  const welcomeName = client.primaryContactName?.split(" ")[0] ?? "there";
  const historicalAssessments = scoreTrend.filter((point) => point.assessmentId);

  return (
    <ClientPageShell>
      <ClientPageHeader
        eyebrow="Assessment Dashboard"
        title={`Welcome back, ${welcomeName}`}
        description={`${companyName} — your technology health at a glance, what to review next, and the actions that matter most right now.`}
      />

      {!hasCompletedAssessment && !assessmentInProgress ? (
        <ClientEmptyState
          icon={ClipboardList}
          title="Start your Technology Maturity Assessment"
          description="Complete the assessment to receive your StackScore, executive report, prioritized recommendations, and a clear view of your technology health."
          nextStep="Begin the assessment when you are ready."
          action={
            <Link href="/assessment/start" className={buttonClassName({ size: "lg" })}>
              Start Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          }
        />
      ) : null}

      {assessmentInProgress ? (
        <ClientNextActionCard
          eyebrow="Assessment in progress"
          title="Continue your Technology Maturity Assessment"
          description="Your answers are saved automatically. Resume when you are ready to finish."
          actions={
            <Link href="/assessment/start" className={buttonClassName({ size: "lg" })}>
              Resume Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          }
        />
      ) : null}

      {hasCompletedAssessment && nextAction ? (
        <ClientNextActionCard
          eyebrow="Assessment complete"
          title={nextAction.label}
          description={nextAction.description}
          meta={
            profile.lastAssessedAt
              ? `Completed ${formatDisplayDate(profile.lastAssessedAt)}`
              : undefined
          }
          actions={
            <>
              <Link href={nextAction.href} className={buttonClassName({})}>
                <FileText className="mr-2 h-4 w-4" />
                {nextAction.label}
              </Link>
              {bookingUrl ? (
                <BookingButton
                  label="primary"
                  variant="outline"
                  icon={<Calendar className="mr-2 h-4 w-4" />}
                />
              ) : null}
            </>
          }
        />
      ) : null}

      {hasCompletedAssessment ? (
        <ClientScoreHero
          score={score}
          maturityLabel={rating ? RATING_LABELS[rating] : profile.maturityTierLabel}
          sublabel={
            profile.lastAssessedAt
              ? `Assessed ${formatDisplayDate(profile.lastAssessedAt)}`
              : "Complete your assessment"
          }
          scoreClassName={score !== null ? getScoreTextColorClass(score) : undefined}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ClientMetricCard
          label="Overall StackScore"
          value={score ?? "—"}
          emphasizeClassName={score !== null ? getScoreTextColorClass(score) : undefined}
          sublabel={rating ? RATING_LABELS[rating] : "Complete your assessment"}
        />
        <ClientMetricCard
          label="Projected Improvement"
          value={journeyScores.projectedScore ?? "—"}
          emphasizeClassName={
            journeyScores.projectedScore !== null
              ? getScoreTextColorClass(journeyScores.projectedScore)
              : undefined
          }
          sublabel="With recommended actions"
        />
        <ClientMetricCard
          label="Technology Health"
          value={profile.maturityTierLabel ?? "—"}
          sublabel={
            profile.lastAssessedAt
              ? `Assessed ${formatDisplayDate(profile.lastAssessedAt)}`
              : undefined
          }
        />
        <ClientMetricCard
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
          <ClientSectionHeader
            title="Top Strengths"
            description="Technology pillars where your organization is performing well."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {topStrengths.map((pillar) => (
              <Card key={pillar.pillarCode} className={CLIENT_SURFACE_CARD}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{pillar.pillarName}</CardTitle>
                  <CardDescription>{pillar.maturityTier ?? "Strong performance"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p
                    className={cn(
                      "text-2xl font-semibold tabular-nums",
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
          <ClientSectionHeader
            title="Top Risks"
            description="Areas that may expose your business to operational or security risk."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {topRisks.map((pillar) => (
              <Card
                key={pillar.pillarCode}
                className={cn(CLIENT_SURFACE_CARD, "border-destructive/20")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{pillar.pillarName}</CardTitle>
                  <CardDescription>{pillar.maturityTier ?? "Needs attention"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p
                    className={cn(
                      "text-2xl font-semibold tabular-nums",
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
        <ClientSectionHeader
          title="Top Priorities"
          description="The highest-impact opportunities identified in your assessment."
          actions={
            hasRecommendations ? (
              <Link
                href={recommendationsHref}
                className={buttonClassName({ variant: "outline", size: "sm" })}
              >
                View All Recommendations
              </Link>
            ) : null
          }
        />
        {!hasCompletedAssessment ? (
          <ClientEmptyState
            icon={TrendingUp}
            title="Complete your assessment"
            description="Finish your assessment to see personalized priorities for your organization."
            nextStep="Resume or start the Technology Maturity Assessment."
          />
        ) : priorities.length === 0 ? (
          <ClientEmptyState
            icon={TrendingUp}
            title="No priorities identified"
            description="Your assessment did not surface active recommendations at this time."
            positive
          />
        ) : (
          <div className="space-y-3">
            {priorities.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{conciseFocusTitle(item.title)}</p>
                    <Badge variant={PRIORITY_BADGE[item.priority]} className="text-xs">
                      {PRIORITY_LABELS[item.priority]}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
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

      {historicalAssessments.length > 1 ? (
        <section className="space-y-4">
          <ClientSectionHeader
            title="Assessment History"
            description="Previous assessments that shaped your current StackScore."
          />
          <div className="space-y-3">
            {historicalAssessments.map((entry) => (
              <div
                key={`${entry.assessmentId}-${entry.date}`}
                className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <History className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {entry.assessmentName ?? "Technology Maturity Assessment"}
                    </p>
                    <p className="text-sm text-muted-foreground">{entry.dateLabel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-lg font-semibold tabular-nums",
                      getScoreTextColorClass(entry.overallScore),
                    )}
                  >
                    {entry.overallScore}
                  </p>
                  {entry.assessmentId === profile.currentAssessmentId && reportHref ? (
                    <Link
                      href={reportHref}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View report
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {journeyScores.projectedScore !== null && score !== null ? (
        <Card className={CLIENT_SURFACE_CARD}>
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
          <ClientSectionHeader
            title="Technology Pillars"
            description="How each area of your technology environment contributes to overall health."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {pillarInsights.map((pillar) => (
              <div
                key={pillar.pillarCode}
                className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">{pillar.pillarName}</p>
                  <p className="text-xs text-muted-foreground">{pillar.maturityTier ?? "—"}</p>
                </div>
                <p
                  className={cn(
                    "text-lg font-semibold tabular-nums",
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
    </ClientPageShell>
  );
}
