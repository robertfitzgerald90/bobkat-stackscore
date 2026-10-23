import {
  Activity,
  ClipboardCheck,
  Compass,
  Gauge,
  ListChecks,
  RefreshCw,
  Route,
} from "lucide-react";
import { ArrowConnector, Eyebrow, VisualFrame } from "./visual-primitives";

const stages = [
  { label: "Discover", sub: "Understand", icon: Compass },
  { label: "Assess", sub: "Evidence", icon: ClipboardCheck },
  { label: "Prioritize", sub: "Decide", icon: ListChecks },
  { label: "Plan", sub: "Invest", icon: Route },
  { label: "Execute", sub: "Govern", icon: Activity },
  { label: "Measure", sub: "Prove", icon: Gauge },
  { label: "Reassess", sub: "Repeat", icon: RefreshCw },
];

export function StackScoreLifecycleHero() {
  return (
    <VisualFrame className="bg-background" label="Technology consulting lifecycle">
      <div className="relative px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="max-w-3xl">
          <Eyebrow>StackScore operating model</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Turning Technology Consulting into a Measurable Operating System
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Evidence becomes a decision, a funded plan, governed execution, and a new measurable baseline—not another disconnected report.
          </p>
        </div>

        <div className="mt-9 grid gap-3 md:flex md:items-center md:gap-2">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <div className="contents" key={stage.label}>
                <div className="group min-w-0 border border-border bg-card p-3 transition-colors hover:border-primary motion-reduce:transition-none md:w-[8.25rem]">
                  <div className="flex items-center justify-between">
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                    <span className="instrument-mono text-[9px] text-muted-foreground">0{index + 1}</span>
                  </div>
                  <div className="mt-4 text-sm font-semibold text-foreground">{stage.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{stage.sub}</div>
                </div>
                {index < stages.length - 1 ? <ArrowConnector /> : null}
              </div>
            );
          })}
        </div>

        <div className="relative mt-7 border border-primary/35 bg-primary/8 px-4 py-4 sm:px-6">
          <div className="absolute inset-x-[7%] top-0 h-px bg-primary/35" />
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="text-sm font-semibold text-foreground">Living Technology Profile</div>
              <div className="mt-1 text-xs text-muted-foreground">The persistent client truth connecting every stage</div>
            </div>
            <div className="instrument-mono flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-wider text-primary">
              <span>Context</span><span>Evidence</span><span>Decisions</span><span>History</span>
            </div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

