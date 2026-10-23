import { ArrowRight, CircleDot, FileCheck2, Flag, GitBranch, Route, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, IconLabel, VisualFrame } from "./visual-primitives";

const lineage = [
  { label: "Assessment finding", value: "Recovery testing is not documented", icon: FileCheck2 },
  { label: "Evidence trigger", value: "BC-04 · Response: Ad hoc", icon: CircleDot },
  { label: "Governed recommendation", value: "Establish recovery validation program", icon: ShieldAlert },
  { label: "Roadmap initiative", value: "Phase 1 · Stabilize", icon: Route },
];

export function RecommendationLineageVisual() {
  return (
    <VisualFrame label="Recommendation provenance & lifecycle">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <Eyebrow>Traceable by design</Eyebrow>
            <h3 className="mt-2 text-xl font-semibold">Every recommendation retains its reason for existing</h3>
          </div>
          <div className="flex gap-2"><Badge variant="destructive">High priority</Badge><Badge variant="warning">Accepted</Badge></div>
        </div>

        <div className="mt-7 grid gap-2 lg:grid-cols-[1fr_auto_1fr_auto_1.2fr_auto_1fr] lg:items-center">
          {lineage.map((item, index) => {
            const Icon = item.icon;
            return (
              <div className="contents" key={item.label}>
                <div className={`h-full border p-4 ${index === 2 ? "border-primary bg-primary/8" : "border-border bg-background"}`}>
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                  <div className="instrument-mono mt-4 text-[9px] uppercase tracking-wider text-muted-foreground">{item.label}</div>
                  <div className="mt-2 text-sm font-semibold leading-snug">{item.value}</div>
                </div>
                {index < lineage.length - 1 ? <ArrowRight className="mx-auto size-4 rotate-90 text-muted-foreground lg:rotate-0" aria-hidden="true" /> : null}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5">
          <IconLabel icon={Flag}>Business impact: reduce recovery uncertainty</IconLabel>
          <IconLabel icon={GitBranch}>Observed in 2 assessments</IconLabel>
          <IconLabel icon={CircleDot} tone="good">Lifecycle: accepted → planned</IconLabel>
        </div>
      </div>
    </VisualFrame>
  );
}

