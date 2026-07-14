import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { VcioOnboardingForm } from "@/components/vcio/vcio-onboarding-form";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { prisma } from "@/lib/db";
import { getClientVcioEntitlement } from "@/lib/vcio/entitlements";
import { buttonVariants } from "@/components/ui/button";
import { detectVcioCustomerType } from "@/lib/vcio/onboarding";
import type { VcioCustomerType } from "@/generated/prisma/client";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ preview?: string; scenario?: string }>;
};

function previewScenario(value: string | undefined): VcioCustomerType | null {
  if (value === "assessment_customer" || value === "managed_services_client" || value === "brand_new") {
    return value;
  }
  return null;
}

export default async function VcioOnboardingPage({ params, searchParams }: PageProps) {
  const { id: clientId } = await params;
  const query = searchParams ? await searchParams : {};
  const user = await getSessionUserWithClient();
  if (!user) redirect("/login");
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) redirect("/dashboard");
  const previewMode = query.preview === "1" && user.role === "admin";

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      companyName: true,
      primaryContactName: true,
      primaryContactEmail: true,
      employeeCount: true,
      numberOfLocations: true,
      deviceCount: true,
      industry: true,
      technologyProfile: {
        select: {
          overallStackScore: true,
          openRecommendationCount: true,
          criticalExposureCount: true,
        },
      },
      recommendations: {
        where: { status: { in: ["open", "accepted", "in_progress"] } },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { title: true },
      },
      projects: {
        where: { status: { in: ["approved", "scheduled", "in_progress"] } },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { title: true },
      },
      improvementPlans: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { title: true, status: true },
      },
    },
  });
  if (!client) notFound();

  const entitlement = await getClientVcioEntitlement(clientId);
  if (!entitlement.hasSubscription && !previewMode) {
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
  const detectedCustomerType =
    (previewMode ? previewScenario(query.scenario) : null) ??
    onboarding?.customerType ??
    (await detectVcioCustomerType(clientId));

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
      {previewMode ? (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm font-medium text-warning">
          PREVIEW MODE: this adaptive onboarding workflow is using the real UI with writes, emails,
          scheduling, entitlement changes, and billing redirects disabled.
        </div>
      ) : null}
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
                customerType: detectedCustomerType,
                currentStep: previewMode ? "welcome" : onboarding.currentStep,
                completionPercentage: previewMode ? 0 : onboarding.completionPercentage,
                strategySessionScheduledAt:
                  onboarding.strategySessionScheduledAt?.toISOString() ?? null,
                completedAt: onboarding.completedAt?.toISOString() ?? null,
              }
            : {
                businessInfoJson: null,
                leadershipJson: null,
                environmentJson: null,
                planningJson: null,
                assessmentStatus: null,
                customerType: detectedCustomerType,
                currentStep: "welcome",
                completionPercentage: 0,
                strategySessionScheduledAt: null,
                completedAt: null,
              }
        }
        knownData={{
          companyName: client.companyName,
          primaryContactName: client.primaryContactName,
          primaryContactEmail: client.primaryContactEmail,
          employeeCount: client.employeeCount,
          numberOfLocations: client.numberOfLocations,
          deviceCount: client.deviceCount,
          industry: client.industry,
          technologyScore: client.technologyProfile?.overallStackScore?.toString() ?? null,
          openRecommendationCount: client.technologyProfile?.openRecommendationCount ?? 0,
          criticalExposureCount: client.technologyProfile?.criticalExposureCount ?? 0,
          recommendations: client.recommendations.map((item) => item.title),
          projects: client.projects.map((item) => item.title),
          improvementPlan: client.improvementPlans[0]
            ? `${client.improvementPlans[0].title} (${client.improvementPlans[0].status})`
            : null,
        }}
        previewMode={previewMode}
      />
    </div>
  );
}
