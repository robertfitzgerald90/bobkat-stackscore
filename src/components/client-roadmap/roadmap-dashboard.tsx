import type { ReactNode } from "react";
import Link from "next/link";
import { Calendar, FileText, Map } from "lucide-react";
import type { ClientRoadmapDashboard } from "@/lib/client-roadmap/types";
import { BookingButton } from "@/components/support/booking-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { EffectiveScoreJourneyView } from "./effective-score-journey";
import { RoadmapKpiStrip } from "./roadmap-kpi-strip";
import { RoadmapPhaseCard } from "./roadmap-phase-card";
import { RoadmapTimeline } from "./roadmap-timeline";

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
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#082f5b]">
            Technology Roadmap
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">{dashboard.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {dashboard.status === "draft"
              ? "Draft roadmap from your latest assessment — refine with a Technology Improvement Plan when ready."
              : "Living implementation roadmap — approve and deliver one phase at a time."}
          </p>
        </div>
        <span className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {dashboard.status}
        </span>
      </div>

      <RoadmapKpiStrip dashboard={dashboard} />
      <EffectiveScoreJourneyView journey={dashboard.scoreJourney} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <RoadmapTimeline dashboard={dashboard} />
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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

      <div className="rounded-xl border bg-slate-50/80 p-4">
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
    <div className="rounded-lg border bg-white px-3 py-2">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums">+{value} pts</p>
    </div>
  );
}

export function RoadmapEmptyState({ clientId }: { clientId: string }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Map className="h-4 w-4 text-primary" />
          No living roadmap yet
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Complete a technology assessment to create a draft roadmap, or generate a Technology
          Improvement Plan to activate the full implementation journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/clients/${clientId}/executive-reports`}
          className={buttonClassName({ variant: "outline" })}
        >
          <FileText className="mr-2 h-4 w-4" />
          View Reports
        </Link>
        <BookingButton label="primary" icon={<Calendar className="mr-2 h-4 w-4" />} />
      </CardContent>
    </Card>
  );
}
