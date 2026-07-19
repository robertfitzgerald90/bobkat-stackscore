"use client";

import { CheckCircle2, Circle } from "lucide-react";
import type { DemoProjectTimelinePhase } from "@/lib/product-overview/types";
import { cn } from "@/lib/utils";

type ProjectMilestoneTimelineProps = {
  phases: DemoProjectTimelinePhase[];
  compact?: boolean;
};

export function ProjectMilestoneTimeline({ phases, compact = false }: ProjectMilestoneTimelineProps) {
  return (
    <div className={cn("relative", compact ? "py-2" : "py-4")}>
      <div
        className={cn(
          "grid gap-3",
          compact ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-7",
        )}
        role="list"
        aria-label="Project milestone timeline"
      >
        {phases.map((phase, index) => {
          const isCompleted = phase.status === "completed";
          const isCurrent = phase.status === "current";

          return (
            <div key={phase.id} role="listitem" className="relative flex flex-col items-center text-center">
              {index < phases.length - 1 ? (
                <div
                  className={cn(
                    "absolute left-[calc(50%+1rem)] top-4 hidden h-0.5 w-[calc(100%-2rem)] lg:block",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-primary/10 text-primary ring-4 ring-primary/20",
                  !isCompleted && !isCurrent && "border-border bg-background text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                ) : (
                  <Circle className={cn("h-3 w-3", isCurrent && "fill-primary")} aria-hidden />
                )}
              </div>
              <p
                className={cn(
                  "mt-2 text-xs font-medium leading-tight",
                  isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {phase.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
