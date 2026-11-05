import Link from "next/link";
import type { CustomerOverviewDto } from "@/lib/customer-portal/overview-dto";
import { summarizePlanner } from "@/lib/planner/model";
import { buttonClassName } from "@/components/ui/button";

export function OverviewCommandSummary({
  overview,
}: {
  overview: CustomerOverviewDto;
}) {
  const actions = summarizePlanner(overview.plannerTasks ?? []);
  const metrics = [
    {
      label: "Official StackScore",
      value: overview.stackScore === null ? "—" : `${overview.stackScore}`,
      hint: overview.maturityLabel ?? "Not assessed",
      suffix: "/ 100",
    },
    {
      label: "Assessment priorities",
      value: String(overview.activeOpportunityCount),
      hint: "Active recommendations",
      suffix: "",
    },
    {
      label: "Roadmap progress",
      value: overview.roadmap.hasInitiatives
        ? `${overview.roadmap.progressPercent}%`
        : "Not started",
      hint:
        overview.roadmap.phaseLabel ?? "Approved implementation initiatives",
      suffix: "",
    },
    {
      label: "Planner actions",
      value: actions.total ? `${actions.progress}%` : "No actions yet",
      hint: `${actions.complete} of ${actions.total} actions complete`,
      suffix: "",
    },
  ];
  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {overview.companyName}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Technology overview
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {overview.assessedAtLabel
              ? `Latest assessment: ${overview.assessedAtLabel}`
              : "Your technology command center"}
          </p>
        </div>
        {overview.reportHref && (
          <Link
            href={overview.reportHref}
            className={buttonClassName({ variant: "outline" })}
          >
            View assessment report
          </Link>
        )}
      </div>
      <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`flex min-w-0 flex-col rounded-xl border border-border p-5 ${i === 0 ? "bg-primary/5" : "bg-card"}`}
          >
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="mt-3 text-2xl font-semibold tabular-nums">
              {m.value}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                {m.suffix}
              </span>
            </p>
            <p className="mt-auto pt-3 text-xs text-muted-foreground">
              {m.hint}
            </p>
          </div>
        ))}
      </div>
    </header>
  );
}
