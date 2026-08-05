import type { PortfolioExecutiveDashboardData } from "../types";
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
import {
  formatPriority,
  getScoreBarColorClass,
  getScoreTextColorClass,
  priorityBadgeClass,
} from "./score-display";

export type ExecutiveDashboardPreviewProps = {
  data?: PortfolioExecutiveDashboardData;
  className?: string;
};

export function ExecutiveDashboardPreview({
  data = portfolioPreviewData.executiveDashboard,
  className,
}: ExecutiveDashboardPreviewProps) {
  return (
    <PreviewShell className={cn("p-4 sm:p-6", className)}>
      <header className="mb-6 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {data.organizationName}
            </h2>
            <PreviewBadge className="border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {data.organizationStatus}
            </PreviewBadge>
          </div>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-sky-600 dark:text-sky-400">
            {data.pageTitle}
          </p>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            {data.pageSubtitle}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            StackScore
          </p>
          <p className={cn("text-3xl font-semibold tabular-nums", getScoreTextColorClass(data.overallScore))}>
            {data.overallScore}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {data.priorScore} prior · +{data.scoreChange} · {data.maturityLabel}
          </p>
        </div>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.metrics.map((metric) => (
          <PreviewCard key={metric.id}>
            <PreviewCardContent className="py-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {metric.label}
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-semibold tabular-nums",
                  metric.tone === "positive" && "text-emerald-600 dark:text-emerald-400",
                  metric.tone === "warning" && "text-amber-600 dark:text-amber-400",
                )}
              >
                {metric.value}
              </p>
              {metric.hint ? (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{metric.hint}</p>
              ) : null}
            </PreviewCardContent>
          </PreviewCard>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <PreviewCard>
          <PreviewCardHeader>
            <PreviewCardTitle>Pillar maturity</PreviewCardTitle>
            <PreviewCardDescription>
              Current scores across priority technology pillars.
            </PreviewCardDescription>
          </PreviewCardHeader>
          <PreviewCardContent className="space-y-3">
            {data.pillars.map((pillar) => (
              <div key={pillar.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{pillar.name}</p>
                  <p className={cn("text-sm font-semibold tabular-nums", getScoreTextColorClass(pillar.currentScore))}>
                    {pillar.currentScore}
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={cn("h-full rounded-full", getScoreBarColorClass(pillar.currentScore))}
                    style={{ width: `${Math.min(100, pillar.currentScore)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{pillar.summary}</p>
              </div>
            ))}
          </PreviewCardContent>
        </PreviewCard>

        <PreviewCard>
          <PreviewCardHeader>
            <PreviewCardTitle>Immediate focus</PreviewCardTitle>
            <PreviewCardDescription>
              Highest priority initiatives for leadership attention.
            </PreviewCardDescription>
          </PreviewCardHeader>
          <PreviewCardContent className="space-y-2">
            {data.focusItems.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <PreviewBadge className={priorityBadgeClass(item.priority)}>
                    {formatPriority(item.priority)}
                  </PreviewBadge>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.pillar}</span>
                </div>
                <p className="mt-2 text-sm font-medium">{item.title}</p>
              </div>
            ))}
          </PreviewCardContent>
        </PreviewCard>
      </div>
    </PreviewShell>
  );
}
