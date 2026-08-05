import type { PortfolioMaturityData } from "../types";
import { portfolioPreviewData } from "../data/preview-data";
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardDescription,
  PreviewCardHeader,
  PreviewCardTitle,
  PreviewShell,
} from "./portfolio-primitives";
import { cn } from "./cn";
import { getScoreBarColorClass, getScoreTextColorClass } from "./score-display";

export type TechnologyMaturityPreviewProps = {
  data?: PortfolioMaturityData;
  className?: string;
};

export function TechnologyMaturityPreview({
  data = portfolioPreviewData.maturityProfile,
  className,
}: TechnologyMaturityPreviewProps) {
  return (
    <PreviewShell className={cn("space-y-5 p-4 sm:p-6", className)}>
      <PreviewCard className="border-sky-200/70 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/30">
        <PreviewCardHeader>
          <PreviewCardTitle>Technology Maturity Profile</PreviewCardTitle>
          <PreviewCardDescription>
            {data.organizationName} · {data.assessmentName}
          </PreviewCardDescription>
        </PreviewCardHeader>
        <PreviewCardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Current score" value={data.currentScore} score />
            <Metric label="Projected score" value={data.projectedScore} score />
            <Metric label="Expected improvement" value={`+${data.expectedImprovement}`} />
            <Metric label="Maturity level" value={data.maturityLabel} />
          </div>
        </PreviewCardContent>
      </PreviewCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.pillars.map((pillar) => (
          <PreviewCard key={pillar.id}>
            <PreviewCardHeader>
              <PreviewCardTitle>{pillar.name}</PreviewCardTitle>
              <PreviewCardDescription>{pillar.summary}</PreviewCardDescription>
            </PreviewCardHeader>
            <PreviewCardContent className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Today</p>
                  <p className={cn("text-2xl font-semibold tabular-nums", getScoreTextColorClass(pillar.currentScore))}>
                    {pillar.currentScore}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Projected</p>
                  <p className={cn("text-2xl font-semibold tabular-nums", getScoreTextColorClass(pillar.projectedScore))}>
                    {pillar.projectedScore}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={cn("h-full rounded-full", getScoreBarColorClass(pillar.currentScore))}
                    style={{ width: `${Math.min(100, pillar.currentScore)}%` }}
                  />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={cn("h-full rounded-full", getScoreBarColorClass(pillar.projectedScore))}
                    style={{ width: `${Math.min(100, pillar.projectedScore)}%` }}
                  />
                </div>
              </div>
            </PreviewCardContent>
          </PreviewCard>
        ))}
      </div>
    </PreviewShell>
  );
}

function Metric({
  label,
  value,
  score = false,
}: {
  label: string;
  value: string | number;
  score?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          score && typeof value === "number" ? getScoreTextColorClass(value) : undefined,
        )}
      >
        {value}
      </p>
    </div>
  );
}
