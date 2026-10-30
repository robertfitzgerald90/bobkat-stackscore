/**
 * SS-UX-006 — Authorized assembly for customer improvement opportunities.
 * Reuses visibility filters; does not generate or mutate recommendations.
 */

import type { Priority, RecommendationStatus, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  buildCustomerOpportunitiesDto,
  CUSTOMER_VISIBLE_OPPORTUNITY_STATUSES,
  type CustomerOpportunityFilters,
  type CustomerOpportunitiesDto,
  type OpportunityRowInput,
} from "@/lib/customer-portal/opportunities-dto";
import { presentRecommendationsForRole } from "@/lib/recommendations/visibility";

export type { CustomerOpportunityFilters, CustomerOpportunitiesDto };

type RawOpportunityRow = {
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
  templateCode: string | null;
  roadmapInitiatives: OpportunityRowInput["roadmapInitiatives"];
};

function toOpportunityRow(row: RawOpportunityRow): OpportunityRowInput {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    businessImpact: row.businessImpact,
    suggestedService: row.suggestedService,
    priority: row.priority,
    status: row.status,
    estimatedImpactPoints: row.estimatedImpactPoints,
    categoryCode: row.categoryCode,
    categoryName: row.categoryName,
    roadmapInitiatives: row.roadmapInitiatives,
  };
}

/**
 * Load customer-visible recommendations for the opportunities experience.
 * Tenant scope is caller-enforced (page ownership check). Role drives deliverable filtering.
 */
export async function getCustomerOpportunities(
  clientId: string,
  filters: CustomerOpportunityFilters = {},
  role: UserRole,
  selectedId?: string | null,
): Promise<CustomerOpportunitiesDto> {
  const recommendations = await prisma.assessmentRecommendation.findMany({
    where: {
      clientId,
      status: { in: [...CUSTOMER_VISIBLE_OPPORTUNITY_STATUSES] },
    },
    orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      businessImpact: true,
      suggestedService: true,
      priority: true,
      status: true,
      estimatedImpactPoints: true,
      category: { select: { name: true, code: true } },
      recommendationTemplate: { select: { code: true } },
      roadmapInitiatives: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          phaseId: true,
          phase: { select: { id: true, name: true } },
        },
      },
    },
  });

  const serialized: RawOpportunityRow[] = recommendations.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    businessImpact: row.businessImpact,
    suggestedService: row.suggestedService,
    priority: row.priority,
    status: row.status,
    estimatedImpactPoints: row.estimatedImpactPoints,
    categoryCode: row.category.code,
    categoryName: row.category.name,
    templateCode: row.recommendationTemplate?.code ?? null,
    roadmapInitiatives: row.roadmapInitiatives.map((initiative) => ({
      id: initiative.id,
      title: initiative.title,
      phaseId: initiative.phaseId,
      phaseName: initiative.phase.name,
    })),
  }));

  const deliverable = presentRecommendationsForRole(serialized, role);
  const rows = deliverable.map(toOpportunityRow);

  return buildCustomerOpportunitiesDto({
    clientId,
    rows,
    filters,
    selectedId: selectedId ?? null,
  });
}
