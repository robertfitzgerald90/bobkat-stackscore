import type { ReactNode } from "react";
import Link from "next/link";
import { Calendar, FileText, Map } from "lucide-react";
import type { ClientRoadmapDashboard } from "@/lib/client-roadmap/types";
import {
  CLIENT_METRIC_VALUE,
  CLIENT_METRIC_WELL,
  CLIENT_SECTION_EYEBROW,
  CLIENT_SURFACE_CARD,
} from "@/lib/client-ui/tokens";
import { ClientEmptyState, ClientSectionHeader, ClientStatusBadge } from "@/components/client-ui";
import { BookingButton } from "@/components/support/booking-button";
import { buttonClassName } from "@/components/ui/button";
import { EffectiveScoreJourneyView } from "./effective-score-journey";
import { RoadmapKpiStrip } from "./roadmap-kpi-strip";
import { RoadmapPhaseCard } from "./roadmap-phase-card";
import { RoadmapTimeline } from "./roadmap-timeline";
import { cn } from "@/lib/utils";

export function RoadmapDashboard({
  dashboard,
  emptyFallback,
}: {
  dashboard: ClientRoadmapDashboard | null;
  emptyFallback?: ReactNode;
}) {
  if (!dashboard) {
    return <>{emptyFallback}</>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <ClientSectionHeader
          eyebrow="Living Execution Plan"
          title={dashboard.title}
          description={
            dashboard.status === "draft"
              ? "Draft roadmap from your latest assessment — refine with a Technology Improvement Plan when ready."
              : "Living implementation roadmap — approve and deliver one phase at a time."
          }
        />
        <ClientStatusBadge tone="muted">{dashboard.status}</ClientStatusBadge>
      </div>

      <RoadmapKpiStrip dashboard={dashboard} />
      <EffectiveScoreJourneyView journey={dashboard.scoreJourney} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <RoadmapTimeline dashboard={dashboard} />
        <div className="space-y-4">
          <p className={cn(CLIENT_SECTION_EYEBROW, "text-xs tracking-wide")}>
            Implementation Phases
          </p>
          {dashboard.phases.map((phase) => (
            <RoadmapPhaseCard
              key={phase.id}
              clientId={dashboard.clientId}
              phase={phase}
            />
          ))}
        </div>
      </div>

      <div className={cn("rounded-xl border p-4", CLIENT_SURFACE_CARD, "bg-muted/20")}>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Business Value Progress
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DomainMetric
            label="Security Improvement"
            value={dashboard.metrics.domainImprovements.securityImprovement}
          />
          <DomainMetric
            label="Infrastructure Improvement"
            value={dashboard.metrics.domainImprovements.infrastructureImprovement}
          />
          <DomainMetric
            label="Business Continuity"
            value={dashboard.metrics.domainImprovements.businessContinuityImprovement}
          />
          <DomainMetric
            label="Operational Maturity"
            value={dashboard.metrics.domainImprovements.operationalMaturityImprovement}
          />
        </div>
      </div>
    </div>
  );
}

function DomainMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className={cn(CLIENT_METRIC_WELL, "border border-border/50")}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-1 text-lg font-semibold", CLIENT_METRIC_VALUE)}>+{value} pts</p>
    </div>
  );
}

export function RoadmapEmptyState({ clientId }: { clientId: string }) {
  return (
    <ClientEmptyState
      icon={Map}
      title="No living roadmap yet"
      description="Complete a technology assessment to create a draft roadmap, or generate a Technology Improvement Plan to activate the full implementation journey."
      nextStep="Review your reports or schedule a strategy session with Bobkat IT."
      action={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/clients/${clientId}/executive-reports`}
            className={buttonClassName({ variant: "outline" })}
          >
            <FileText className="mr-2 h-4 w-4" />
            View Reports
          </Link>
          <BookingButton label="primary" icon={<Calendar className="mr-2 h-4 w-4" />} />
        </div>
      }
    />
  );
}
