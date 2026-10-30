import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getCommandCenterSummary } from "@/lib/dashboard/command-center";
import { prisma } from "@/lib/db";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import { customerOverviewPath } from "@/lib/clients/paths";

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
    // SS-UX-002: all onboarded customers land on Overview (not vCIO).
    if (user.clientId) {
      redirect(customerOverviewPath(user.clientId));
    }
    redirect("/onboarding");
  }

  const role = session?.user?.role ?? "technician";
  const summary = await getCommandCenterSummary(role);

  return <DashboardView summary={summary} />;
}
