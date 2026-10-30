"use client";

import { ChevronRight } from "lucide-react";
import { ClientStatusBadge } from "@/components/client-ui";
import { CLIENT_INTERACTIVE_TILE, CLIENT_METRIC_VALUE } from "@/lib/client-ui/tokens";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { CustomerPillarTile } from "@/lib/customer-portal/pillar-detail-dto";
import { cn } from "@/lib/utils";

type PillarTileProps = {
  pillar: CustomerPillarTile;
  selected?: boolean;
  onSelect?: (code: CustomerPillarTile["code"]) => void;
  /** When true, render as a button for in-page selection; otherwise use href navigation. */
  interactive?: boolean;
};

function scoreBarWidth(score: number | null): string {
  if (score === null) return "0%";
  return `${Math.max(0, Math.min(100, score))}%`;
}

export function PillarTile({
  pillar,
  selected = false,
  onSelect,
  interactive = false,
}: PillarTileProps) {
  const incomplete = pillar.score === null;
  const className = cn(
    CLIENT_INTERACTIVE_TILE,
    "group text-left motion-reduce:transition-none",
    selected && "border-primary bg-primary/10 ring-1 ring-primary/40",
  );

  const body = (
    <>
      <div className="flex flex-1 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{pillar.name}</p>
          <p
            className={cn(
              "mt-2 text-2xl font-semibold",
              CLIENT_METRIC_VALUE,
              incomplete ? "text-muted-foreground" : getScoreTextColorClass(pillar.score!),
            )}
          >
            {incomplete ? "—" : pillar.score}
          </p>
        </div>
        <ChevronRight
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors motion-reduce:transition-none",
            selected ? "text-primary" : "group-hover:text-primary",
          )}
          aria-hidden
        />
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-sm bg-muted" aria-hidden>
        <div
          className="h-full rounded-sm bg-primary transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: scoreBarWidth(pillar.score) }}
        />
      </div>
      <div className="mt-auto pt-3">
        {pillar.maturityLabel ? (
          <ClientStatusBadge tone={incomplete ? "muted" : selected ? "success" : "default"}>
            {pillar.maturityLabel}
          </ClientStatusBadge>
        ) : (
          <ClientStatusBadge tone="muted">Not assessed</ClientStatusBadge>
        )}
      </div>
    </>
  );

  if (interactive && onSelect) {
    return (
      <button
        type="button"
        className={className}
        aria-pressed={selected}
        aria-current={selected ? "true" : undefined}
        aria-label={`${pillar.name}: ${pillar.score ?? "not scored"}${
          pillar.maturityLabel ? `, ${pillar.maturityLabel}` : ""
        }. ${selected ? "Selected" : "Select pillar"}`}
        onClick={() => onSelect(pillar.code)}
      >
        {body}
      </button>
    );
  }

  return (
    <a
      href={pillar.href}
      className={className}
      aria-current={selected ? "true" : undefined}
      aria-label={`${pillar.name}: ${pillar.score ?? "not scored"}${
        pillar.maturityLabel ? `, ${pillar.maturityLabel}` : ""
      }. Open in Explore.`}
    >
      {body}
    </a>
  );
}
