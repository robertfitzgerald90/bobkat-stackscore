"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";
import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPageShell,
} from "@/components/client-ui";
import { OpportunityFilters } from "@/components/customer-portal/opportunities/opportunity-filters";
import { OpportunityRow } from "@/components/customer-portal/opportunities/opportunity-row";
import { OpportunitySummary } from "@/components/customer-portal/opportunities/opportunity-summary";
import {
  CUSTOMER_TERM_IMPROVEMENT_OPPORTUNITIES,
} from "@/lib/assessments/customer-reporting";
import { clientRecommendationsPath } from "@/lib/clients/paths";
import type {
  CustomerOpportunitiesDto,
  CustomerOpportunityFilters,
} from "@/lib/customer-portal/opportunities-dto";

type CustomerRecommendationsViewProps = {
  clientId: string;
  dto: CustomerOpportunitiesDto;
  filters: CustomerOpportunityFilters;
  selectedId: string | null;
};

function buildQuery(filters: CustomerOpportunityFilters, selected: string | null): string {
  const params = new URLSearchParams();
  if (filters.pillarCode) params.set("pillar", filters.pillarCode);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.status && filters.status !== "active") {
    params.set("status", filters.status);
  }
  if (selected) params.set("selected", selected);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function CustomerRecommendationsView({
  clientId,
  dto,
  filters,
  selectedId,
}: CustomerRecommendationsViewProps) {
  const router = useRouter();
  const basePath = clientRecommendationsPath(clientId);

  const expandedId = useMemo(() => {
    if (selectedId && dto.selectedFound) return selectedId;
    return null;
  }, [selectedId, dto.selectedFound]);

  useEffect(() => {
    if (!expandedId) return;
    const target = document.getElementById(`rec-${expandedId}`);
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [expandedId, dto.opportunities]);

  function pushState(nextFilters: CustomerOpportunityFilters, selected: string | null) {
    router.push(`${basePath}${buildQuery(nextFilters, selected)}`, { scroll: false });
  }

  function updateFilter(key: "pillar" | "priority" | "status", value: string) {
    const next: CustomerOpportunityFilters = { ...filters };
    if (key === "pillar") {
      next.pillarCode = value || undefined;
    } else if (key === "priority") {
      next.priority = value
        ? (value as NonNullable<CustomerOpportunityFilters["priority"]>)
        : undefined;
    } else {
      next.status = value
        ? (value as NonNullable<CustomerOpportunityFilters["status"]>)
        : "active";
    }
    // Changing filters clears selection so history stays intuitive.
    pushState(next, null);
  }

  function toggleOpportunity(id: string) {
    const nextSelected = expandedId === id ? null : id;
    pushState(filters, nextSelected);
  }

  const hasAnyVisible = dto.summary.identified > 0;
  const matchingLabel =
    dto.summary.matching === 1
      ? "Showing 1 opportunity for the current filters."
      : `Showing ${dto.summary.matching} opportunities for the current filters.`;

  return (
    <ClientPageShell className="max-w-4xl space-y-8">
      <ClientPageHeader
        eyebrow={CUSTOMER_TERM_IMPROVEMENT_OPPORTUNITIES}
        title="Improvement Opportunities"
        description="Prioritized recommendations from your assessment — explore by pillar, priority, and status, then open a row for approved finding and action detail."
      />

      {!hasAnyVisible ? (
        <ClientEmptyState
          icon={Lightbulb}
          title="No improvement opportunities yet"
          description="Recommendations appear after your technology assessment identifies the highest-impact improvements for your environment."
          nextStep="Complete or resume your assessment to receive personalized priorities."
        />
      ) : (
        <>
          <OpportunitySummary summary={dto.summary} matchingLabel={matchingLabel} />

          <OpportunityFilters filters={filters} onChange={updateFilter} />

          {selectedId && !dto.selectedFound ? (
            <p
              className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground"
              role="status"
            >
              That opportunity is not available in your portal. It may be inaccessible or no
              longer customer-visible.
            </p>
          ) : null}

          {dto.selectedOutsideFilter && dto.selectedFound ? (
            <p
              className="rounded-sm border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground"
              role="status"
            >
              The linked opportunity is outside the current filters. It is shown expanded below;
              adjust filters to browse the full matching set.
            </p>
          ) : null}

          {dto.opportunities.length === 0 ? (
            <ClientEmptyState
              icon={Lightbulb}
              title="No matching opportunities"
              description="Nothing matches the current pillar, priority, or status filters."
              nextStep="Clear or broaden filters to see other customer-visible recommendations."
            />
          ) : (
            <ul className="space-y-2">
              {dto.opportunities.map((opportunity) => (
                <li key={opportunity.id}>
                  <OpportunityRow
                    opportunity={opportunity}
                    expanded={expandedId === opportunity.id}
                    complexityFootnote={dto.complexityFootnote}
                    onToggle={() => toggleOpportunity(opportunity.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </ClientPageShell>
  );
}
