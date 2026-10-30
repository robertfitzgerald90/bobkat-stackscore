import {
  CLIENT_METRIC_VALUE,
  CLIENT_PROGRESS_FILL,
  CLIENT_PROGRESS_TRACK,
  CLIENT_SURFACE_CARD_INDUSTRIAL,
} from "@/lib/client-ui/tokens";
import type { CustomerRoadmapSummaryDto } from "@/lib/customer-portal/roadmap-dto";
import { ClientStatusBadge } from "@/components/client-ui";
import { cn } from "@/lib/utils";

type RoadmapExecutiveSummaryProps = {
  summary: CustomerRoadmapSummaryDto;
  isDraft: boolean;
  title: string;
};

export function RoadmapExecutiveSummary({
  summary,
  isDraft,
  title,
}: RoadmapExecutiveSummaryProps) {
  return (
    <section
      className={cn(CLIENT_SURFACE_CARD_INDUSTRIAL, "space-y-5 p-5 sm:p-6")}
      aria-labelledby="roadmap-executive-summary"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Implementation roadmap
          </p>
          <h2 id="roadmap-executive-summary" className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{summary.footnote}</p>
        </div>
        {isDraft ? <ClientStatusBadge tone="warning">Draft</ClientStatusBadge> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Metric
          label={`Official ${summary.stackScoreLabel}`}
          value={String(summary.officialStackScore)}
          hint="Changes only after a completed reassessment."
        />
        <Metric
          label={summary.progressLabel}
          value={`${summary.progressPercent}%`}
          hint={
            summary.currentPhaseName
              ? `Current phase: ${summary.currentPhaseName}`
              : "No active implementation phase."
          }
          accent
        />
        <Metric
          label="Initiatives"
          value={`${summary.initiativesCompleted} / ${summary.initiativesTotal}`}
          hint={`${summary.initiativesRemaining} remaining`}
        />
      </div>

      <div
        className={CLIENT_PROGRESS_TRACK}
        role="progressbar"
        aria-valuenow={summary.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Roadmap completion"
      >
        <div
          className={CLIENT_PROGRESS_FILL}
          style={{ width: `${Math.max(0, Math.min(100, summary.progressPercent))}%` }}
        />
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-sm border border-border/70 bg-muted/15 p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold",
          CLIENT_METRIC_VALUE,
          accent && "text-primary",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
