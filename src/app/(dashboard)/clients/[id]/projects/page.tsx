import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CustomerProjectsExperience } from "@/components/customer-portal/projects/customer-projects-experience";
import { WorkspaceProjectsList } from "@/components/client-workspace/workspace-projects-list";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { prisma } from "@/lib/db";
import { getCustomerProjectsExperience } from "@/lib/customer-portal/projects-experience";
import { normalizeCustomerProjectViewFilter } from "@/lib/customer-portal/projects-dto";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import { isClientDeliverableRecommendation } from "@/lib/recommendations/visibility";
import type { ProfileProjectSummary } from "@/lib/technology-profile/types";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClientWorkspaceProjectsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "client") {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId !== id) notFound();
  }

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
    },
  });
  if (!client) notFound();

  if (isCustomerMode(session.user.role)) {
    const viewRaw = typeof query.view === "string" ? query.view : undefined;
    const experience = await getCustomerProjectsExperience(
      client.id,
      client.companyName,
      normalizeCustomerProjectViewFilter(viewRaw),
    );

    return (
      <Suspense>
        <CustomerProjectsExperience experience={experience} />
      </Suspense>
    );
  }

  const projectsRaw = await prisma.project.findMany({
    where: { clientId: id, status: { not: "cancelled" } },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      estimatedImpactPoints: true,
      actualImpactPoints: true,
      estimatedCost: true,
      completedAt: true,
      recommendation: {
        select: {
          title: true,
          recommendationTemplate: { select: { code: true } },
        },
      },
    },
  });

  const projects: ProfileProjectSummary[] = projectsRaw.map((project) => {
    const recommendation = project.recommendation;
    const recommendationTitle =
      recommendation &&
      isClientDeliverableRecommendation(
        recommendation as Record<string, unknown>,
        session.user.role,
      )
        ? recommendation.title
        : null;

    return {
      id: project.id,
      title: project.title,
      status: project.status,
      priority: project.priority,
      estimatedImpactPoints: project.estimatedImpactPoints,
      actualImpactPoints: project.actualImpactPoints,
      estimatedCost: project.estimatedCost !== null ? Number(project.estimatedCost) : null,
      completedAt: project.completedAt?.toISOString() ?? null,
      recommendationTitle,
    };
  });

  return (
    <div className="space-y-6">
      <WorkspaceSectionHeader
        title="Projects"
        description={`${client.companyName} — improvement work for this client`}
      />
      <WorkspaceProjectsList clientId={client.id} projects={projects} />
    </div>
  );
}
