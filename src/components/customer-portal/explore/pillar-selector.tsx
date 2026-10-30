"use client";

import { ClientStatusBadge } from "@/components/client-ui";
import { CLIENT_METRIC_VALUE } from "@/lib/client-ui/tokens";
import { formatMaturityScore, getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { CustomerPillarTile } from "@/lib/customer-portal/pillar-detail-dto";
import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";
import { cn } from "@/lib/utils";

type PillarSelectorProps = {
  pillars: CustomerPillarTile[];
  selected: TechnologyPillarCode | null;
  onSelect: (code: TechnologyPillarCode) => void;
};

/**
 * SS-UX-016-R1 — Compact eight-pillar selector for the Intelligence Center.
 * Overview continues to use the larger PillarTile grid.
 */
export function PillarSelector({ pillars, selected, onSelect }: PillarSelectorProps) {
  return (
    <section className="space-y-2" aria-label="Technology pillars">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        Technology pillars
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        {pillars.map((pillar) => {
          const isSelected = selected === pillar.code;
          const incomplete = pillar.score === null;
          return (
            <button
              key={pillar.code}
              type="button"
              onClick={() => onSelect(pillar.code)}
              aria-pressed={isSelected}
              aria-current={isSelected ? "true" : undefined}
              aria-label={`${pillar.name}: ${pillar.score === null ? "not scored" : formatMaturityScore(pillar.score)}${
                pillar.maturityLabel ? `, ${pillar.maturityLabel}` : ""
              }. ${isSelected ? "Selected" : "Select pillar"}`}
              className={cn(
                "flex min-h-16 flex-col gap-1 rounded-sm border px-2.5 py-2 text-left transition-colors motion-reduce:transition-none",
                "hover:border-primary hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                  : "border-border bg-background",
              )}
            >
              <p className="line-clamp-2 text-[0.7rem] font-semibold leading-tight text-foreground">
                {pillar.name}
              </p>
              <p
                className={cn(
                  "text-base font-semibold",
                  CLIENT_METRIC_VALUE,
                  incomplete
                    ? "text-muted-foreground"
                    : getScoreTextColorClass(pillar.score!),
                )}
              >
                {formatMaturityScore(pillar.score)}
              </p>
              {pillar.maturityLabel ? (
                <ClientStatusBadge tone={isSelected ? "success" : "muted"}>
                  {pillar.maturityLabel}
                </ClientStatusBadge>
              ) : (
                <ClientStatusBadge tone="muted">Not assessed</ClientStatusBadge>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
