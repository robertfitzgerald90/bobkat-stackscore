import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import type { CustomerOpportunitiesSummary } from "@/lib/customer-portal/opportunities-dto";
import { cn } from "@/lib/utils";

type OpportunitySummaryProps = {
  summary: CustomerOpportunitiesSummary;
  matchingLabel: string;
};

const STATS: Array<{
  key: keyof Pick<
    CustomerOpportunitiesSummary,
    "activeOpportunities" | "completed" | "deferred" | "declined"
  >;
  label: string;
}> = [
  { key: "activeOpportunities", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "deferred", label: "Deferred" },
  { key: "declined", label: "Declined" },
];

export function OpportunitySummary({ summary, matchingLabel }: OpportunitySummaryProps) {
  return (
    <section
      className={cn(CLIENT_SURFACE_CARD, "rounded-sm border bg-card p-4 sm:p-5")}
      aria-label={`${summary.term} summary`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {summary.term}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{matchingLabel}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {STATS.map((stat) => (
            <div key={stat.key} className="min-w-[4.5rem]">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
                {summary[stat.key]}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
