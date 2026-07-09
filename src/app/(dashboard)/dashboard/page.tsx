import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { auth } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user?.role === "client") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompletedAt: true },
    });
    if (!user?.onboardingCompletedAt) {
      redirect("/onboarding");
    }
    redirect("/assessment/start");
  }

  const summary = await getDashboardSummary();

  return <DashboardView summary={summary} />;
}
