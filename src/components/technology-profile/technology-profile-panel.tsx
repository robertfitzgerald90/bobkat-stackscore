import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Calendar,
  ClipboardList,
  ExternalLink,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { TECHNOLOGY_MATURITY_PROFILE_LABEL } from "@/lib/technology-maturity/labels";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { TREND_CONFIG } from "@/components/technology-profile/tp-constants";
import {
  V2_CATEGORY_DISPLAY_ORDER,
  V2_CATEGORY_LABELS,
} from "@/lib/assessment-library/category-mapping";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { getTechnologyProfile } from "@/lib/technology-profile";
import { RATING_LABELS } from "@/lib/scoring";
import { getRating } from "@/lib/scoring";
import { getScoreBarColorClass, getScoreTextColorClass } from "@/lib/scoring/score-display";
import { formatDisplayDate } from "@/lib/display";
import { cn } from "@/lib/utils";
import type { Rating } from "@/generated/prisma/client";

type TechnologyProfilePanelProps = {
  clientId: string;
};

export async function TechnologyProfilePanel({ clientId }: TechnologyProfilePanelProps) {
  const profile = await getTechnologyProfile(clientId);

  if (!profile) {
    return (
      <Card className="stat-card">
        <CardHeader>
          <CardTitle>{TECHNOLOGY_MATURITY_PROFILE_LABEL}</CardTitle>
          <CardDescription>
            Complete an assessment to establish this client&apos;s Technology Maturity Profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TpEmptyState
            icon={ClipboardList}
            title="No profile yet"
            message="Run an assessment to create the living Technology Maturity Profile for this client."
            actionLabel="Open profile"
            actionHref={clientTechnologyProfilePath(clientId)}
          />
        </CardContent>
      </Card>
    );
  }

  const score = profile.overallStackScore;
  const rating = score !== null ? getRating(score) : null;
  const trend = profile.trendDirection ? TREND_CONFIG[profile.trendDirection] : null;
  const TrendIcon = trend?.icon ?? Minus;

  const categoryMap = new Map(
    profile.categoryScores.map((category) => [category.categoryCode, category]),
  );
  const pillarMap = new Map(
    (profile.pillarSnapshots ?? []).map((pillar) => [pillar.pillarCode, pillar]),
  );
  const showPillarScores =
    profile.scoringEngineVersion === "v2" && (profile.pillarSnapshots?.length ?? 0) > 0;

  return (
    <Card className="stat-card overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div>
            <CardTitle>{TECHNOLOGY_MATURITY_PROFILE_LABEL}</CardTitle>
            <CardDescription>
              Living record of technology maturity — updated on every completed assessment.
            </CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {profile.currentAssessmentId ? (
              <Link
                href={`/assessments/${profile.currentAssessmentId}/results`}
                className={buttonClassName({
                  variant: "outline",
                  size: "sm",
                  className: "w-full sm:w-auto",
                })}
              >
                View Assessment
              </Link>
            ) : null}
            <Link
              href={clientTechnologyProfilePath(clientId)}
              className={buttonClassName({
                variant: "default",
                size: "sm",
                className: "w-full sm:w-auto",
              })}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Full Profile
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          <div className="text-center lg:text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              StackScore
            </p>
            <p
              className={cn("text-5xl font-bold tabular-nums", getScoreTextColorClass(score))}
            >
              {score !== null ? score : "—"}
            </p>
            {rating ? (
              <Badge variant={RATING_VARIANT[rating]} className="mt-2">
                {RATING_LABELS[rating]}
              </Badge>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {profile.maturityTierLabel ? (
              <PanelStat label="Maturity Tier" value={profile.maturityTierLabel} />
            ) : null}
            {trend ? (
              <PanelStat
                label="Trend"
                value={
                  <span className={cn("inline-flex items-center gap-1", trend.className)}>
                    <TrendIcon className="h-4 w-4" />
                    {trend.label}
                  </span>
                }
              />
            ) : null}
            <PanelStat
              label="Open Recommendations"
              value={String(profile.openRecommendationCount)}
            />
            {profile.lastAssessedAt ? (
              <PanelStat
                label="Last Assessed"
                value={formatDisplayDate(profile.lastAssessedAt)}
              />
            ) : null}
            {profile.nextRecommendedAssessmentAt ? (
              <PanelStat
                label="Next Assessment"
                value={formatDisplayDate(profile.nextRecommendedAssessmentAt)}
                icon={Calendar}
              />
            ) : null}
          </div>
        </div>

        {profile.riskSummary.criticalExposure ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Critical Exposure</p>
              <p className="text-muted-foreground">
                {profile.criticalExposureCount} critical finding(s) require immediate attention
                despite the overall score.
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-sm font-medium">Technology Pillars</p>
          {showPillarScores
            ? TECHNOLOGY_PILLARS.map((pillar) => {
                const snapshot = pillarMap.get(pillar.code);

                if (!snapshot || snapshot.status === "incomplete") {
                  return (
                    <div key={pillar.code} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span>{pillar.name}</span>
                        <span className="text-xs text-muted-foreground">Not assessed</span>
                      </div>
                    </div>
                  );
                }

                const score = snapshot.percentScore ?? 0;
                const rating = getRating(score);

                return (
                  <div key={pillar.code} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span>{pillar.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {snapshot.maturityLevelLabel ?? RATING_LABELS[rating]}
                        </Badge>
                        <span className="font-medium tabular-nums">{Math.round(score)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          getScoreBarColorClass(score),
                        )}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })
            : V2_CATEGORY_DISPLAY_ORDER.map((code) => {
            const category = categoryMap.get(code);
            const label = V2_CATEGORY_LABELS[code] ?? code;

            if (!category) {
              return (
                <div key={code} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span>{label}</span>
                    <span className="text-xs text-muted-foreground">Not assessed</span>
                  </div>
                </div>
              );
            }

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
                    className={cn(
                      "h-full rounded-full transition-all",
                      getScoreBarColorClass(category.percentScore),
                    )}
                    style={{ width: `${category.percentScore}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

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

function PanelStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-md border px-3 py-2">
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
