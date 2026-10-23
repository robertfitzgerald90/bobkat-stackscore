import { CheckCircle2, Circle, Clock3, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { roadmapPhases } from "./demo-data";
import { Eyebrow, VisualFrame } from "./visual-primitives";

const statusConfig = {
  Completed: { icon: CheckCircle2, badge: "success" as const },
  "In progress": { icon: PlayCircle, badge: "warning" as const },
  Approved: { icon: Clock3, badge: "secondary" as const },
  Planned: { icon: Circle, badge: "outline" as const },
};

export function LivingRoadmapTimeline() {
  return (
    <VisualFrame label="Living execution roadmap">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><Eyebrow>Governed execution</Eyebrow><h3 className="mt-2 text-xl font-semibold">Strategy becomes sequenced, approved work</h3></div>
          <div className="instrument-mono text-xs text-muted-foreground">Baseline 58 → Effective 74 → Projected 84</div>
        </div>
        <div className="relative mt-8 grid gap-3 lg:grid-cols-4">
          <div className="absolute left-[8%] right-[8%] top-4 hidden h-px bg-border lg:block" />
          {roadmapPhases.map((phase, index) => {
            const config = statusConfig[phase.status as keyof typeof statusConfig];
            const Icon = config.icon;
            return (
              <details className="group relative border border-border bg-background p-4 open:border-primary/50" key={phase.name} open={index < 2 || undefined}>
                <summary className="list-none cursor-pointer">
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="flex size-8 items-center justify-center border border-border bg-card"><Icon className="size-4 text-primary" /></span>
                    <span className="instrument-mono text-[9px] uppercase text-muted-foreground">{phase.period}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-2"><span className="font-semibold">{phase.name}</span><Badge variant={config.badge}>{phase.status}</Badge></div>
                  <div className="instrument-mono mt-3 text-xs text-muted-foreground">{phase.investment}</div>
                  <div className="mt-1 text-xs font-medium text-success">{phase.improvement}</div>
                </summary>
                <ul className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  {phase.initiatives.map((initiative) => <li className="flex gap-2" key={initiative}><span className="mt-1 size-1 bg-primary" />{initiative}</li>)}
                </ul>
              </details>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Select a phase to reveal its initiatives. The roadmap remains legible without interaction.</p>
      </div>
    </VisualFrame>
  );
}

