import type { PortfolioRoadmapData } from "../types";
import { portfolioPreviewData } from "../data/preview-data";
import {
  PreviewBadge,
  PreviewCard,
  PreviewCardContent,
  PreviewCardDescription,
  PreviewCardHeader,
  PreviewCardTitle,
  PreviewShell,
} from "./portfolio-primitives";
import { cn } from "./cn";
import { formatPriority, priorityBadgeClass } from "./score-display";

export type TechnologyRoadmapPreviewProps = {
  data?: PortfolioRoadmapData;
  className?: string;
};

export function TechnologyRoadmapPreview({
  data = portfolioPreviewData.technologyRoadmap,
  className,
}: TechnologyRoadmapPreviewProps) {
  return (
    <PreviewShell className={cn("space-y-5 p-4 sm:p-6", className)}>
      <PreviewCard className="border-sky-200/70 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/30">
        <PreviewCardHeader>
          <PreviewCardTitle>{data.title}</PreviewCardTitle>
          <PreviewCardDescription>
            {data.organizationName} · {data.subtitle} Score path {data.currentScore} to{" "}
            {data.projectedScore} over {data.estimatedTimeline}.
          </PreviewCardDescription>
        </PreviewCardHeader>
      </PreviewCard>

      <div className="space-y-4">
        {data.phases.map((phase, index) => (
          <PreviewCard key={phase.id}>
            <PreviewCardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <PreviewBadge className="border-transparent bg-sky-600 text-white dark:bg-sky-500">
                  {`Phase ${index + 1}`}
                </PreviewBadge>
                <PreviewBadge className="border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {phase.timeframe}
                </PreviewBadge>
              </div>
              <PreviewCardTitle className="mt-2">{phase.name}</PreviewCardTitle>
              <PreviewCardDescription>{phase.focus}</PreviewCardDescription>
            </PreviewCardHeader>
            <PreviewCardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Phase outcomes
                </p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {phase.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40"
                    >
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Initiatives
                </p>
                {phase.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-950/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.pillar}</p>
                    </div>
                    <PreviewBadge className={priorityBadgeClass(item.priority)}>
                      {formatPriority(item.priority)}
                    </PreviewBadge>
                  </div>
                ))}
              </div>
            </PreviewCardContent>
          </PreviewCard>
        ))}
      </div>
    </PreviewShell>
  );
}
