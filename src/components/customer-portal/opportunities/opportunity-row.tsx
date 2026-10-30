"use client";

import { ChevronDown } from "lucide-react";
import { ClientStatusBadge } from "@/components/client-ui";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import type { CustomerOpportunityItem } from "@/lib/customer-portal/opportunities-dto";
import { OpportunityDetail } from "@/components/customer-portal/opportunities/opportunity-detail";
import { cn } from "@/lib/utils";

type OpportunityRowProps = {
  opportunity: CustomerOpportunityItem;
  expanded: boolean;
  complexityFootnote: string;
  onToggle: () => void;
};

export function OpportunityRow({
  opportunity,
  expanded,
  complexityFootnote,
  onToggle,
}: OpportunityRowProps) {
  return (
    <article
      id={`rec-${opportunity.id}`}
      className={cn(
        CLIENT_SURFACE_CARD,
        "scroll-mt-24 overflow-hidden rounded-sm border bg-card",
        expanded && "border-primary/40",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`rec-detail-${opportunity.id}`}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:px-5"
      >
        <Badge
          variant={PRIORITY_BADGE[opportunity.priority]}
          className="mt-0.5 shrink-0 text-[0.65rem] uppercase"
        >
          {opportunity.priorityLabel}
        </Badge>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="font-medium leading-snug text-foreground">{opportunity.title}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{opportunity.pillarName}</span>
            <ClientStatusBadge tone={opportunity.isActive ? "default" : "muted"}>
              {opportunity.statusLabel}
            </ClientStatusBadge>
            <span className="text-xs text-muted-foreground">
              {opportunity.complexity.displayLabel}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
            expanded && "rotate-180 text-primary",
          )}
          aria-hidden
        />
      </button>

      {expanded ? (
        <div id={`rec-detail-${opportunity.id}`}>
          <OpportunityDetail
            opportunity={opportunity}
            complexityFootnote={complexityFootnote}
          />
        </div>
      ) : null}
    </article>
  );
}
