import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  FolderKanban,
  WalletCards,
} from "lucide-react";
import {
  ClientMetricCard,
  ClientNextActionCard,
  ClientPageHeader,
  ClientPageShell,
  ClientSectionHeader,
} from "@/components/client-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { prisma } from "@/lib/db";
import {
  canUseOngoingVcioFeatures,
  formatVcioAccessState,
  getClientVcioEntitlement,
  type VcioAccessState,
} from "@/lib/vcio/entitlements";
import { formatDisplayDate } from "@/lib/display";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { ResendVcioWelcomeButton } from "@/components/vcio/resend-vcio-welcome-button";
import { ResetVcioOnboardingButton } from "@/components/vcio/reset-vcio-onboarding-button";
import { VcioFeatureUnlocksPanel } from "@/components/vcio/vcio-feature-unlocks-panel";
import { CurrentQuarterPriorities } from "@/components/priorities/current-quarter-priorities";
import { QuarterlyReviewSummary } from "@/components/quarterly-reviews/quarterly-review-summary";
import { currentQuarterLabel } from "@/lib/quarterly-reviews/labels";
import { getVcioFeatureAccess } from "@/lib/vcio/feature-unlocks";
import { getBookingUrl } from "@/lib/support/config";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

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
    <Card className={cn(CLIENT_SURFACE_CARD, "border-primary/25 bg-primary/5")}>
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

function formatCurrencyFromCents(cents: number | null) {
  if (cents === null) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function ClientVcioDashboardPage({ params }: PageProps) {
  const { id: clientId } = await params;
  const user = await getSessionUserWithClient();
  if (!user) redirect("/login");
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) redirect("/dashboard");

  const [
    client,
    entitlement,
    latestSubscription,
    vcioFeatureAccess,
    planningNotes,
    completedRecommendations,
    recentProjects,
  ] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        companyName: true,
        primaryContactName: true,
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
          take: 10,
          select: { id: true, title: true, priority: true, status: true, updatedAt: true },
        },
        projects: {
          where: { status: { in: ["approved", "scheduled", "in_progress"] } },
          orderBy: { updatedAt: "desc" },
          take: 10,
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
        documents: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            documentType: true,
            fileUrl: true,
            createdAt: true,
          },
        },
        improvementPlans: {
          orderBy: { updatedAt: "desc" },
          take: 3,
          select: {
            id: true,
            title: true,
            status: true,
            generatedAt: true,
            updatedAt: true,
            wizardState: true,
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
    prisma.assessmentRecommendation.findMany({
      where: { clientId, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: { id: true, title: true, completedAt: true, updatedAt: true },
    }),
    prisma.project.findMany({
      where: { clientId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, completedAt: true, updatedAt: true },
    }),
  ]);

  if (!client) notFound();

  const score = client.technologyProfile?.overallStackScore;
  const latestReview = client.quarterlyBusinessReviews[0] ?? null;
  const previousGeneratedReview =
    client.quarterlyBusinessReviews.find((review) => review.status === "generated") ?? null;
  const nextReview = latestReview?.reviewPeriodEnd ?? null;
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
  const strategySessions = planningNotes.filter((note) => note.noteType === "strategy_session");
  const hasScheduledStrategySession = Boolean(
    client.vcioOnboarding?.strategySessionScheduledAt ||
      strategySessions.some((note) => note.scheduledAt && !note.completedAt),
  );
  const hasCompletedStrategySession = strategySessions.some((note) => note.completedAt);
  const latestRoadmap = client.improvementPlans[0] ?? null;
  const generatedRoadmap = client.improvementPlans.find((plan) =>
    ["generated", "published", "approved"].includes(plan.status),
  );
  const latestExecutiveReport =
    client.documents.find((document) =>
      ["report", "quarterly_business_review", "technology_improvement_plan"].includes(
        document.documentType,
      ),
    ) ?? null;
  const upcomingRenewals = client.clientTechnologies.filter((technology) => {
    if (!technology.renewalDate) return false;
    return technology.renewalDate.getTime() >= Date.now();
  });
  const budgetTotalCents = client.clientTechnologies.reduce(
    (total, technology) => total + (technology.budgetAmountCents ?? 0),
    0,
  );
  const hasVendorInfo = client.clientTechnologies.some((technology) => technology.renewalDate);
  const hasBudget = budgetTotalCents > 0;
  const activeProjects = client.projects.filter((project) =>
    ["approved", "scheduled", "in_progress"].includes(project.status),
  );
  const roadmapProgress =
    client.recommendations.length + completedRecommendations.length > 0
      ? Math.round(
          (completedRecommendations.length /
            (client.recommendations.length + completedRecommendations.length)) *
            100,
        )
      : null;
  const subscriptionActive = canUseOngoingVcioFeatures(entitlement.accessState);
  const overallStatus = subscriptionActive
    ? score !== null && score !== undefined
      ? Number(score) >= 80
        ? "Strong"
        : Number(score) >= 60
          ? "Stable with priorities"
          : "Needs attention"
      : "Baseline needed"
    : formatVcioAccessState(entitlement.accessState);
  const qbrStatus = latestReview
    ? latestReview.status === "generated"
      ? "Current review available"
      : "Draft in progress"
    : "Not scheduled";
  const bookingUrl = getBookingUrl();
  const recommendedAction = annualAssessmentDue
    ? {
        label: "Complete Annual Assessment",
        description: "Your technology assessment is due for its annual refresh.",
        href: "/assessment/start",
      }
    : !hasScheduledStrategySession && !hasCompletedStrategySession
      ? {
          label: "Schedule Strategy Session",
          description: "Start your vCIO engagement with a strategy session with Bobkat IT.",
          href: SERVICES_CTA_DESTINATIONS.generalConsultation.href,
        }
      : !generatedRoadmap
        ? {
            label: "Review Technology Roadmap",
            description: "Review your roadmap so priorities and timing stay aligned.",
            href: `/clients/${clientId}/roadmap`,
          }
        : !hasBudget
          ? {
              label: "Complete Budget Planning",
              description: "Add budget details to technology lifecycle and vendor records.",
              href: `/clients/${clientId}/assets`,
            }
          : previousGeneratedReview
            ? {
                label: "Review Quarterly Report",
                description: "Your latest Quarterly Business Review is ready.",
                href: `/clients/${clientId}/quarterly-review/${previousGeneratedReview.id}`,
              }
            : {
                label: "Schedule Quarterly Review",
                description: "Prepare the next executive review of progress and priorities.",
                href: `/clients/${clientId}/quarterly-reviews`,
              };
  const checklist = [
    { label: "Subscription Active", complete: subscriptionActive },
    { label: "Schedule Strategy Session", complete: hasScheduledStrategySession || hasCompletedStrategySession },
    { label: "Review Improvement Plan", complete: Boolean(latestRoadmap) },
    { label: "Review Technology Roadmap", complete: Boolean(generatedRoadmap) },
    {
      label: "Upload Network Diagram",
      complete: client.documents.some((document) => document.documentType === "diagram"),
    },
    { label: "Add Vendor Information", complete: hasVendorInfo },
    { label: "Establish Technology Budget", complete: hasBudget },
    { label: "Schedule Quarterly Review", complete: Boolean(latestReview) },
  ];

  return (
    <ClientPageShell className="space-y-8">
      <ClientPageHeader
        eyebrow="Client Success Dashboard"
        title={`Welcome back, ${client.companyName}`}
        description="Bobkat IT is actively managing your technology strategy, roadmap, reviews, and planning priorities."
        actions={
          <>
            {user.role !== "client" ? (
              <>
                <ResendVcioWelcomeButton clientId={clientId} />
                <ResetVcioOnboardingButton clientId={clientId} />
              </>
            ) : null}
            {client.vcioOnboarding?.status !== "completed" ? (
              <Link
                href={`/clients/${clientId}/vcio/onboarding`}
                className={buttonVariants({ variant: "outline" })}
              >
                Complete Onboarding
              </Link>
            ) : null}
            <a
              href={SERVICES_CTA_DESTINATIONS.generalConsultation.href}
              className={buttonVariants({ variant: "default" })}
            >
              Schedule Strategy Session
            </a>
          </>
        }
      />

      <AccessAlert state={entitlement.accessState} />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <ClientMetricCard
          label="Technology Maturity Score"
          value={score !== null && score !== undefined ? Number(score).toFixed(0) : "—"}
          sublabel={
            client.technologyProfile?.lastAssessedAt
              ? `Assessed ${formatDisplayDate(client.technologyProfile.lastAssessedAt)}`
              : "Complete an assessment to establish a baseline"
          }
        />
        <ClientMetricCard label="Overall Status" value={overallStatus} />
        <ClientMetricCard label="Quarterly Review Status" value={qbrStatus} />
        <ClientMetricCard
          label="Latest Executive Report"
          value={latestExecutiveReport ? "Available" : "Pending"}
          sublabel={
            latestExecutiveReport?.title ?? "Complete assessment or QBR to generate reports"
          }
        />
      </div>

      <ClientNextActionCard
        title={recommendedAction.label}
        description={recommendedAction.description}
        actions={
          recommendedAction.href.startsWith("http") ? (
            <a href={recommendedAction.href} className={buttonVariants({ variant: "default" })}>
              {recommendedAction.label}
            </a>
          ) : (
            <Link href={recommendedAction.href} className={buttonVariants({ variant: "default" })}>
              {recommendedAction.label}
            </Link>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ClientMetricCard
          label="Open Recommendations"
          value={client.recommendations.length}
          sublabel="Open, accepted, or in progress"
        />
        <ClientMetricCard
          label="Active Projects"
          value={activeProjects.length}
          sublabel="Approved, scheduled, or in progress"
        />
        <ClientMetricCard
          label="Roadmap Progress"
          value={roadmapProgress !== null ? `${roadmapProgress}%` : "—"}
          sublabel={latestRoadmap ? latestRoadmap.title : "Create a roadmap to track progress"}
        />
        <ClientMetricCard
          label="High Priority Risks"
          value={client.technologyProfile?.criticalExposureCount ?? 0}
          sublabel="Critical exposures from current profile"
        />
        <ClientMetricCard
          label="Upcoming Renewals"
          value={upcomingRenewals.length}
          sublabel="From vendor and lifecycle planning"
        />
        <ClientMetricCard
          label="Technology Budget"
          value={formatCurrencyFromCents(budgetTotalCents) ?? "—"}
          sublabel={hasBudget ? "Tracked on technology records" : "Budget planning not established"}
        />
        <ClientMetricCard
          label="Quarterly Review"
          value={currentQuarterLabel()}
          sublabel={
            nextReview
              ? `Current period ends ${formatDisplayDate(nextReview)}`
              : "No review period yet"
          }
        />
        <ClientMetricCard
          label="Subscription"
          value={latestSubscription?.status ?? "none"}
          sublabel={
            latestSubscription?.currentPeriodEnd
              ? `Current period ends ${formatDisplayDate(latestSubscription.currentPeriodEnd)}`
              : undefined
          }
        />
      </div>

      <ClientSectionHeader
        eyebrow="Progress"
        title="Checklist and recent activity"
        description="Track onboarding momentum and the latest strategy deliverables in one place."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card className={CLIENT_SURFACE_CARD}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Client Success Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      item.complete
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted"
                    }`}
                  >
                    {item.complete ? <CheckCircle2 className="h-3 w-3" /> : null}
                  </span>
                  <span className={item.complete ? "font-medium" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={CLIENT_SURFACE_CARD}>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Recent Reports</p>
                {client.documents.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Reports and deliverables will appear after assessments, roadmaps, or QBRs are generated.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm">
                    {client.documents.slice(0, 3).map((document) => (
                      <li key={document.id}>
                        <Link href={document.fileUrl} className="font-medium hover:underline">
                          {document.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatDisplayDate(document.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Recent Projects</p>
                {recentProjects.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Projects will appear once roadmap work is scoped or started.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm">
                    {recentProjects.slice(0, 3).map((project) => (
                      <li key={project.id}>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {project.status} · {formatDisplayDate(project.updatedAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Completed Recommendations</p>
                {completedRecommendations.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Completed recommendations will appear as priorities are resolved.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm">
                    {completedRecommendations.slice(0, 3).map((recommendation) => (
                      <li key={recommendation.id}>
                        <p className="font-medium">{recommendation.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {recommendation.completedAt
                            ? formatDisplayDate(recommendation.completedAt)
                            : formatDisplayDate(recommendation.updatedAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Recent Strategy Sessions</p>
                {strategySessions.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Schedule a strategy session to begin quarterly planning.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm">
                    {strategySessions.slice(0, 3).map((session) => (
                      <li key={session.id}>
                        <p className="font-medium">{session.title ?? "Strategy session"}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.completedAt
                            ? `Completed ${formatDisplayDate(session.completedAt)}`
                            : session.scheduledAt
                              ? `Scheduled ${formatDisplayDate(session.scheduledAt)}`
                              : formatDisplayDate(session.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={CLIENT_SURFACE_CARD}>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <a href={SERVICES_CTA_DESTINATIONS.generalConsultation.href} className={buttonVariants({ variant: "default" })}>
            Schedule Strategy Session
          </a>
          <Link href={`/clients/${clientId}/roadmap`} className={buttonVariants({ variant: "outline" })}>
            View Roadmap
          </Link>
          <Link href={`/clients/${clientId}/executive-reports`} className={buttonVariants({ variant: "outline" })}>
            View Reports
          </Link>
          <Link href={`/clients/${clientId}/projects`} className={buttonVariants({ variant: "outline" })}>
            Open Projects
          </Link>
          <Link href={`/clients/${clientId}/billing`} className={buttonVariants({ variant: "outline" })}>
            Manage Subscription
          </Link>
          {bookingUrl ? (
            <a href={bookingUrl} className={buttonVariants({ variant: "outline" })}>
              Contact Bobkat IT
            </a>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <CurrentQuarterPriorities
          priorities={client.recommendations.map((recommendation) => ({
            id: recommendation.id,
            title: recommendation.title,
            severity: recommendation.priority,
          }))}
        />

        <Card className={CLIENT_SURFACE_CARD}>
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
        <Card className={CLIENT_SURFACE_CARD}>
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

        <QuarterlyReviewSummary
          currentQuarter={currentQuarterLabel()}
          nextReviewDate={nextReview?.toISOString() ?? null}
          previousReviewDate={
            previousGeneratedReview
              ? (
                  previousGeneratedReview.generatedAt ?? previousGeneratedReview.reviewPeriodEnd
                )?.toISOString() ?? null
              : null
          }
          viewReviewsHref={`/clients/${clientId}/quarterly-reviews`}
          generateReportHref={`/clients/${clientId}/quarterly-review`}
          showGenerateReport={user.role !== "client"}
        />

        <Card className={CLIENT_SURFACE_CARD}>
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

      <Card className={CLIENT_SURFACE_CARD}>
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
    </ClientPageShell>
  );
}
