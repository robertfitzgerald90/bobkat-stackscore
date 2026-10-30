"use client";

import { PRIORITY_LABELS } from "@/lib/display";
import {
  CUSTOMER_VISIBLE_OPPORTUNITY_STATUSES,
  customerOpportunityPillarOptions,
  type CustomerOpportunityFilters,
  type CustomerOpportunityStatusFilter,
} from "@/lib/customer-portal/opportunities-dto";
import { RECOMMENDATION_STATUS_LABELS } from "@/lib/assessments/results-summary";
import type { Priority } from "@/generated/prisma/client";

const PRIORITY_OPTIONS: Priority[] = ["critical", "high", "medium", "low"];

type OpportunityFiltersProps = {
  filters: CustomerOpportunityFilters;
  onChange: (key: "pillar" | "priority" | "status", value: string) => void;
};

function selectClassName() {
  return "h-9 w-full rounded-sm border border-input bg-background px-3 text-sm sm:w-auto sm:min-w-[10rem]";
}

export function OpportunityFilters({ filters, onChange }: OpportunityFiltersProps) {
  const statusValue: CustomerOpportunityStatusFilter = filters.status ?? "active";

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
      role="group"
      aria-label="Filter improvement opportunities"
    >
      <select
        className={selectClassName()}
        value={filters.pillarCode ?? ""}
        onChange={(event) => onChange("pillar", event.target.value)}
        aria-label="Filter by technology pillar"
      >
        <option value="">All pillars</option>
        {customerOpportunityPillarOptions().map((pillar) => (
          <option key={pillar.code} value={pillar.code}>
            {pillar.name}
          </option>
        ))}
      </select>

      <select
        className={selectClassName()}
        value={filters.priority ?? ""}
        onChange={(event) => onChange("priority", event.target.value)}
        aria-label="Filter by priority"
      >
        <option value="">All priorities</option>
        {PRIORITY_OPTIONS.map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_LABELS[priority]}
          </option>
        ))}
      </select>

      <select
        className={selectClassName()}
        value={statusValue}
        onChange={(event) => onChange("status", event.target.value)}
        aria-label="Filter by status"
      >
        <option value="active">Active opportunities</option>
        <option value="all">All visible statuses</option>
        {CUSTOMER_VISIBLE_OPPORTUNITY_STATUSES.map((status) => (
          <option key={status} value={status}>
            {RECOMMENDATION_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  );
}
