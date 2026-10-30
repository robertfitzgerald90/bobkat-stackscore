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
  stackScore: number | null;
};

export function OverviewRoadmapProgress({ roadmap, stackScore }: OverviewRoadmapProgressProps) {
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-sm border border-border/70 bg-muted/15 p-4">
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
        <div className="rounded-sm border border-border/70 bg-muted/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {CUSTOMER_TERM_ROADMAP_PROGRESS}
          </p>
          <p className={cn("mt-2 text-3xl font-semibold text-primary", CLIENT_METRIC_VALUE)}>
            {roadmap.progressPercent}%
          </p>
          {roadmap.phaseLabel ? (
            <p className="mt-1 text-xs text-muted-foreground">Current focus: {roadmap.phaseLabel}</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              {roadmap.hasRoadmap
                ? "Track approved initiatives on your living execution plan."
                : "Roadmap progress appears once an execution plan is available."}
            </p>
          )}
        </div>
      </div>

      <div className={CLIENT_PROGRESS_TRACK} role="progressbar" aria-valuenow={roadmap.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Roadmap completion">
        <div
          className={CLIENT_PROGRESS_FILL}
          style={{ width: `${Math.max(0, Math.min(100, roadmap.progressPercent))}%` }}
        />
      </div>
    </section>
  );
}
