import type { ClientRoadmapDashboard } from "@/lib/client-roadmap/types";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

export function RoadmapKpiStrip({ dashboard }: { dashboard: ClientRoadmapDashboard }) {
  const items = [
    {
      label: "Current StackScore",
      value: dashboard.scoreJourney.baselineScore,
      score: true,
    },
    {
      label: "Effective StackScore",
      value: dashboard.scoreJourney.effectiveScore,
      score: true,
    },
    {
      label: "Projected StackScore",
      value: dashboard.scoreJourney.projectedFinalScore,
      score: true,
    },
    {
      label: "Roadmap Completion",
      value: `${dashboard.metrics.completionPercent}%`,
    },
    {
      label: "Current Phase",
      value: dashboard.metrics.currentPhaseName ?? "Complete",
    },
    {
      label: "Proposal Status",
      value: dashboard.metrics.currentPhaseProposalStatusLabel ?? "Not generated",
    },
    {
      label: "Implementation Status",
      value: dashboard.metrics.currentPhaseImplementationStatusLabel ?? "—",
    },
    {
      label: "Remaining Investment",
      value: formatCurrency(dashboard.metrics.remainingOneTimeInvestment),
      hint:
        dashboard.metrics.remainingMonthlyRecurring > 0
          ? `+ ${formatCurrency(dashboard.metrics.remainingMonthlyRecurring)}/mo remaining`
          : undefined,
    },
    {
      label: "Current Monthly Services",
      value:
        dashboard.metrics.currentMonthlyServices > 0
          ? `${formatCurrency(dashboard.metrics.currentMonthlyServices)}/mo`
          : "None",
    },
    {
      label: "Projected Monthly After Completion",
      value:
        dashboard.metrics.projectedMonthlyServicesAfterCompletion > 0
          ? `${formatCurrency(dashboard.metrics.projectedMonthlyServicesAfterCompletion)}/mo`
          : "None",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className={cn("rounded-xl border bg-card p-4", CLIENT_SURFACE_CARD)}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
          <p
            className={cn(
              "mt-2 text-2xl font-bold tabular-nums tracking-tight",
              item.score && typeof item.value === "number"
                ? getScoreTextColorClass(item.value)
                : "text-foreground",
            )}
          >
            {item.value}
          </p>
          {item.hint ? (
            <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
