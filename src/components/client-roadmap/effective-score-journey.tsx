import { ArrowDown } from "lucide-react";
import type { EffectiveScoreJourney } from "@/lib/client-roadmap/types";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

export function EffectiveScoreJourneyView({ journey }: { journey: EffectiveScoreJourney }) {
  const steps = [
    { label: "Current", value: journey.baselineScore, emphasize: true },
    { label: "Completed Work", value: `+${journey.completedImprovement}` },
    { label: "Effective Score", value: journey.effectiveScore, emphasize: true },
    { label: "Remaining Opportunity", value: journey.remainingOpportunity },
    { label: "Projected Final", value: journey.projectedFinalScore, emphasize: true },
  ];

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        StackScore Progress
      </p>
      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-stretch md:gap-3">
        {steps.map((step, index) => (
          <div key={step.label} className="flex flex-1 flex-col items-stretch md:flex-row md:items-center">
            <div className="flex-1 rounded-lg border bg-slate-50/80 px-3 py-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                {step.label}
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-bold tabular-nums",
                  step.emphasize && typeof step.value === "number"
                    ? getScoreTextColorClass(step.value)
                    : "text-foreground",
                )}
              >
                {step.value}
              </p>
            </div>
            {index < steps.length - 1 ? (
              <ArrowDown className="mx-auto my-1 h-4 w-4 text-muted-foreground md:mx-2 md:rotate-[-90deg]" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
