import Link from "next/link";
import { FileText, Map } from "lucide-react";
import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPageShell,
} from "@/components/client-ui";
import { BookingButton } from "@/components/support/booking-button";
import { buttonClassName } from "@/components/ui/button";
import { RoadmapExecutiveSummary } from "@/components/customer-portal/roadmap/roadmap-executive-summary";
import { RoadmapInitiatives } from "@/components/customer-portal/roadmap/roadmap-initiatives";
import { RoadmapNextActions } from "@/components/customer-portal/roadmap/roadmap-next-actions";
import { RoadmapPhaseGrid } from "@/components/customer-portal/roadmap/roadmap-phase-grid";
import { RoadmapProjectsPanel } from "@/components/customer-portal/roadmap/roadmap-projects-panel";
import type { CustomerRoadmapExperienceDto } from "@/lib/customer-portal/roadmap-dto";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { cn } from "@/lib/utils";

type CustomerRoadmapExperienceProps = {
  clientId: string;
  experience: CustomerRoadmapExperienceDto | null;
  /** Override reports link (public demo / alternate shells). */
  reportsHref?: string;
  /** Hide booking CTA — required for public read-only demo. */
  showBookingCta?: boolean;
};

export function CustomerRoadmapExperience({
  clientId,
  experience,
  reportsHref,
  showBookingCta = true,
}: CustomerRoadmapExperienceProps) {
  const reportsPath = reportsHref ?? `/clients/${clientId}/executive-reports`;

  if (!experience) {
    return (
      <ClientPageShell className="max-w-5xl space-y-8">
        <ClientPageHeader
          eyebrow="Implementation Journey"
          title="Roadmap"
          description="Track your phased technology journey and measure implementation progress separately from official StackScore."
        />
        <ClientEmptyState
          icon={Map}
          title="No roadmap yet"
          description="A living execution plan appears after your assessment recommendations are organized into implementation phases."
          nextStep="Review executive reports or schedule a strategy session with Bobkat IT."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={reportsPath}
                className={buttonClassName({ variant: "outline" })}
              >
                <FileText className="mr-2 h-4 w-4" aria-hidden />
                Executive reports
              </Link>
              {showBookingCta ? (
                <BookingButton label="primary" icon={<Map className="mr-2 h-4 w-4" />} />
              ) : null}
            </div>
          }
        />
      </ClientPageShell>
    );
  }

  return (
    <ClientPageShell className="max-w-5xl space-y-10">
      <ClientPageHeader
        eyebrow="Implementation Journey"
        title="Roadmap"
        description="Connect assessment findings, improvement opportunities, and phased implementation — without changing official StackScore until reassessment."
      />

      {experience.isDraft ? (
        <p
          className={cn(
            CLIENT_SURFACE_CARD,
            "rounded-sm border border-warning/40 bg-warning/5 px-4 py-3 text-sm text-muted-foreground",
          )}
          role="status"
        >
          This roadmap is still in <span className="font-medium text-foreground">draft</span>.
          Progress counts reflect customer-visible initiatives only. Your advisor may refine
          sequencing before active implementation.
        </p>
      ) : null}

      <RoadmapExecutiveSummary
        summary={experience.summary}
        isDraft={experience.isDraft}
        title={experience.title}
      />

      <RoadmapPhaseGrid phases={experience.phases} />

      <RoadmapInitiatives
        initiatives={experience.initiatives}
        opportunitiesHref={experience.opportunitiesHref}
      />

      <RoadmapProjectsPanel
        projects={experience.projects}
        projectsHref={experience.projectsHref}
      />

      <RoadmapNextActions actions={experience.nextActions} />
    </ClientPageShell>
  );
}
