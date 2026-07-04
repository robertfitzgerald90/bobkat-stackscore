import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ClientAdminActions } from "@/components/admin/client-admin-actions";
import { TechnologyProfileDetailView } from "@/components/technology-profile/technology-profile-detail";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";

type PageProps = { params: Promise<{ id: string }> };

/** Client Workspace Overview (DOC-201 / DOC-161). */
export default async function ClientWorkspaceOverviewPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [detail, client] = await Promise.all([
    getTechnologyProfileDetail(id, session.user.role),
    prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        status: true,
      },
    }),
  ]);

  if (!detail || !client) notFound();

  const { sections } = detail;

  return (
    <div className="space-y-6">
      <TechnologyProfileDetailView detail={detail} />

      {sections.showAdminActions ? (
        <ClientAdminActions
          clientId={client.id}
          clientName={client.companyName}
          status={client.status}
        />
      ) : null}
    </div>
  );
}
