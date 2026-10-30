/**
 * SS-UX-006 — Pure customer opportunities DTO builders (no Prisma).
 */

import type { Priority, RecommendationStatus } from "@/generated/prisma/client";
import {
  countCustomerRecommendations,
  CUSTOMER_ACTIVE_OPPORTUNITY_STATUSES,
  CUSTOMER_TERM_IMPROVEMENT_OPPORTUNITIES,
  isCustomerActiveOpportunityStatus,
  type CustomerRecommendationCounts,
} from "@/lib/assessments/customer-reporting";
import { RECOMMENDATION_STATUS_LABELS } from "@/lib/assessments/results-summary";
import { clientExplorePillarPath, clientRoadmapPhasePath } from "@/lib/clients/paths";
import { conciseFocusTitle } from "@/lib/client-workspace";
import {
  COMPLEXITY_FOOTNOTE,
  resolveCustomerOpportunityComplexity,
  type CustomerOpportunityComplexity,
} from "@/lib/customer-portal/complexity";
import {
  parseRecommendationDescription,
  type RecommendationContentSections,
} from "@/lib/customer-portal/recommendation-content";
import { PRIORITY_LABELS } from "@/lib/display";
import { sortRecommendationsByPriority } from "@/lib/recommendations/sort";
import {
  getPillarDisplayForCategoryCode,
  TECHNOLOGY_PILLARS,
  type TechnologyPillarCode,
} from "@/lib/technology-maturity/pillars";

/** Statuses customers may browse on the opportunities page (excludes archived). */
export const CUSTOMER_VISIBLE_OPPORTUNITY_STATUSES: RecommendationStatus[] = [
  "open",
  "accepted",
  "in_progress",
  "completed",
  "deferred",
  "declined",
];

export type CustomerOpportunityStatusFilter =
  | "active"
  | "all"
  | RecommendationStatus;

export type CustomerOpportunityRoadmapLink = {
  initiativeId: string;
  initiativeTitle: string;
  phaseId: string;
  phaseName: string;
  href: string;
};

export type CustomerOpportunityItem = {
  id: string;
  title: string;
  pillarCode: string;
  pillarName: string;
  pillarHref: string;
  priority: Priority;
  priorityLabel: string;
  status: RecommendationStatus;
  statusLabel: string;
  isActive: boolean;
  sections: RecommendationContentSections;
  /** Approved businessImpact copy — contextual impact, not a score guarantee. */
  businessImpact: string | null;
  suggestedService: string | null;
  complexity: CustomerOpportunityComplexity;
  roadmap: CustomerOpportunityRoadmapLink | null;
  estimatedImpactPoints: number;
};

export type CustomerOpportunitiesSummary = CustomerRecommendationCounts & {
  matching: number;
  term: typeof CUSTOMER_TERM_IMPROVEMENT_OPPORTUNITIES;
};

export type CustomerOpportunitiesDto = {
  clientId: string;
  summary: CustomerOpportunitiesSummary;
  opportunities: CustomerOpportunityItem[];
  complexityFootnote: string;
  selectedId: string | null;
  selectedFound: boolean;
  selectedOutsideFilter: boolean;
};

export type OpportunityRowInput = {
  id: string;
  title: string;
  description: string;
  businessImpact: string;
  suggestedService: string | null;
  priority: Priority;
  status: RecommendationStatus;
  estimatedImpactPoints: number;
  categoryCode: string;
  categoryName: string;
  roadmapInitiatives: Array<{
    id: string;
    title: string;
    phaseId: string;
    phaseName: string;
  }>;
};

export type CustomerOpportunityFilters = {
  pillarCode?: string;
  priority?: Priority;
  /** Default "active" when unset. */
  status?: CustomerOpportunityStatusFilter;
};

export function isCustomerVisibleOpportunityStatus(
  status: RecommendationStatus,
): boolean {
  return CUSTOMER_VISIBLE_OPPORTUNITY_STATUSES.includes(status);
}

export function normalizeCustomerOpportunityStatusFilter(
  value: string | undefined | null,
): CustomerOpportunityStatusFilter | undefined {
  if (!value) return undefined;
  if (value === "active" || value === "all") return value;
  if (CUSTOMER_VISIBLE_OPPORTUNITY_STATUSES.includes(value as RecommendationStatus)) {
    return value as RecommendationStatus;
  }
  return undefined;
}

export function matchesCustomerOpportunityStatusFilter(
  status: RecommendationStatus,
  filter: CustomerOpportunityStatusFilter | undefined,
): boolean {
  const effective: CustomerOpportunityStatusFilter = filter ?? "active";
  if (effective === "all") return isCustomerVisibleOpportunityStatus(status);
  if (effective === "active") return isCustomerActiveOpportunityStatus(status);
  return status === effective;
}

function firstRoadmapLink(
  clientId: string,
  initiatives: OpportunityRowInput["roadmapInitiatives"],
): CustomerOpportunityRoadmapLink | null {
  const first = initiatives[0];
  if (!first) return null;
  return {
    initiativeId: first.id,
    initiativeTitle: first.title,
    phaseId: first.phaseId,
    phaseName: first.phaseName,
    href: clientRoadmapPhasePath(clientId, first.phaseId),
  };
}

export function buildCustomerOpportunityItem(
  clientId: string,
  row: OpportunityRowInput,
): CustomerOpportunityItem {
  const pillar = getPillarDisplayForCategoryCode(row.categoryCode);
  const pillarName = pillar?.pillarName ?? row.categoryName;
  const pillarCode = row.categoryCode;
  const sections = parseRecommendationDescription(row.description);

  return {
    id: row.id,
    title: conciseFocusTitle(row.title),
    pillarCode,
    pillarName,
    pillarHref: clientExplorePillarPath(clientId, pillarCode),
    priority: row.priority,
    priorityLabel: PRIORITY_LABELS[row.priority],
    status: row.status,
    statusLabel: RECOMMENDATION_STATUS_LABELS[row.status],
    isActive: isCustomerActiveOpportunityStatus(row.status),
    sections,
    businessImpact: row.businessImpact?.trim() ? row.businessImpact.trim() : null,
    suggestedService: row.suggestedService,
    complexity: resolveCustomerOpportunityComplexity(row.suggestedService),
    roadmap: firstRoadmapLink(clientId, row.roadmapInitiatives),
    estimatedImpactPoints: row.estimatedImpactPoints,
  };
}

export function filterOpportunityRows(
  rows: OpportunityRowInput[],
  filters: CustomerOpportunityFilters,
): OpportunityRowInput[] {
  return rows.filter((row) => {
    if (filters.pillarCode && row.categoryCode !== filters.pillarCode) return false;
    if (filters.priority && row.priority !== filters.priority) return false;
    if (!matchesCustomerOpportunityStatusFilter(row.status, filters.status)) return false;
    return true;
  });
}

export function buildCustomerOpportunitiesDto(input: {
  clientId: string;
  rows: OpportunityRowInput[];
  filters: CustomerOpportunityFilters;
  selectedId?: string | null;
}): CustomerOpportunitiesDto {
  const { clientId, rows, filters, selectedId = null } = input;
  const visible = rows.filter((row) => isCustomerVisibleOpportunityStatus(row.status));
  const summaryBase = countCustomerRecommendations(visible);

  const scopedForList = visible.filter((row) => {
    if (filters.pillarCode && row.categoryCode !== filters.pillarCode) return false;
    if (filters.priority && row.priority !== filters.priority) return false;
    return true;
  });

  const matchingRows = filterOpportunityRows(visible, filters);
  const sorted = sortRecommendationsByPriority(matchingRows);
  const opportunities = sorted.map((row) => buildCustomerOpportunityItem(clientId, row));

  const selected =
    selectedId && visible.some((row) => row.id === selectedId) ? selectedId : null;
  const selectedFound = Boolean(selected);
  const selectedOutsideFilter = Boolean(
    selected && !matchingRows.some((row) => row.id === selected),
  );

  let list = opportunities;
  if (selectedOutsideFilter && selected) {
    const orphan = visible.find((row) => row.id === selected);
    if (orphan) {
      list = [buildCustomerOpportunityItem(clientId, orphan), ...opportunities];
    }
  }

  return {
    clientId,
    summary: {
      ...summaryBase,
      matching: matchingRows.length,
      term: CUSTOMER_TERM_IMPROVEMENT_OPPORTUNITIES,
    },
    opportunities: list,
    complexityFootnote: COMPLEXITY_FOOTNOTE,
    selectedId: selected,
    selectedFound,
    selectedOutsideFilter,
  };
}

export function customerOpportunityPillarOptions(): Array<{
  code: TechnologyPillarCode;
  name: string;
}> {
  return TECHNOLOGY_PILLARS.map((p) => ({ code: p.code, name: p.name }));
}

export { CUSTOMER_ACTIVE_OPPORTUNITY_STATUSES };
