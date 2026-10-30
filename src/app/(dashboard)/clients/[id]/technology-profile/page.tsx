import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ClientAdminActions } from "@/components/admin/client-admin-actions";
import { CustomerExecutiveDashboard } from "@/components/customer-portal/customer-executive-dashboard";
import { TechnologyProfileDetailView } from "@/components/technology-profile/technology-profile-detail";
import { getCustomerOverview } from "@/lib/customer-portal/overview";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientWorkspaceOverviewPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  // SS-UX-002: page-level tenant ownership (defense-in-depth with middleware JWT check).
  if (isCustomerMode(session.user.role)) {
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
      status: true,
    },
  });
  if (!client) notFound();

  // SS-UX-002: Overview is the unified customer landing — do not redirect to vCIO.
  if (isCustomerMode(session.user.role)) {
    const overview = await getCustomerOverview(id, session.user.role, client.companyName);
    if (!overview) notFound();
    return <CustomerExecutiveDashboard overview={overview} />;
  }

  const detail = await getTechnologyProfileDetail(id, session.user.role);
  if (!detail) notFound();

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
