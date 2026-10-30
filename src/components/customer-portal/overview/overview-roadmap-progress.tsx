import Link from "next/link";
import { ClientSectionHeader } from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import {
  CLIENT_METRIC_VALUE,
  CLIENT_PROGRESS_FILL,
  CLIENT_PROGRESS_TRACK,
  CLIENT_SURFACE_CARD_INDUSTRIAL,
} from "@/lib/client-ui/tokens";
import { CUSTOMER_TERM_ROADMAP_PROGRESS } from "@/lib/assessments/customer-reporting";
import type { CustomerOverviewDto } from "@/lib/customer-portal/overview";
import { cn } from "@/lib/utils";

type OverviewRoadmapProgressProps = {
  roadmap: CustomerOverviewDto["roadmap"];
  journey: CustomerOverviewDto["journey"];
  stackScore: number | null;
};

export function OverviewRoadmapProgress({
  roadmap,
  journey,
  stackScore,
}: OverviewRoadmapProgressProps) {
  const roadmapValue = roadmap.hasInitiatives
    ? `${roadmap.progressPercent}%`
    : (roadmap.emptyStateLabel ?? "Not started");

  return (
    <section
      className={cn(CLIENT_SURFACE_CARD_INDUSTRIAL, "space-y-4 p-5 sm:p-6")}
      aria-labelledby="overview-roadmap-heading"
    >
      <ClientSectionHeader
        eyebrow={CUSTOMER_TERM_ROADMAP_PROGRESS}
        title="Implementation progress"
        description={roadmap.footnote}
        actions={
          <Link href={roadmap.href} className={buttonClassName({ variant: "outline", size: "sm" })}>
            Open Roadmap
          </Link>
        }
      />
      <h2 id="overview-roadmap-heading" className="sr-only">
        Roadmap progress
      </h2>

      <div className="grid auto-rows-fr gap-4 sm:grid-cols-3">
        <div className="flex h-full flex-col rounded-sm border border-border/70 bg-muted/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Official {roadmap.stackScoreLabel}
          </p>
          <p className={cn("mt-2 text-3xl font-semibold", CLIENT_METRIC_VALUE)}>
            {stackScore ?? "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Changes only after a completed reassessment.
          </p>
        </div>
        <div className="flex h-full flex-col rounded-sm border border-border/70 bg-muted/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {CUSTOMER_TERM_ROADMAP_PROGRESS}
          </p>
          <p
            className={cn(
              "mt-2 font-semibold text-primary",
              roadmap.hasInitiatives ? "text-3xl" : "text-xl leading-snug sm:text-2xl",
              CLIENT_METRIC_VALUE,
            )}
          >
            {roadmapValue}
          </p>
          {roadmap.hasInitiatives && roadmap.phaseLabel ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Current focus: {roadmap.phaseLabel}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              {roadmap.hasRoadmap
                ? "Initiative completion appears once your execution plan includes roadmap work."
                : "Roadmap progress appears once an execution plan is available."}
            </p>
          )}
        </div>
        <div className="flex h-full flex-col rounded-sm border border-border/70 bg-muted/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Journey Progress
          </p>
          <p className={cn("mt-2 text-3xl font-semibold", CLIENT_METRIC_VALUE)}>
            {journey.progressPercent}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {journey.phaseLabel
              ? `Assessment journey: ${journey.phaseLabel}`
              : "Assessment and onboarding milestones — separate from roadmap initiatives."}
          </p>
        </div>
      </div>

      {roadmap.hasInitiatives ? (
        <div
          className={CLIENT_PROGRESS_TRACK}
          role="progressbar"
          aria-valuenow={roadmap.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Roadmap completion"
        >
          <div
            className={CLIENT_PROGRESS_FILL}
            style={{ width: `${Math.max(0, Math.min(100, roadmap.progressPercent))}%` }}
          />
        </div>
      ) : (
        <div
          className={CLIENT_PROGRESS_TRACK}
          role="progressbar"
          aria-valuenow={0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Roadmap completion not started"
        >
          <div className={CLIENT_PROGRESS_FILL} style={{ width: "0%" }} />
        </div>
      )}
    </section>
  );
}
