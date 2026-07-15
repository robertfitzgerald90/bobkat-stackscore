import { AlertTriangle, Calendar, ClipboardList, Target } from "lucide-react";
import type { TrendDirection } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { TREND_CONFIG } from "@/components/technology-profile/tp-constants";
import { formatDisplayDate } from "@/lib/display";
import {
  TECHNOLOGY_MATURITY_PROFILE_LABEL,
  TECHNOLOGY_MATURITY_PROFILE_SUBTITLE,
} from "@/lib/technology-maturity/labels";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

export type TechnologyMaturityClassificationBadge = {
  label: string;
  variant?: "secondary" | "outline";
  icon?: "target" | "trend";
  trendDirection?: TrendDirection;
};

export type TechnologyMaturityProfileProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  score: number | null;
  statusLabel: string | null;
  classificationBadges: TechnologyMaturityClassificationBadge[];
  organizationSummary: string | null;
  criticalExposureCount: number;
  showCriticalExposure?: boolean;
  lastAssessedDate: string | null;
  pointsSincePreviousAssessment: number | null;
  nextAssessmentDate: string | null;
  hasAssessment?: boolean;
  readOnly?: boolean;
  marketingPreview?: boolean;
};

export function TechnologyMaturityProfile({
  eyebrow = TECHNOLOGY_MATURITY_PROFILE_LABEL,
  title = "Technology Maturity Overview",
  description = TECHNOLOGY_MATURITY_PROFILE_SUBTITLE,
  score,
  statusLabel,
  classificationBadges,
  organizationSummary,
  criticalExposureCount,
  showCriticalExposure = false,
  lastAssessedDate,
  pointsSincePreviousAssessment,
  nextAssessmentDate,
  hasAssessment = true,
  readOnly = false,
  marketingPreview = false,
}: TechnologyMaturityProfileProps) {
  const lastAssessed = lastAssessedDate ? formatDisplayDate(lastAssessedDate) : "Not yet";
  const nextAssessment = nextAssessmentDate ? formatDisplayDate(nextAssessmentDate) : null;

  return (
    <section className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm ring-1 ring-border/60">
      <div
        className={cn(
          "grid lg:grid-cols-[1fr_auto] lg:items-start",
          marketingPreview ? "gap-4 p-4 sm:p-5 md:p-6" : "gap-6 p-4 sm:p-6",
        )}
      >
        <div className="min-w-0 space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </p>
            <h3 className="break-words text-lg font-semibold tracking-tight sm:text-xl">{title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          {classificationBadges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {classificationBadges.map((badge) => {
                const trend =
                  badge.trendDirection && badge.icon === "trend"
                    ? TREND_CONFIG[badge.trendDirection]
                    : null;
                const TrendIcon = trend?.icon;

                return (
                  <Badge
                    key={badge.label}
                    variant={badge.variant ?? "outline"}
                    className={cn("gap-1", trend?.className)}
                  >
                    {badge.icon === "target" ? <Target className="h-3 w-3" /> : null}
                    {TrendIcon ? <TrendIcon className="h-3 w-3" /> : null}
                    {badge.label}
                  </Badge>
                );
              })}
            </div>
          ) : null}

          {organizationSummary ? (
            <p className="max-w-2xl text-sm text-muted-foreground line-clamp-2">
              {organizationSummary}
            </p>
          ) : null}

          {showCriticalExposure ? (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p>
                Critical exposure: {criticalExposureCount} finding(s) need immediate attention.
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
                "font-bold tabular-nums",
                marketingPreview
                  ? "text-3xl sm:text-4xl lg:text-5xl"
                  : "text-4xl sm:text-5xl lg:text-6xl",
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
            {statusLabel ? (
              <p className="mt-1 text-sm font-medium text-muted-foreground">{statusLabel}</p>
            ) : null}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Last assessed: {lastAssessed}</p>
            {pointsSincePreviousAssessment !== null ? (
              <p>
                {pointsSincePreviousAssessment >= 0 ? "+" : ""}
                {pointsSincePreviousAssessment} pts since previous assessment
              </p>
            ) : null}
            {nextAssessment ? (
              <p className="mt-1 flex items-center gap-1 lg:justify-end">
                <Calendar className="h-3.5 w-3.5" />
                Next assessment: {nextAssessment}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {!hasAssessment && !readOnly ? (
        <div className="border-t border-border/60 bg-muted/20 px-4 py-4 sm:px-6">
          <TpEmptyState
            icon={ClipboardList}
            title="Profile not established"
            message="Run the first assessment to populate scores, categories, and recommendations for this client."
            className="border-none bg-transparent py-4"
          />
        </div>
      ) : null}
    </section>
  );
}
