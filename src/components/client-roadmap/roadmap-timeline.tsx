import { Check, Circle, Clock } from "lucide-react";
import type { ClientRoadmapDashboard } from "@/lib/client-roadmap/types";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { ROADMAP_JOURNEY_MILESTONE_LABELS } from "@/lib/phase-proposals/types";
import { RoadmapStatusBadge } from "./roadmap-status-badge";
import { cn } from "@/lib/utils";

function PhaseIcon({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Check className="h-4 w-4" />
      </div>
    );
  }
  if (status === "awaiting_approval" || status === "in_progress" || status === "approved") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
        <Clock className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background text-muted-foreground">
      <Circle className="h-3.5 w-3.5" />
    </div>
  );
}

export function RoadmapTimeline({ dashboard }: { dashboard: ClientRoadmapDashboard }) {
  return (
    <div className={cn("rounded-xl border bg-card p-5", CLIENT_SURFACE_CARD)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Implementation Timeline
      </p>
      <div className="mt-5 space-y-0">
        <div className="grid grid-cols-[2rem_1fr] gap-x-4">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>
            <div className="w-px flex-1 bg-border" />
          </div>
          <div className="pb-6">
            <p className="text-sm font-semibold text-primary">Assessment Complete</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {dashboard.assessmentName ?? "Technology maturity assessment"}
            </p>
          </div>
        </div>

        {dashboard.phases.map((phase, index) => (
          <div key={phase.id} className="grid grid-cols-[2rem_1fr] gap-x-4">
            <div className="flex flex-col items-center">
              <PhaseIcon status={phase.status} />
              {index < dashboard.phases.length - 1 ? (
                <div className="w-px flex-1 bg-border" />
              ) : null}
            </div>
            <div className={cn("pb-6", index === dashboard.phases.length - 1 && "pb-0")}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">
                  {phase.subtitle} — {phase.name}
                </p>
                <RoadmapStatusBadge status={phase.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{phase.timeline}</p>
              {phase.latestProposal ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Proposal: {phase.latestProposal.statusLabel}
                </p>
              ) : null}
              {phase.journeyMilestones.length > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {phase.journeyMilestones
                    .map((milestone) => ROADMAP_JOURNEY_MILESTONE_LABELS[milestone])
                    .join(" · ")}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
