import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { RoadmapPhaseView } from "@/lib/client-roadmap/types";
import {
  CLIENT_INTERACTIVE_CARD,
  CLIENT_METRIC_WELL,
  CLIENT_SECTION_EYEBROW,
} from "@/lib/client-ui/tokens";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { buttonClassName } from "@/components/ui/button";
import { RoadmapStatusBadge } from "./roadmap-status-badge";
import { cn } from "@/lib/utils";

export function RoadmapPhaseCard({
  clientId,
  phase,
}: {
  clientId: string;
  phase: RoadmapPhaseView;
}) {
  return (
    <article className={cn(CLIENT_INTERACTIVE_CARD, "bg-card p-5 shadow-sm")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={cn(CLIENT_SECTION_EYEBROW, "text-xs tracking-wide")}>{phase.subtitle}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{phase.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{phase.timeline}</p>
        </div>
        <RoadmapStatusBadge status={phase.status} />
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {phase.executiveSummary}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={CLIENT_METRIC_WELL}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            StackScore
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            +{phase.expectedScoreImprovement} pts
          </p>
        </div>
        <div className={CLIENT_METRIC_WELL}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            One-Time
          </p>
          <p className="mt-1 text-sm font-semibold">{formatCurrency(phase.oneTimeInvestment)}</p>
        </div>
        <div className={CLIENT_METRIC_WELL}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Monthly
          </p>
          <p className="mt-1 text-sm font-semibold">
            {phase.monthlyRecurringInvestment > 0
              ? `${formatCurrency(phase.monthlyRecurringInvestment)}/mo`
              : "—"}
          </p>
        </div>
        <div className={CLIENT_METRIC_WELL}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Proposal
          </p>
          <p className="mt-1 text-sm font-semibold">
            {phase.latestProposal?.statusLabel ?? "Not generated"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/clients/${clientId}/roadmap/phases/${phase.id}`}
          className={buttonClassName({ variant: "outline", size: "sm" })}
        >
          Open phase workspace
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        {phase.latestProposal ? (
          <Link
            href={`/clients/${clientId}/phase-proposals/${phase.latestProposal.id}`}
            className={buttonClassName({ variant: "secondary", size: "sm" })}
          >
            View proposal
          </Link>
        ) : null}
      </div>
    </article>
  );
}
