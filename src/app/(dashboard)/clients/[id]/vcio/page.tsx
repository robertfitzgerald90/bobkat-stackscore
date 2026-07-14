import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  FileText,
  FolderKanban,
  Lightbulb,
  WalletCards,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { prisma } from "@/lib/db";
import {
  formatVcioAccessState,
  getClientVcioEntitlement,
  type VcioAccessState,
} from "@/lib/vcio/entitlements";
import { formatDisplayDate } from "@/lib/display";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { ResendVcioWelcomeButton } from "@/components/vcio/resend-vcio-welcome-button";
import { ResetVcioOnboardingButton } from "@/components/vcio/reset-vcio-onboarding-button";
import { VcioFeatureUnlocksPanel } from "@/components/vcio/vcio-feature-unlocks-panel";
import { getVcioFeatureAccess } from "@/lib/vcio/feature-unlocks";

type PageProps = { params: Promise<{ id: string }> };

function MetricCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {sublabel ? <p className="mt-1 text-sm text-muted-foreground">{sublabel}</p> : null}
      </CardContent>
    </Card>
  );
}

function AccessAlert({ state }: { state: VcioAccessState }) {
  if (state === "FULL_ACCESS") return null;
  const message =
    state === "GRACE_PERIOD"
      ? "Your subscription is past due but still inside the payment grace period."
      : state === "REQUIRES_PAYMENT_ACTION"
        ? "Your payment requires attention before full vCIO access can continue."
        : state === "READ_ONLY"
          ? "Your vCIO subscription is read-only. Historical data is preserved."
          : "StackScore vCIO is not active for this workspace.";

  return (
    <Card className="border-primary/25 bg-primary/5">
      <CardContent className="flex items-start gap-3 p-5">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-primary" />
        <div>
          <p className="font-semibold">{formatVcioAccessState(state)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ClientVcioDashboardPage({ params }: PageProps) {
  const { id: clientId } = await params;
  const user = await getSessionUserWithClient();
  if (!user) redirect("/login");
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) redirect("/dashboard");

  const [client, entitlement, latestSubscription, vcioFeatureAccess, planningNotes] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        companyName: true,
        technologyProfile: {
          select: {
            overallStackScore: true,
            lastAssessedAt: true,
            nextRecommendedAssessmentAt: true,
            openRecommendationCount: true,
            criticalExposureCount: true,
          },
        },
        recommendations: {
          where: { status: { in: ["open", "accepted", "in_progress"] } },
          orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
          take: 5,
          select: { id: true, title: true, priority: true, status: true },
        },
        projects: {
          where: { status: { in: ["approved", "scheduled", "in_progress"] } },
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: { id: true, title: true, status: true, completedAt: true, updatedAt: true },
        },
        assessments: {
          where: { status: "completed" },
          orderBy: { completedAt: "desc" },
          take: 5,
          select: { id: true, assessmentName: true, completedAt: true },
        },
        clientTechnologies: {
          where: { isActive: true },
          orderBy: [{ renewalDate: "asc" }, { updatedAt: "desc" }],
          take: 9,
          select: {
            id: true,
            displayName: true,
            renewalDate: true,
            warrantyExpiresAt: true,
            plannedReplacementDate: true,
            budgetAmountCents: true,
            budgetPeriod: true,
            technology: { select: { name: true, vendor: true } },
          },
        },
        vcioOnboarding: {
          select: { status: true, completedAt: true, strategySessionScheduledAt: true },
        },
        quarterlyBusinessReviews: {
          orderBy: [{ reviewPeriodStart: "desc" }, { createdAt: "desc" }],
          take: 3,
          select: {
            id: true,
            title: true,
            status: true,
            reviewPeriodStart: true,
            reviewPeriodEnd: true,
            generatedAt: true,
            executiveSummary: true,
          },
        },
      },
    }),
    getClientVcioEntitlement(clientId),
    prisma.subscription.findFirst({
      where: { clientId, serviceType: "stackscore_vcio" },
      orderBy: { updatedAt: "desc" },
      include: {
        invoices: {
          orderBy: { invoiceDate: "desc" },
          take: 3,
        },
      },
    }),
    getVcioFeatureAccess(clientId, "strategy_sessions"),
    prisma.note.findMany({
      where: { clientId, noteType: { in: ["executive", "strategy_session"] } },
      orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        noteType: true,
        title: true,
        content: true,
        scheduledAt: true,
        completedAt: true,
        actionItemsJson: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
  ]);

  if (!client) notFound();

  const score = client.technologyProfile?.overallStackScore;
  const nextReview = client.quarterlyBusinessReviews[0]?.reviewPeriodEnd ?? null;
  const nextRecommendedAssessmentAt =
    client.technologyProfile?.nextRecommendedAssessmentAt?.toISOString() ?? null;
  const lastAssessedAt = client.technologyProfile?.lastAssessedAt ?? null;
  const annualAssessmentDue = nextRecommendedAssessmentAt
    ? new Date(nextRecommendedAssessmentAt).getTime() <= Date.now()
    : lastAssessedAt
      ? Date.now() - lastAssessedAt.getTime() >= 365 * 24 * 60 * 60 * 1000
      : false;
  const timeline = [
    ...client.assessments
      .filter((assessment) => assessment.completedAt)
      .map((assessment) => ({
        id: `assessment-${assessment.id}`,
        label: assessment.assessmentName,
        date: assessment.completedAt!.toISOString(),
        type: "assessment" as const,
      })),
    ...client.projects
      .filter((project) => project.completedAt)
      .map((project) => ({
        id: `project-${project.id}`,
        label: project.title,
        date: project.completedAt!.toISOString(),
        type: "project" as const,
      })),
    ...client.quarterlyBusinessReviews
      .filter((review) => review.generatedAt ?? review.reviewPeriodStart)
      .map((review) => ({
        id: `qbr-${review.id}`,
        label: review.title,
        date: (review.generatedAt ?? review.reviewPeriodStart).toISOString(),
        type: "qbr" as const,
      })),
    ...client.clientTechnologies
      .filter((technology) => technology.renewalDate || technology.plannedReplacementDate)
      .map((technology) => ({
        id: `technology-${technology.id}`,
        label: `${technology.displayName ?? technology.technology.name} planning milestone`,
        date: (technology.plannedReplacementDate ?? technology.renewalDate)!.toISOString(),
        type: "technology" as const,
      })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">StackScore vCIO</p>
          <h1 className="page-title">Strategic Technology Dashboard</h1>
          <p className="page-description">
            Advisory status, roadmap execution, reviews, and billing signals for {client.companyName}.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {user.role !== "client" ? (
            <>
              <ResendVcioWelcomeButton clientId={clientId} />
              <ResetVcioOnboardingButton clientId={clientId} />
            </>
          ) : null}
          <Link href={`/clients/${clientId}/vcio/onboarding`} className={buttonVariants({ variant: "outline" })}>
            Complete Onboarding
          </Link>
          <a href={SERVICES_CTA_DESTINATIONS.generalConsultation.href} className={buttonVariants({ variant: "default" })}>
            Schedule Strategy Session
          </a>
        </div>
      </div>

      <AccessAlert state={entitlement.accessState} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Technology Maturity Score"
          value={score !== null && score !== undefined ? Number(score).toFixed(0) : "-"}
          sublabel={
            client.technologyProfile?.lastAssessedAt
              ? `Assessed ${formatDisplayDate(client.technologyProfile.lastAssessedAt)}`
              : "No completed assessment yet"
          }
        />
        <MetricCard
          label="High-priority risks"
          value={client.technologyProfile?.criticalExposureCount ?? 0}
          sublabel="Critical exposures from current profile"
        />
        <MetricCard
          label="Recommendations in progress"
          value={client.technologyProfile?.openRecommendationCount ?? client.recommendations.length}
          sublabel="Open or accepted recommendations"
        />
        <MetricCard
          label="Subscription status"
          value={latestSubscription?.status ?? "none"}
          sublabel={
            latestSubscription?.currentPeriodEnd
              ? `Current period ends ${formatDisplayDate(latestSubscription.currentPeriodEnd)}`
              : undefined
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-primary" />
              Current-quarter priorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client.recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No open recommendations yet. Complete a baseline assessment to populate priorities.
              </p>
            ) : (
              <ul className="space-y-3">
                {client.recommendations.map((recommendation) => (
                  <li key={recommendation.id} className="flex items-start justify-between gap-3 text-sm">
                    <span className="font-medium">{recommendation.title}</span>
                    <span className="text-muted-foreground">{recommendation.priority}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="h-4 w-4 text-primary" />
              Projects in progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client.projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active projects are linked yet. Bobkat IT can scope projects from your roadmap.
              </p>
            ) : (
              <ul className="space-y-3">
                {client.projects.map((project) => (
                  <li key={project.id} className="flex items-start justify-between gap-3 text-sm">
                    <span className="font-medium">{project.title}</span>
                    <span className="text-muted-foreground">{project.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <VcioFeatureUnlocksPanel
        clientId={clientId}
        canEdit={vcioFeatureAccess.canEdit}
        readOnlyReason={vcioFeatureAccess.reason}
        initialNotes={planningNotes.map((note) => ({
          ...note,
          noteType: note.noteType === "strategy_session" ? "strategy_session" : "executive",
          scheduledAt: note.scheduledAt?.toISOString() ?? null,
          completedAt: note.completedAt?.toISOString() ?? null,
          createdAt: note.createdAt.toISOString(),
        }))}
        timeline={timeline}
        planningItems={client.clientTechnologies.map((technology) => ({
          id: technology.id,
          name: technology.displayName ?? technology.technology.name,
          vendor: technology.technology.vendor,
          renewalDate: technology.renewalDate?.toISOString() ?? null,
          warrantyExpiresAt: technology.warrantyExpiresAt?.toISOString() ?? null,
          plannedReplacementDate: technology.plannedReplacementDate?.toISOString() ?? null,
          budgetAmountCents: technology.budgetAmountCents,
          budgetPeriod: technology.budgetPeriod,
        }))}
        annualAssessmentDue={annualAssessmentDue}
        nextRecommendedAssessmentAt={nextRecommendedAssessmentAt}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Status: {client.vcioOnboarding?.status ?? "not_started"}</p>
            <p className="text-muted-foreground">
              {client.vcioOnboarding?.strategySessionScheduledAt
                ? `Strategy session ${formatDisplayDate(client.vcioOnboarding.strategySessionScheduledAt)}`
                : "No strategy session date stored yet."}
            </p>
            <Link href={`/clients/${clientId}/vcio/onboarding`} className={buttonVariants({ variant: "outline" })}>
              Open Onboarding
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-primary" />
              Quarterly Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Next review: {nextReview ? formatDisplayDate(nextReview) : "Not scheduled"}
            </p>
            <p className="text-muted-foreground">
              Completed reviews will appear in the quarterly reviews workspace.
            </p>
            <Link href={`/clients/${clientId}/quarterly-reviews`} className={buttonVariants({ variant: "outline" })}>
              View Reviews
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <WalletCards className="h-4 w-4 text-primary" />
              Subscription & Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>$300/month</p>
            <p className="text-muted-foreground">
              {latestSubscription?.cancelAtPeriodEnd
                ? "Cancellation is scheduled at the end of the current period."
                : "Billed monthly through Stripe."}
            </p>
            <Link href={`/clients/${clientId}/billing`} className={buttonVariants({ variant: "outline" })}>
              Manage Subscription
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Recent vCIO invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!latestSubscription || latestSubscription.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subscription invoices have synchronized yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {latestSubscription.invoices.map((invoice) => (
                <li key={invoice.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium">{invoice.number ?? "Stripe invoice"}</span>
                  <span className="text-muted-foreground">
                    {invoice.status} - ${(invoice.amountPaidCents / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
