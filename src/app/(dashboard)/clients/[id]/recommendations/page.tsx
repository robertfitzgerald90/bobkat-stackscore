import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ClientRecommendationsView } from "@/components/clients/client-recommendations-view";
import type { ClientRecommendationFilters } from "@/lib/recommendations/client-list";
import { getClientRecommendations } from "@/lib/recommendations/client-list";
import type { Priority, RecommendationStatus } from "@/generated/prisma/client";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ClientRecommendationFilters {
  const pillar = searchParams.pillar;
  const priority = searchParams.priority;
  const status = searchParams.status;
  const project = searchParams.project;

  return {
    pillarCode: typeof pillar === "string" && pillar ? pillar : undefined,
    priority:
      typeof priority === "string" && priority
        ? (priority as Priority)
        : undefined,
    status:
      typeof status === "string" && status
        ? (status as RecommendationStatus)
        : undefined,
    hasProject:
      project === "yes" || project === "no" ? project : undefined,
  };
}

export default async function ClientRecommendationsPage({ params, searchParams }: PageProps) {
  const { id: clientId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "client") redirect(`/clients/${clientId}/technology-profile`);

  const resolvedSearchParams = await searchParams;
  const filters = parseFilters(resolvedSearchParams);

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, companyName: true },
  });

  if (!client) notFound();

  const recommendations = await getClientRecommendations(clientId, filters);

  return (
    <ClientRecommendationsView
      clientId={clientId}
      clientName={client.companyName}
      recommendations={recommendations}
      filters={filters}
    />
  );
}
