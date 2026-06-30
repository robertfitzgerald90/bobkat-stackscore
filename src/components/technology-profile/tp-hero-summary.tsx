import Link from "next/link";
import { AlertTriangle, ArrowRight, Calendar, ClipboardList, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { TREND_CONFIG } from "@/components/technology-profile/tp-constants";
import { formatDisplayDate } from "@/lib/display";
import {
  TECHNOLOGY_MATURITY_PROFILE_LABEL,
  TECHNOLOGY_MATURITY_PROFILE_SUBTITLE,
} from "@/lib/technology-maturity/labels";
import { RATING_LABELS, getRating } from "@/lib/scoring";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";
import { cn } from "@/lib/utils";

type TpHeroSummaryProps = {
  detail: TechnologyProfileDetail;
};

export function TpHeroSummary({ detail }: TpHeroSummaryProps) {
  const { profile, client, businessSnapshot, journeyScores, nextAction, journey } = detail;
  const score = profile.overallStackScore;
  const hasAssessment = journey.assessmentsCompleted > 0;
  const rating = score !== null ? getRating(score) : null;
  const trend = profile.trendDirection ? TREND_CONFIG[profile.trendDirection] : null;
  const TrendIcon = trend?.icon;

  const lastAssessed = profile.lastAssessedAt
    ? formatDisplayDate(profile.lastAssessedAt)
    : "Not yet";
  const nextAssessment = profile.nextRecommendedAssessmentAt
    ? formatDisplayDate(profile.nextRecommendedAssessmentAt)
    : null;

  return (
    <section className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm ring-1 ring-border/60">
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="min-w-0 space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {TECHNOLOGY_MATURITY_PROFILE_LABEL}
            </p>
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">{client.companyName}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {TECHNOLOGY_MATURITY_PROFILE_SUBTITLE}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {businessSnapshot.primaryBusinessGoalLabel !== "—" ? (
              <Badge variant="secondary" className="gap-1">
                <Target className="h-3 w-3" />
                {businessSnapshot.primaryBusinessGoalLabel}
              </Badge>
            ) : null}
            {profile.maturityTierLabel ? (
              <Badge variant="outline">{profile.maturityTierLabel}</Badge>
            ) : null}
            {trend && TrendIcon ? (
              <Badge variant="outline" className={cn("gap-1", trend.className)}>
                <TrendIcon className="h-3 w-3" />
                {trend.label}
              </Badge>
            ) : null}
          </div>

          {businessSnapshot.technologyVision ? (
            <p className="max-w-2xl text-sm text-muted-foreground line-clamp-2">
              {businessSnapshot.technologyVision}
            </p>
          ) : null}

          {profile.riskSummary.criticalExposure ? (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p>
                Critical exposure: {profile.criticalExposureCount} finding(s) need immediate
                attention.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end lg:text-right">
          <div className="w-full sm:w-auto">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              StackScore
            </p>
            <p
              className={cn(
                "text-5xl font-bold tabular-nums sm:text-6xl",
                getScoreTextColorClass(score),
              )}
            >
              {score !== null ? score : "—"}
            </p>
            {!hasAssessment ? (
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Complete an initial assessment to establish the baseline StackScore.
              </p>
            ) : null}
            {rating ? (
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {RATING_LABELS[rating]}
              </p>
            ) : null}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Last assessed: {lastAssessed}</p>
            {journeyScores.scoreDeltaSincePrevious !== null ? (
              <p>
                {journeyScores.scoreDeltaSincePrevious >= 0 ? "+" : ""}
                {journeyScores.scoreDeltaSincePrevious} pts since previous assessment
              </p>
            ) : null}
            {nextAssessment ? (
              <p className="mt-1 flex items-center gap-1 sm:justify-end">
                <Calendar className="h-3.5 w-3.5" />
                Next assessment: {nextAssessment}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {!hasAssessment && !detail.sections.showNextActionCta ? (
        <div className="border-t border-border/60 bg-muted/20 px-4 py-4 sm:px-6">
          <TpEmptyState
            icon={ClipboardList}
            title="Profile not established"
            message="Run the first assessment to populate scores, categories, and recommendations for this client."
            className="border-none bg-transparent py-4"
          />
        </div>
      ) : null}

      {detail.sections.showNextActionCta ? (
        <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{nextAction.label}</p>
            <p className="text-sm text-muted-foreground">{nextAction.description}</p>
          </div>
          <Link
            href={nextAction.href}
            className={buttonClassName({
              variant: "default",
              size: "sm",
              className: "w-full shrink-0 sm:w-auto",
            })}
          >
            {nextAction.label}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
