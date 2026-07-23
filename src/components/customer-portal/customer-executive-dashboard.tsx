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
  ClientNextActionCard,
  ClientPageShell,
  ClientSectionHeader,
} from "@/components/client-ui";
import { ExecutiveBriefingPanel } from "@/components/executive-os/executive-briefing-panel";
import { ExecutiveKpiCard } from "@/components/executive-os/executive-kpi-card";
import { BookingButton } from "@/components/support/booking-button";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { EXECUTIVE_OS_PILLAR_ROW, EXECUTIVE_OS_PRIORITY_ROW } from "@/lib/executive-os/tokens";
import { buildExecutiveBriefing } from "@/lib/executive-os/briefing";
import {
  confidenceFromScore,
  executiveKpiLabel,
  executiveRiskLabel,
} from "@/lib/executive-os/business-language";
import { deriveCustomerNextAction } from "@/lib/customer-portal/next-action";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
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

function pillarIntelligenceDescription(
  score: number | null,
  businessQuestion: string,
  openRecommendationCount: number,
): string {
  if (score === null) return businessQuestion;
  if (openRecommendationCount > 0) {
    return `${openRecommendationCount} open ${openRecommendationCount === 1 ? "priority" : "priorities"} may affect this area. ${businessQuestion}`;
  }
  if (score >= 80) return "Performing well against business expectations.";
  if (score >= 65) return "Stable, with room to strengthen resilience and consistency.";
  return "Elevated business exposure — review recommended actions.";
}

function trendFromDelta(delta: number | null): "up" | "down" | "neutral" {
  if (delta === null || delta === 0) return "neutral";
  return delta > 0 ? "up" : "down";
}

/** Customer home — Executive Briefing (formerly Assessment Dashboard). */
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
  const scoreSparkline = scoreTrend
    .map((point) => point.overallScore)
    .filter((value): value is number => typeof value === "number");

  const briefing = buildExecutiveBriefing(detail, companyName, welcomeName);

  return (
    <ClientPageShell>
      <ExecutiveBriefingPanel briefing={briefing} />

      {!hasCompletedAssessment && !assessmentInProgress ? (
        <ClientEmptyState
          icon={ClipboardList}
          title="Your executive briefing begins with an assessment"
          description="Complete the Technology Maturity Assessment to receive your StackScore, executive report, and strategic priorities — translated into business language you can act on."
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
          eyebrow="Recommended next step"
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ExecutiveKpiCard
            label="Technology Health"
            value={score ?? "—"}
            sublabel={rating ? RATING_LABELS[rating] : "Complete your assessment"}
            description="Your overall technology readiness for business operations."
            trend={trendFromDelta(detail.scoreDeltaSincePrevious)}
            trendLabel={
              detail.scoreDeltaSincePrevious !== null && detail.scoreDeltaSincePrevious !== 0
                ? `${detail.scoreDeltaSincePrevious > 0 ? "+" : ""}${detail.scoreDeltaSincePrevious} pts`
                : undefined
            }
            confidence={confidenceFromScore(score)}
            riskLevel={executiveRiskLabel(score)}
            sparkline={scoreSparkline}
            emphasizeClassName={score !== null ? getScoreTextColorClass(score) : undefined}
          />
          <ExecutiveKpiCard
            label="Projected Improvement"
            value={journeyScores.projectedScore ?? "—"}
            sublabel="With recommended actions"
            description="Expected StackScore after implementing strategic priorities."
            emphasizeClassName={
              journeyScores.projectedScore !== null
                ? getScoreTextColorClass(journeyScores.projectedScore)
                : undefined
            }
          />
          <ExecutiveKpiCard
            label="Business Risk"
            value={executiveRiskLabel(score)}
            sublabel={
              profile.criticalExposureCount > 0
                ? `${profile.criticalExposureCount} critical exposure${profile.criticalExposureCount === 1 ? "" : "s"}`
                : "Exposure under review"
            }
            description="Estimated operational and security exposure based on current maturity."
          />
          <ExecutiveKpiCard
            label="Operational Readiness"
            value={profile.maturityTierLabel ?? "—"}
            sublabel={
              profile.lastAssessedAt
                ? `Assessed ${formatDisplayDate(profile.lastAssessedAt)}`
                : undefined
            }
            description="How prepared your technology environment is to support daily operations."
          />
        </div>
      ) : null}

      {topStrengths.length > 0 ? (
        <section className="space-y-4">
          <ClientSectionHeader
            title="Strengths"
            description="Areas where your organization demonstrates strong business readiness."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {topStrengths.map((pillar) => (
              <ExecutiveKpiCard
                key={pillar.pillarCode}
                label={executiveKpiLabel(pillar.pillarCode, pillar.pillarName)}
                value={pillar.percentScore !== null ? `${pillar.percentScore}%` : "—"}
                sublabel={pillar.maturityTier ?? "Strong performance"}
                description={pillarIntelligenceDescription(
                  pillar.percentScore,
                  pillar.businessQuestion,
                  pillar.openRecommendationCount,
                )}
                trend={trendFromDelta(pillar.trendDelta)}
                trendLabel={
                  pillar.trendDelta !== null && pillar.trendDelta !== 0
                    ? `${pillar.trendDelta > 0 ? "+" : ""}${pillar.trendDelta}%`
                    : undefined
                }
                confidence={confidenceFromScore(pillar.percentScore)}
                riskLevel={executiveRiskLabel(pillar.percentScore)}
                emphasizeClassName={
                  pillar.percentScore !== null
                    ? getScoreTextColorClass(pillar.percentScore)
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {topRisks.length > 0 ? (
        <section className="space-y-4">
          <ClientSectionHeader
            title="Areas Requiring Attention"
            description="Domains that may expose the business to operational or continuity risk."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {topRisks.map((pillar) => (
              <ExecutiveKpiCard
                key={pillar.pillarCode}
                label={executiveKpiLabel(pillar.pillarCode, pillar.pillarName)}
                value={pillar.percentScore !== null ? `${pillar.percentScore}%` : "—"}
                sublabel={pillar.maturityTier ?? "Needs attention"}
                description={pillarIntelligenceDescription(
                  pillar.percentScore,
                  pillar.businessQuestion,
                  pillar.openRecommendationCount,
                )}
                trend={trendFromDelta(pillar.trendDelta)}
                confidence={confidenceFromScore(pillar.percentScore)}
                riskLevel={executiveRiskLabel(pillar.percentScore)}
                emphasizeClassName={
                  pillar.percentScore !== null
                    ? getScoreTextColorClass(pillar.percentScore)
                    : undefined
                }
                className="border-warning/20"
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <ClientSectionHeader
          title="Strategic Priorities"
          description="The highest-impact opportunities identified for your business."
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
            title="Strategic priorities appear after your assessment"
            description="Finish your Technology Maturity Assessment to receive personalized, business-focused recommendations."
            nextStep="Resume or start the Technology Maturity Assessment."
          />
        ) : priorities.length === 0 ? (
          <ClientEmptyState
            icon={TrendingUp}
            title="No open priorities at this time"
            description="Your current assessment did not surface active recommendations — a sign of stable technology posture."
            positive
          />
        ) : (
          <div className="space-y-3">
            {priorities.map((item) => (
              <div key={item.id} className={EXECUTIVE_OS_PRIORITY_ROW}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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
                    Estimated business impact: +{item.estimatedImpactPoints} StackScore points
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
            title="Maturity History"
            description="Previous assessments that shaped your current technology health."
          />
          <div className="space-y-3">
            {historicalAssessments.map((entry) => (
              <div
                key={`${entry.assessmentId}-${entry.date}`}
                className={cn(EXECUTIVE_OS_PILLAR_ROW, "px-4 py-3")}
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
                      View executive report
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
              Projected Business Outcome
            </CardTitle>
            <CardDescription>
              Implementing recommended actions could improve technology health from {score} to{" "}
              {journeyScores.projectedScore} — strengthening operational readiness and reducing
              business risk.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {pillarInsights.length > 0 ? (
        <section className="space-y-4">
          <ClientSectionHeader
            title="Technology Health by Domain"
            description="How each area contributes to overall business readiness — with context, not just scores."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {pillarInsights.map((pillar) => (
              <div key={pillar.pillarCode} className={EXECUTIVE_OS_PILLAR_ROW}>
                <div className="min-w-0 pr-4">
                  <p className="font-medium">
                    {executiveKpiLabel(pillar.pillarCode, pillar.pillarName)}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {pillarIntelligenceDescription(
                      pillar.percentScore,
                      pillar.businessQuestion,
                      pillar.openRecommendationCount,
                    )}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-lg font-semibold tabular-nums",
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

/** Preferred name for the Executive Technology OS home view. */
export const ExecutiveBriefingView = CustomerExecutiveDashboard;
