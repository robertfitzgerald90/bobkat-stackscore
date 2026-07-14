import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getDashboardSummary } from "@/lib/dashboard";
import { prisma } from "@/lib/db";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import {
  canUseOngoingVcioFeatures,
  getClientVcioEntitlement,
} from "@/lib/vcio/entitlements";

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user && isCustomerMode(session.user.role)) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompletedAt: true, clientId: true },
    });
    if (!user?.onboardingCompletedAt) {
      redirect("/onboarding");
    }
    if (user.clientId) {
      const entitlement = await getClientVcioEntitlement(user.clientId);
      if (canUseOngoingVcioFeatures(entitlement.accessState)) {
        redirect(`/clients/${user.clientId}/vcio`);
      }
      redirect(clientTechnologyProfilePath(user.clientId));
    }
    redirect("/onboarding");
  }

  const summary = await getDashboardSummary();

  return <DashboardView summary={summary} />;
}
