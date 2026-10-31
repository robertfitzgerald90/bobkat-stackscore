import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import {
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
import { buttonClassName } from "@/components/ui/button";
import type { CustomerOverviewDto } from "@/lib/customer-portal/overview";
import {
  PUBLIC_DEMO_EXPLORE_PATH,
  PUBLIC_DEMO_OPPORTUNITIES_PATH,
  PUBLIC_DEMO_PROJECTS_PATH,
  PUBLIC_DEMO_REPORTS_PATH,
  PUBLIC_DEMO_ROADMAP_PATH,
} from "@/lib/public-demo/routes";

type DemoOverviewExperienceProps = {
  overview: CustomerOverviewDto;
};

/**
 * SS-WEB-003 — Read-only Overview using customer presentation components.
 * Omits assessment start/resume, booking, and vCIO mutation paths.
 */
export function DemoOverviewExperience({ overview }: DemoOverviewExperienceProps) {
  const workspaceLinks: WorkspaceHubLink[] = [
    {
      href: PUBLIC_DEMO_EXPLORE_PATH,
      title: "Explore pillars",
      description: "Eight technology maturity domains",
    },
    {
      href: PUBLIC_DEMO_ROADMAP_PATH,
      title: "Roadmap",
      description: "Living execution plan and progress",
    },
    {
      href: PUBLIC_DEMO_PROJECTS_PATH,
      title: "Projects",
      description: "Active delivery work and completion status",
    },
    {
      href: PUBLIC_DEMO_OPPORTUNITIES_PATH,
      title: "Improvement opportunities",
      description: "Prioritized assessment recommendations",
    },
    {
      href: PUBLIC_DEMO_REPORTS_PATH,
      title: "Reports",
      description: "Sample assessment report and reviews",
    },
  ];

  return (
    <ClientPageShell>
      <OverviewMaturityHero overview={overview} />

      {overview.nextAction ? (
        <ClientNextActionCard
          title={overview.nextAction.label}
          description={overview.nextAction.description}
          actions={
            <>
              <Link href={overview.nextAction.href} className={buttonClassName({})}>
                {overview.nextAction.label}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              {overview.reportHref ? (
                <Link
                  href={overview.reportHref}
                  className={buttonClassName({ variant: "outline" })}
                >
                  <FileText className="mr-2 h-4 w-4" aria-hidden />
                  Sample assessment report
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
        recommendationsHref={PUBLIC_DEMO_OPPORTUNITIES_PATH}
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

      <section className="space-y-3">
        <ClientSectionHeader
          title="Workspace"
          description="Continue exploring the sample StackScore customer experience."
        />
        <WorkspaceHubLinks links={workspaceLinks} />
      </section>
    </ClientPageShell>
  );
}
