import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ClientRecommendationsView } from "@/components/clients/client-recommendations-view";
import { CustomerRecommendationsView } from "@/components/customer-portal/customer-recommendations-view";
import type { ClientRecommendationFilters } from "@/lib/recommendations/client-list";
import { getClientRecommendations } from "@/lib/recommendations/client-list";
import {
  getCustomerOpportunities,
  type CustomerOpportunityFilters,
} from "@/lib/customer-portal/opportunities";
import {
  normalizeCustomerOpportunityStatusFilter,
} from "@/lib/customer-portal/opportunities-dto";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import type { Priority, RecommendationStatus } from "@/generated/prisma/client";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseStaffFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ClientRecommendationFilters {
  const pillar = searchParams.pillar;
  const priority = searchParams.priority;
  const status = searchParams.status;
  const project = searchParams.project;

  return {
    pillarCode: typeof pillar === "string" && pillar ? pillar : undefined,
    priority:
      typeof priority === "string" && priority ? (priority as Priority) : undefined,
    status:
      typeof status === "string" && status ? (status as RecommendationStatus) : undefined,
    hasProject: project === "yes" || project === "no" ? project : undefined,
  };
}

function parseCustomerFilters(
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

function parseSelected(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const selected = searchParams.selected;
  return typeof selected === "string" && selected ? selected : null;
}

export default async function ClientRecommendationsPage({ params, searchParams }: PageProps) {
  const { id: clientId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (isCustomerMode(session.user.role)) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId !== clientId) notFound();
  }

  const resolvedSearchParams = await searchParams;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, companyName: true },
  });

  if (!client) notFound();

  if (isCustomerMode(session.user.role)) {
    const filters = parseCustomerFilters(resolvedSearchParams);
    const selectedId = parseSelected(resolvedSearchParams);
    const dto = await getCustomerOpportunities(
      clientId,
      filters,
      session.user.role,
      selectedId,
    );

    return (
      <CustomerRecommendationsView
        clientId={clientId}
        dto={dto}
        filters={filters}
        selectedId={selectedId}
      />
    );
  }

  const filters = parseStaffFilters(resolvedSearchParams);
  const recommendations = await getClientRecommendations(
    clientId,
    filters,
    session.user.role,
  );

  return (
    <ClientRecommendationsView
      clientId={clientId}
      clientName={client.companyName}
      recommendations={recommendations}
      filters={filters}
    />
  );
}
