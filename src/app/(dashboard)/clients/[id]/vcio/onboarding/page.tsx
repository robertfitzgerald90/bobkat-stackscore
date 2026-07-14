import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { VcioOnboardingForm } from "@/components/vcio/vcio-onboarding-form";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { prisma } from "@/lib/db";
import { getClientVcioEntitlement } from "@/lib/vcio/entitlements";
import { buttonVariants } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function VcioOnboardingPage({ params }: PageProps) {
  const { id: clientId } = await params;
  const user = await getSessionUserWithClient();
  if (!user) redirect("/login");
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) redirect("/dashboard");

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, companyName: true },
  });
  if (!client) notFound();

  const entitlement = await getClientVcioEntitlement(clientId);
  if (!entitlement.hasSubscription) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="page-title">StackScore vCIO Onboarding</h1>
        <p className="page-description">
          This workspace does not have a StackScore vCIO subscription yet.
        </p>
        <Link href="/vcio-offer" className={buttonVariants({ variant: "default" })}>
          View vCIO Offer
        </Link>
      </div>
    );
  }

  const onboarding = await prisma.vcioOnboarding.findUnique({
    where: { clientId },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">StackScore vCIO</p>
          <h1 className="page-title">Onboarding Profile</h1>
          <p className="page-description">
            Help Bobkat IT understand {client.companyName}&apos;s business, technology environment,
            planning needs, and initial strategy session details.
          </p>
        </div>
        <Link href={`/clients/${clientId}/vcio`} className={buttonVariants({ variant: "outline" })}>
          Back to vCIO Dashboard
        </Link>
      </div>
      <VcioOnboardingForm
        clientId={clientId}
        initial={
          onboarding
            ? {
                businessInfoJson: onboarding.businessInfoJson,
                leadershipJson: onboarding.leadershipJson,
                environmentJson: onboarding.environmentJson,
                planningJson: onboarding.planningJson,
                assessmentStatus: onboarding.assessmentStatus,
                strategySessionScheduledAt:
                  onboarding.strategySessionScheduledAt?.toISOString() ?? null,
                completedAt: onboarding.completedAt?.toISOString() ?? null,
              }
            : null
        }
      />
    </div>
  );
}
