import { ProjectWorkspaceControls } from "@/components/projects/project-workspace-controls";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CustomerProjectDetail } from "@/components/customer-portal/projects/customer-project-detail";
import { getCustomerProjectDetail } from "@/lib/customer-portal/projects-experience";
import { prisma } from "@/lib/db";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

type PageProps = {
  params: Promise<{ id: string; projectId: string }>;
};

export default async function CustomerProjectDetailPage({ params }: PageProps) {
  const { id: clientId, projectId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (isCustomerMode(session.user.role)) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId !== clientId) notFound();
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, companyName: true },
  });
  if (!client) notFound();

  const detail = await getCustomerProjectDetail(
    client.id,
    projectId,
    client.companyName,
    session.user.role,
  );
  if (!detail) notFound();

  const management =
    session.user.role !== "client"
      ? await prisma.project.findFirst({
          where: { id: projectId, clientId },
          select: { status: true, description: true },
        })
      : null;
  return (
    <CustomerProjectDetail
      detail={detail}
      management={
        management ? (
          <ProjectWorkspaceControls
            key={projectId}
            projectId={projectId}
            clientId={clientId}
            title={detail.title}
            initialStatus={management.status}
            initialNotes={management.description}
            isAdmin={session.user.role === "admin"}
          />
        ) : undefined
      }
    />
  );
}
