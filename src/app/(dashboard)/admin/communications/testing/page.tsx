import { redirect } from "next/navigation";
import { CommunicationsPageHeader } from "@/components/communications/communications-shell";
import { VcioOnboardingTestLauncher } from "@/components/vcio/vcio-onboarding-test-launcher";
import { auth } from "@/lib/auth";
import { assertCommunicationsAdminRole } from "@/lib/communications/auth";
import { prisma } from "@/lib/db";

export default async function CommunicationsTestingPage() {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAdminRole(session.user.role)) {
    redirect("/admin/communications");
  }

  const clients = await prisma.client.findMany({
    orderBy: { companyName: "asc" },
    take: 100,
    select: {
      id: true,
      companyName: true,
      primaryContactEmail: true,
    },
  });

  return (
    <div className="space-y-6">
      <CommunicationsPageHeader
        title="Communications Testing"
        description="Safely verify vCIO onboarding initialization and welcome email rendering without creating Stripe payments or subscriptions."
      />
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">vCIO Onboarding Test</h3>
          <p className="text-sm text-muted-foreground">
            Runs the shared vCIO onboarding initializer in admin test mode. Test sends use the
            actual StackScore vCIO Welcome template and are marked as TEST.
          </p>
        </div>
        <VcioOnboardingTestLauncher clients={clients} />
      </section>
    </div>
  );
}
