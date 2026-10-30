import Link from "next/link";
import { ArrowRight, AlertTriangle, CheckCircle2, Compass } from "lucide-react";
import {
  ClientEmptyState,
  ClientSectionHeader,
  ClientStatusBadge,
} from "@/components/client-ui";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import {
  CLIENT_METRIC_VALUE,
  CLIENT_SURFACE_CARD,
  CLIENT_SURFACE_CARD_INDUSTRIAL,
} from "@/lib/client-ui/tokens";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { CustomerPillarDetailDto } from "@/lib/customer-portal/pillar-detail-dto";
import { cn } from "@/lib/utils";

type PillarDetailPanelProps = {
  detail: CustomerPillarDetailDto;
  className?: string;
};

export function PillarDetailPanel({ detail, className }: PillarDetailPanelProps) {
  return (
    <article
      className={cn(CLIENT_SURFACE_CARD_INDUSTRIAL, "space-y-6 p-5 sm:p-6", className)}
      aria-labelledby={`pillar-detail-${detail.code}`}
    >
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Pillar detail
        </p>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              id={`pillar-detail-${detail.code}`}
              className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            >
              {detail.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{detail.businessQuestion}</p>
          </div>
          <div className="rounded-sm border border-border/70 bg-muted/20 px-4 py-3 text-right">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Official score
            </p>
            <p
              className={cn(
                "text-3xl font-semibold",
                CLIENT_METRIC_VALUE,
                detail.score !== null
                  ? getScoreTextColorClass(detail.score)
                  : "text-muted-foreground",
              )}
            >
              {detail.score ?? "—"}
            </p>
            {detail.maturityLabel ? (
              <div className="mt-2 flex justify-end">
                <ClientStatusBadge tone="default">{detail.maturityLabel}</ClientStatusBadge>
              </div>
            ) : null}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{detail.maturitySummary}</p>
      </header>

      <section className="space-y-2" aria-labelledby={`pillar-strength-${detail.code}`}>
        <h3 id={`pillar-strength-${detail.code}`} className="text-sm font-semibold text-foreground">
          Demonstrated strength
        </h3>
        <div className={cn(CLIENT_SURFACE_CARD, "rounded-sm border bg-card p-4")}>
          <div className="flex items-start gap-2">
            <CheckCircle2
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                detail.strength.kind === "demonstrated" ? "text-success" : "text-muted-foreground",
              )}
              aria-hidden
            />
            <div className="min-w-0 space-y-2">
              <p className="text-sm text-foreground">{detail.strength.summary}</p>
              {detail.strength.kind === "comparative" ? (
                <ClientStatusBadge tone="muted">Relative performance</ClientStatusBadge>
              ) : null}
              {detail.strength.evidence ? (
                <p className="text-xs text-muted-foreground">
                  Evidence: {detail.strength.evidence.answerText}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2" aria-labelledby={`pillar-weakness-${detail.code}`}>
        <h3 id={`pillar-weakness-${detail.code}`} className="text-sm font-semibold text-foreground">
          Biggest documented weakness
        </h3>
        <div className={cn(CLIENT_SURFACE_CARD, "rounded-sm border bg-card p-4")}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
            <div className="min-w-0 space-y-2">
              <p className="text-sm text-foreground">{detail.weakness.summary}</p>
              {detail.weakness.evidence ? (
                <p className="text-xs text-muted-foreground">
                  Assessment evidence: {detail.weakness.evidence.answerText}
                </p>
              ) : null}
              {detail.weakness.relatedOpportunityHref ? (
                <Link
                  href={detail.weakness.relatedOpportunityHref}
                  className="inline-flex text-xs font-medium text-primary hover:underline"
                >
                  View related opportunity
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby={`pillar-ops-${detail.code}`}>
        <ClientSectionHeader
          title="Improvement opportunities"
          description="Customer-visible recommendations for this pillar. Complexity uses service playbook effort bands when mapped."
          actions={
            <Link
              href={detail.opportunitiesHref}
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              View all
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
            </Link>
          }
        />
        <h3 id={`pillar-ops-${detail.code}`} className="sr-only">
          Improvement opportunities
        </h3>
        {detail.opportunities.length === 0 ? (
          <ClientEmptyState
            icon={Compass}
            title="No active opportunities for this pillar"
            description="When assessment recommendations map to this domain, they will appear here."
            variant="default"
          />
        ) : (
          <ul className="space-y-2">
            {detail.opportunities.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    CLIENT_SURFACE_CARD,
                    "flex flex-col gap-2 rounded-sm border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-start sm:justify-between motion-reduce:transition-none",
                  )}
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={PRIORITY_BADGE[item.priority]}>{item.priorityLabel}</Badge>
                      <ClientStatusBadge tone="muted">{item.statusLabel}</ClientStatusBadge>
                    </div>
                    <p className="font-medium text-foreground">{item.title}</p>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                      Complexity
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {item.complexity.displayLabel}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">{detail.complexityFootnote}</p>
      </section>

      <section className="space-y-3" aria-labelledby={`pillar-next-${detail.code}`}>
        <h3 id={`pillar-next-${detail.code}`} className="text-sm font-semibold text-foreground">
          Recommended next actions
        </h3>
        {detail.nextActions.length === 0 ? (
          <p className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            No prioritized next actions for this pillar yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {detail.nextActions.map((item, index) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-sm border border-border bg-muted/15 px-4 py-3 text-sm transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <span className="min-w-0">
                    <span className="text-muted-foreground">{index + 1}. </span>
                    <span className="font-medium text-foreground">{item.title}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2">
          <Link href={detail.roadmapHref} className={buttonClassName({ variant: "outline", size: "sm" })}>
            Open Roadmap
          </Link>
          <Link
            href={detail.opportunitiesHref}
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            All pillar opportunities
          </Link>
        </div>
      </section>
    </article>
  );
}
