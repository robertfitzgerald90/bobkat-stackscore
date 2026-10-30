import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ClientSectionHeader, ClientStatusBadge } from "@/components/client-ui";
import { CLIENT_INTERACTIVE_TILE, CLIENT_METRIC_VALUE } from "@/lib/client-ui/tokens";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { CustomerOverviewPillar } from "@/lib/customer-portal/overview";
import { cn } from "@/lib/utils";

type OverviewPillarGridProps = {
  pillars: CustomerOverviewPillar[];
};

function scoreBarWidth(score: number | null): string {
  if (score === null) return "0%";
  return `${Math.max(0, Math.min(100, score))}%`;
}

export function OverviewPillarGrid({ pillars }: OverviewPillarGridProps) {
  return (
    <section className="space-y-4" aria-labelledby="overview-pillars-heading">
      <ClientSectionHeader
        eyebrow="Technology Maturity"
        title="Eight technology pillars"
        description="Official pillar scores from your assessment. Select a pillar to open Explore."
      />
      <h2 id="overview-pillars-heading" className="sr-only">
        Eight technology pillars
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {pillars.map((pillar) => {
          const incomplete = pillar.score === null;
          return (
            <Link
              key={pillar.code}
              href={pillar.href}
              className={cn(
                CLIENT_INTERACTIVE_TILE,
                "group rounded-sm p-4 motion-reduce:transition-none",
              )}
              aria-label={`${pillar.name}: ${pillar.score ?? "not scored"}${
                pillar.maturityLabel ? `, ${pillar.maturityLabel}` : ""
              }. Open in Explore.`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{pillar.name}</p>
                  <p
                    className={cn(
                      "mt-2 text-2xl font-semibold",
                      CLIENT_METRIC_VALUE,
                      incomplete
                        ? "text-muted-foreground"
                        : getScoreTextColorClass(pillar.score!),
                    )}
                  >
                    {incomplete ? "—" : pillar.score}
                  </p>
                </div>
                <ChevronRight
                  className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary motion-reduce:transition-none"
                  aria-hidden
                />
              </div>
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-sm bg-muted"
                aria-hidden
              >
                <div
                  className="h-full rounded-sm bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: scoreBarWidth(pillar.score) }}
                />
              </div>
              <div className="mt-3">
                {pillar.maturityLabel ? (
                  <ClientStatusBadge tone={incomplete ? "muted" : "default"}>
                    {pillar.maturityLabel}
                  </ClientStatusBadge>
                ) : (
                  <ClientStatusBadge tone="muted">Not assessed</ClientStatusBadge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
