import { ClientStatusBadge } from "@/components/client-ui";
import {
  CLIENT_METRIC_VALUE,
  CLIENT_SURFACE_CARD_INDUSTRIAL,
} from "@/lib/client-ui/tokens";
import { formatMaturityScore, getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { CustomerPillarDetailDto } from "@/lib/customer-portal/pillar-detail-dto";
import { cn } from "@/lib/utils";

type PillarOverviewProps = {
  detail: CustomerPillarDetailDto;
};

/** SS-UX-016-R1 — Full-width selected pillar overview (single score display). */
export function PillarOverview({ detail }: PillarOverviewProps) {
  return (
    <section
      className={cn(CLIENT_SURFACE_CARD_INDUSTRIAL, "space-y-4 p-5 sm:p-6")}
      aria-labelledby={`pillar-overview-${detail.code}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Selected pillar
          </p>
          <h2
            id={`pillar-overview-${detail.code}`}
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {detail.name}
          </h2>
          <p className="text-sm text-muted-foreground">{detail.businessQuestion}</p>
          <p className="text-sm leading-relaxed text-foreground/90">{detail.maturitySummary}</p>
        </div>

        <div className="shrink-0 rounded-sm border border-border/70 bg-muted/15 px-4 py-3 text-right">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Official score
          </p>
          <p
            className={cn(
              "text-3xl font-semibold sm:text-4xl",
              CLIENT_METRIC_VALUE,
              detail.score !== null
                ? getScoreTextColorClass(detail.score)
                : "text-muted-foreground",
            )}
          >
            {detail.score !== null ? (
              <>
                {formatMaturityScore(detail.score)}
                <span className="text-base font-medium text-muted-foreground"> / 100</span>
              </>
            ) : (
              formatMaturityScore(null)
            )}
          </p>
          {detail.maturityLabel ? (
            <div className="mt-2 flex justify-end">
              <ClientStatusBadge tone="default">{detail.maturityLabel} Maturity</ClientStatusBadge>
            </div>
          ) : (
            <div className="mt-2 flex justify-end">
              <ClientStatusBadge tone="muted">Not assessed</ClientStatusBadge>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <MetricChip
          label="Assessed controls"
          value={detail.hasCompletedAssessment ? String(detail.controlsAssessed) : "—"}
          hint={
            detail.controlsScorable > 0
              ? `${detail.controlsScorable} included in scoring`
              : undefined
          }
        />
        <MetricChip
          label="Improvement opportunities"
          value={String(detail.opportunityCount)}
          hint="Customer-visible recommendations"
        />
        <MetricChip
          label="Related work"
          value={String(detail.roadmapInitiatives.length + detail.relatedProjects.length)}
          hint="Roadmap initiatives and projects"
        />
      </div>
    </section>
  );
}

function MetricChip({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-sm border border-border/60 bg-muted/10 px-3 py-2.5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-1 text-lg font-semibold", CLIENT_METRIC_VALUE)}>{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
