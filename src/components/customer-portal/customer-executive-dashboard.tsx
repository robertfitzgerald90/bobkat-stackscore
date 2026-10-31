import Link from "next/link";
import { ArrowRight, Calendar, ClipboardList, FileText } from "lucide-react";
import {
  ClientEmptyState,
  ClientNextActionCard,
  ClientPageShell,
  ClientSectionHeader,
} from "@/components/client-ui";
import {
  WorkspaceHubLinks,
  type WorkspaceHubLink,
} from "@/components/client-workspace/workspace-hub-links";
import { OverviewMaturityHero } from "@/components/customer-portal/overview/overview-maturity-hero";
import { OverviewPillarGrid } from "@/components/customer-portal/overview/overview-pillar-grid";
import { OverviewPriorityOpportunities } from "@/components/customer-portal/overview/overview-priority-opportunities";
import { OverviewRoadmapProgress } from "@/components/customer-portal/overview/overview-roadmap-progress";
import { OverviewStrengthsExposure } from "@/components/customer-portal/overview/overview-strengths-exposure";
import { OverviewVcioStrip } from "@/components/customer-portal/overview/overview-vcio-strip";
import { BookingButton } from "@/components/support/booking-button";
import { buttonClassName } from "@/components/ui/button";
import {
  clientExplorePath,
  clientRecommendationsPath,
  clientWorkspaceProjectsPath,
} from "@/lib/clients/paths";
import type { CustomerOverviewDto } from "@/lib/customer-portal/overview";
import { getBookingUrl } from "@/lib/support/config";

export type CustomerExecutiveDashboardProps = {
  overview: CustomerOverviewDto;
  /**
   * Optional workspace hub links (SS-WEB-003-R1 public demo adapter).
   * When omitted, authenticated client paths are used.
   */
  workspaceLinks?: WorkspaceHubLink[];
  /** Optional override for priority-opportunities “View all” href. */
  recommendationsHref?: string;
  /** Hide booking CTAs — public demo / read-only shells. Default true. */
  showBookingCta?: boolean;
};

function defaultWorkspaceLinks(overview: CustomerOverviewDto): WorkspaceHubLink[] {
  const recommendationsHref = clientRecommendationsPath(overview.clientId);
  return [
    {
      href: clientExplorePath(overview.clientId),
      title: "Explore pillars",
      description: "Eight technology maturity domains",
    },
    {
      href: overview.roadmap.href,
      title: "Roadmap",
      description: "Living execution plan and progress",
    },
    {
      href: clientWorkspaceProjectsPath(overview.clientId),
      title: "Projects",
      description: "Active delivery work and completion status",
    },
    {
      href: recommendationsHref,
      title: "Improvement opportunities",
      description: "Prioritized assessment recommendations",
    },
    {
      href: `/clients/${overview.clientId}/executive-reports`,
      title: "Reports",
      description: "Assessment report, PDF, and reviews",
    },
    ...(overview.vcio.show
      ? [
          {
            href: overview.vcio.href,
            title: "vCIO Dashboard",
            description: "Strategic advisory workspace",
          } satisfies WorkspaceHubLink,
        ]
      : []),
    {
      href: `/clients/${overview.clientId}/lifecycle`,
      title: "Technology Lifecycle",
      description: "Lifecycle status and planning context",
    },
  ];
}

/**
 * SS-UX-004 — Premium customer Overview dashboard.
 * Data is pre-assembled in `getCustomerOverview` — no scoring or catalog math here.
 * SS-WEB-003-R1: optional href adapters for public demo; composition unchanged.
 */
export function CustomerExecutiveDashboard({
  overview,
  workspaceLinks,
  recommendationsHref,
  showBookingCta = true,
}: CustomerExecutiveDashboardProps) {
  const bookingUrl = showBookingCta ? getBookingUrl() : null;
  const resolvedRecommendationsHref =
    recommendationsHref ?? clientRecommendationsPath(overview.clientId);
  const resolvedWorkspaceLinks = workspaceLinks ?? defaultWorkspaceLinks(overview);

  return (
    <ClientPageShell>
      {!overview.hasCompletedAssessment && !overview.assessmentInProgress ? (
        <ClientEmptyState
          icon={ClipboardList}
          title="Your executive overview begins with an assessment"
          description="Complete the Technology Maturity Assessment to receive your StackScore, executive report, and strategic priorities — translated into business language you can act on."
          nextStep="Begin the assessment when you are ready."
          action={
            <Link href="/assessment/start" className={buttonClassName({ size: "lg" })}>
              Start Assessment
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          }
        />
      ) : null}

      {overview.assessmentInProgress ? (
        <ClientNextActionCard
          title="Assessment in progress"
          description="Your answers are saved automatically. Resume when ready to finish and unlock your official StackScore."
          actions={
            <>
              <Link href="/assessment/start" className={buttonClassName({})}>
                Resume Assessment
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              {bookingUrl ? (
                <BookingButton
                  label="primary"
                  variant="outline"
                  icon={<Calendar className="mr-2 h-4 w-4" />}
                />
              ) : null}
            </>
          }
        />
      ) : null}

      {overview.hasCompletedAssessment ? (
        <>
          <OverviewMaturityHero overview={overview} />

          <OverviewVcioStrip vcio={overview.vcio} />

          {overview.nextAction && !overview.assessmentInProgress ? (
            <ClientNextActionCard
              title={overview.nextAction.label}
              description={overview.nextAction.description}
              actions={
                <>
                  <Link href={overview.nextAction.href} className={buttonClassName({})}>
                    {overview.nextAction.label}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                  {overview.reportHref && overview.nextAction.href !== overview.reportHref ? (
                    <Link
                      href={overview.reportHref}
                      className={buttonClassName({ variant: "outline" })}
                    >
                      <FileText className="mr-2 h-4 w-4" aria-hidden />
                      Assessment report
                    </Link>
                  ) : null}
                </>
              }
            />
          ) : null}

          <OverviewPillarGrid pillars={overview.pillars} />

          <OverviewPriorityOpportunities
            priorities={overview.priorities}
            activeOpportunityCount={overview.activeOpportunityCount}
            recommendationsHref={resolvedRecommendationsHref}
          />

          <OverviewStrengthsExposure
            demonstratedStrengths={overview.demonstratedStrengths}
            comparativeStrengths={overview.comparativeStrengths}
            pillars={overview.pillars}
          />

          <OverviewRoadmapProgress
            roadmap={overview.roadmap}
            journey={overview.journey}
            stackScore={overview.stackScore}
          />
        </>
      ) : null}

      <section className="space-y-3">
        <ClientSectionHeader
          title="Workspace"
          description="Continue to Explore, Roadmap, Reports, and related tools."
        />
        <WorkspaceHubLinks links={resolvedWorkspaceLinks} />
      </section>
    </ClientPageShell>
  );
}

/** @deprecated Prefer CustomerExecutiveDashboard — alias retained for imports. */
export { CustomerExecutiveDashboard as ExecutiveBriefingView };
