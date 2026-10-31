import type { Metadata } from "next";
import { CustomerRecommendationsView } from "@/components/customer-portal/customer-recommendations-view";
import {
  normalizeCustomerOpportunityStatusFilter,
  type CustomerOpportunityFilters,
} from "@/lib/customer-portal/opportunities-dto";
import { PUBLIC_DEMO_COMPANY_NAME, PUBLIC_DEMO_WORKSPACE_ID } from "@/lib/public-demo/constants";
import { getPublicDemoOpportunitiesDto } from "@/lib/public-demo/provider";
import { PUBLIC_DEMO_OPPORTUNITIES_PATH } from "@/lib/public-demo/routes";
import type { Priority } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: `Opportunities | ${PUBLIC_DEMO_COMPANY_NAME} Demo`,
  description: "Sample improvement opportunities for the StackScore public demo.",
  alternates: { canonical: "/demo/opportunities" },
  robots: { index: true, follow: true },
};

type OpportunitiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): CustomerOpportunityFilters {
  const pillar = searchParams.pillar;
  const priority = searchParams.priority;
  const statusRaw = typeof searchParams.status === "string" ? searchParams.status : undefined;
  return {
    pillarCode: typeof pillar === "string" && pillar ? pillar : undefined,
    priority:
      typeof priority === "string" && priority ? (priority as Priority) : undefined,
    status: normalizeCustomerOpportunityStatusFilter(statusRaw) ?? "active",
  };
}

/**
 * SS-WEB-003-R1 — Shared customer Improvement Opportunities composition.
 */
export default async function PublicDemoOpportunitiesPage({
  searchParams,
}: OpportunitiesPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const selected =
    typeof params.selected === "string" && params.selected ? params.selected : null;
  const dto = getPublicDemoOpportunitiesDto({ filters, selectedId: selected });

  return (
    <CustomerRecommendationsView
      clientId={PUBLIC_DEMO_WORKSPACE_ID}
      dto={dto}
      filters={filters}
      selectedId={selected}
      basePath={PUBLIC_DEMO_OPPORTUNITIES_PATH}
    />
  );
}
