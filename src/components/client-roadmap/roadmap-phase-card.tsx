import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { RoadmapPhaseView } from "@/lib/client-roadmap/types";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { buttonClassName } from "@/components/ui/button";
import { RoadmapStatusBadge } from "./roadmap-status-badge";

export function RoadmapPhaseCard({
  clientId,
  phase,
}: {
  clientId: string;
  phase: RoadmapPhaseView;
}) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#082f5b]">
            {phase.subtitle}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{phase.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{phase.timeline}</p>
        </div>
        <RoadmapStatusBadge status={phase.status} />
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {phase.executiveSummary}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            StackScore
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-700">
            +{phase.expectedScoreImprovement} pts
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            One-Time
          </p>
          <p className="mt-1 text-sm font-semibold">
            {formatCurrency(phase.oneTimeInvestment)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Monthly
          </p>
          <p className="mt-1 text-sm font-semibold">
            {phase.monthlyRecurringInvestment > 0
              ? `${formatCurrency(phase.monthlyRecurringInvestment)}/mo`
              : "—"}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Link
          href={`/clients/${clientId}/roadmap/phases/${phase.id}`}
          className={buttonClassName({ variant: "outline", size: "sm" })}
        >
          Open phase workspace
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
