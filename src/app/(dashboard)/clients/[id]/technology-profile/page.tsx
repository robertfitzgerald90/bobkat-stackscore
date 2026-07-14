import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ClientAdminActions } from "@/components/admin/client-admin-actions";
import { CustomerExecutiveDashboard } from "@/components/customer-portal/customer-executive-dashboard";
import { TechnologyProfileDetailView } from "@/components/technology-profile/technology-profile-detail";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import {
  canUseOngoingVcioFeatures,
  getClientVcioEntitlement,
} from "@/lib/vcio/entitlements";

type PageProps = { params: Promise<{ id: string }> };

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

  if (isCustomerMode(session.user.role)) {
    const entitlement = await getClientVcioEntitlement(id);
    if (canUseOngoingVcioFeatures(entitlement.accessState)) {
      redirect(`/clients/${id}/vcio`);
    }
    return <CustomerExecutiveDashboard detail={detail} companyName={client.companyName} />;
  }

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
