import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  ExternalLink,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { getTechnologyProfile } from "@/lib/technology-profile";
import { RATING_LABELS } from "@/lib/scoring";
import { getRating } from "@/lib/scoring";
import { getScoreBarColorClass, getScoreTextColorClass } from "@/lib/scoring/score-display";
import { V2_CATEGORY_DISPLAY_ORDER } from "@/lib/assessment-library/category-mapping";
import { formatDisplayDate } from "@/lib/display";
import { cn } from "@/lib/utils";
import type { Rating, TrendDirection } from "@/generated/prisma/client";

type TechnologyProfilePanelProps = {
  clientId: string;
};

const TREND_CONFIG: Record<
  TrendDirection,
  { label: string; icon: LucideIcon; className: string }
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

export async function TechnologyProfilePanel({ clientId }: TechnologyProfilePanelProps) {
  const profile = await getTechnologyProfile(clientId);

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technology Profile</CardTitle>
          <CardDescription>
            Complete an assessment to establish this client&apos;s Technology Profile.
          </CardDescription>
        </CardHeader>
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Technology Profile</CardTitle>
            <CardDescription>
              Living record of technology maturity — updated on every completed assessment.
            </CardDescription>
          </div>
          {profile.currentAssessmentId ? (
            <Link
              href={`/assessments/${profile.currentAssessmentId}/results`}
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              View Assessment
            </Link>
          ) : null}
          <Link
            href={`/clients/${clientId}/technology-profile`}
            className={buttonClassName({ variant: "default", size: "sm" })}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Full Profile
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
          <div className="text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              StackScore
            </p>
            <p
              className={cn(
                "text-5xl font-bold tabular-nums",
                getScoreTextColorClass(score),
              )}
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
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs text-muted-foreground">Maturity Tier</p>
                <p className="font-semibold">{profile.maturityTierLabel}</p>
              </div>
            ) : null}
            {trend ? (
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs text-muted-foreground">Trend</p>
                <p className={cn("flex items-center gap-1 font-semibold", trend.className)}>
                  <TrendIcon className="h-4 w-4" />
                  {trend.label}
                </p>
              </div>
            ) : null}
            <div className="rounded-md border px-3 py-2">
              <p className="text-xs text-muted-foreground">Open Recommendations</p>
              <p className="font-semibold tabular-nums">{profile.openRecommendationCount}</p>
            </div>
            {profile.lastAssessedAt ? (
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs text-muted-foreground">Last Assessed</p>
                <p className="text-sm font-medium">
                  {formatDisplayDate(profile.lastAssessedAt)}
                </p>
              </div>
            ) : null}
            {profile.nextRecommendedAssessmentAt ? (
              <div className="rounded-md border px-3 py-2">
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Next Assessment
                </p>
                <p className="text-sm font-medium">
                  {formatDisplayDate(profile.nextRecommendedAssessmentAt)}
                </p>
              </div>
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
          <p className="text-sm font-medium">Category Maturity (DOC-114)</p>
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
