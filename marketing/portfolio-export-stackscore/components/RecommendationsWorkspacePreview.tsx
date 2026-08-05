"use client";

import { useMemo, useState } from "react";
import type { PortfolioPriority, PortfolioRecommendationsData } from "../types";
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

export type RecommendationsWorkspacePreviewProps = {
  data?: PortfolioRecommendationsData;
  className?: string;
};

const STATUS_LABELS = {
  open: "Open",
  accepted: "Accepted",
  in_progress: "In progress",
  planned: "Planned",
} as const;

export function RecommendationsWorkspacePreview({
  data = portfolioPreviewData.recommendationsWorkspace,
  className,
}: RecommendationsWorkspacePreviewProps) {
  const [priority, setPriority] = useState<PortfolioPriority | "">("");
  const [pillar, setPillar] = useState("");

  const pillars = useMemo(
    () => Array.from(new Set(data.recommendations.map((item) => item.pillar))),
    [data.recommendations],
  );

  const filtered = useMemo(() => {
    return data.recommendations.filter((item) => {
      if (priority && item.priority !== priority) return false;
      if (pillar && item.pillar !== pillar) return false;
      return true;
    });
  }, [data.recommendations, pillar, priority]);

  return (
    <PreviewShell className={cn("space-y-5 p-4 sm:p-6", className)}>
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">{data.organizationName}</h2>
          <PreviewBadge className="border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {data.organizationStatus}
          </PreviewBadge>
        </div>
        <nav
          aria-label="Client workspace"
          className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-px dark:border-slate-700 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {data.navigation.map((item) => {
            const selected = item.id === data.activeNavId;
            return (
              <span
                key={item.id}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium",
                  selected
                    ? "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                {item.label}
              </span>
            );
          })}
        </nav>
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">{data.pageTitle}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{data.pageSubtitle}</p>
        </div>
      </header>

      <PreviewCard>
        <PreviewCardHeader>
          <PreviewCardTitle>Filters</PreviewCardTitle>
          <PreviewCardDescription>
            Local filter controls for portfolio demos only.
          </PreviewCardDescription>
        </PreviewCardHeader>
        <PreviewCardContent className="flex flex-col gap-3 sm:flex-row">
          <label className="min-w-0 space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="block">Priority</span>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:min-w-[10rem]"
              value={priority}
              onChange={(event) => setPriority(event.target.value as PortfolioPriority | "")}
            >
              <option value="">All priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="min-w-0 space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="block">Technology Pillar</span>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:min-w-[12rem]"
              value={pillar}
              onChange={(event) => setPillar(event.target.value)}
            >
              <option value="">All pillars</option>
              {pillars.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </PreviewCardContent>
      </PreviewCard>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-base font-medium">
            {filtered.length} recommendation{filtered.length === 1 ? "" : "s"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {data.includedCount} included · Timeline {data.estimatedTimeline}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="min-w-0 overflow-hidden rounded-xl border border-slate-200 border-l-4 border-l-sky-600 bg-white p-4 shadow-sm dark:border-slate-700 dark:border-l-sky-500 dark:bg-slate-900 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="min-w-0 flex-1 text-base font-semibold leading-snug">{item.title}</h4>
              <PreviewBadge className={priorityBadgeClass(item.priority)}>
                {formatPriority(item.priority)}
              </PreviewBadge>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <PreviewBadge className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {item.pillar}
              </PreviewBadge>
              <PreviewBadge className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {STATUS_LABELS[item.status]}
              </PreviewBadge>
              <PreviewBadge className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {item.implementationPhase}
              </PreviewBadge>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-400">
              Why this matters
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {item.whyThisMatters}
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Business impact" value={item.businessImpact} />
              <Field label="Expected outcome" value={item.expectedOutcome} />
              <Field label="Maturity improvement" value={`+${item.maturityPoints} points`} />
              <Field label="Suggested service" value={item.suggestedService} />
            </dl>
          </article>
        ))}
      </div>
    </PreviewShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950/40">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  );
}
