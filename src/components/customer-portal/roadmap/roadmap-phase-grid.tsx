import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClientSectionHeader, ClientStatusBadge } from "@/components/client-ui";
import {
  CLIENT_EQUAL_CARD_GRID,
  CLIENT_INTERACTIVE_TILE,
  CLIENT_SURFACE_CARD,
} from "@/lib/client-ui/tokens";
import type { CustomerRoadmapPhaseDto } from "@/lib/customer-portal/roadmap-dto";
import { cn } from "@/lib/utils";

type RoadmapPhaseGridProps = {
  phases: CustomerRoadmapPhaseDto[];
};

export function RoadmapPhaseGrid({ phases }: RoadmapPhaseGridProps) {
  return (
    <section className="space-y-4" aria-labelledby="roadmap-phases-heading">
      <ClientSectionHeader
        eyebrow="Implementation phases"
        title="Phased execution plan"
        description="Existing roadmap phases in approved order — open a phase for initiatives and proposals."
      />
      <h2 id="roadmap-phases-heading" className="sr-only">
        Roadmap phases
      </h2>

      {phases.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          No customer-visible phases are available on this roadmap yet.
        </p>
      ) : (
        <ul className={cn(CLIENT_EQUAL_CARD_GRID, "xl:grid-cols-2")}>
          {phases.map((phase) => (
            <li key={phase.id} className="h-full">
              <Link
                href={phase.href}
                className={cn(
                  CLIENT_INTERACTIVE_TILE,
                  CLIENT_SURFACE_CARD,
                  "h-full justify-between gap-3 p-5",
                  phase.isCurrent && "border-primary/50 bg-primary/[0.04]",
                )}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                      {phase.subtitle}
                    </p>
                    {phase.isCurrent ? (
                      <ClientStatusBadge tone="success">Current</ClientStatusBadge>
                    ) : null}
                    <ClientStatusBadge tone="muted">{phase.statusLabel}</ClientStatusBadge>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {phase.name}
                  </h3>
                  {phase.purpose ? (
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {phase.purpose}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-end justify-between gap-3 pt-2">
                  <div className="text-xs text-muted-foreground">
                    <p>
                      {phase.completedInitiativeCount}/{phase.initiativeCount} initiatives complete
                    </p>
                    {phase.timeline ? <p className="mt-0.5">{phase.timeline}</p> : null}
                  </div>
                  <span className="inline-flex items-center text-xs font-medium text-primary">
                    Open
                    <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
