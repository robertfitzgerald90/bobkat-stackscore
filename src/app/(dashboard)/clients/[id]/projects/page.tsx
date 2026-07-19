import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ClientPageHeader, ClientPageShell } from "@/components/client-ui";
import { WorkspaceProjectsList } from "@/components/client-workspace/workspace-projects-list";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { prisma } from "@/lib/db";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import type { ProfileProjectSummary } from "@/lib/technology-profile/types";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientWorkspaceProjectsPage({ params }: PageProps) {
  const { id } = await params;
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
      projects: {
        where: { status: { not: "cancelled" } },
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
          recommendation: { select: { title: true } },
        },
      },
    },
  });
  if (!client) notFound();

  const projects: ProfileProjectSummary[] = client.projects.map((project) => ({
    id: project.id,
    title: project.title,
    status: project.status,
    priority: project.priority,
    estimatedImpactPoints: project.estimatedImpactPoints,
    actualImpactPoints: project.actualImpactPoints,
    estimatedCost: project.estimatedCost !== null ? Number(project.estimatedCost) : null,
    completedAt: project.completedAt?.toISOString() ?? null,
    recommendationTitle: project.recommendation?.title ?? null,
  }));

  if (isCustomerMode(session.user.role)) {
    return (
      <ClientPageShell>
        <ClientPageHeader
          eyebrow="Delivery"
          title="Projects"
          description="Track improvement work, progress, and expected StackScore impact for your organization."
        />
        <WorkspaceProjectsList clientId={client.id} projects={projects} />
      </ClientPageShell>
    );
  }

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
