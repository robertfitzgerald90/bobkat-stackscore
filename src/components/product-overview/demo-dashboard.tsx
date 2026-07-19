"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatDemoCurrency,
} from "@/lib/product-overview/demo-dashboard";
import {
  trackProductOverviewPillarOpened,
  trackProductOverviewProjectOpened,
  trackProductOverviewQbrPreviewed,
  trackProductOverviewRecommendationOpened,
  trackProductOverviewRoadmapPreviewed,
} from "@/lib/analytics/product-overview-events";
import { BudgetSummaryCard } from "@/components/product-overview/budget-summary-card";
import { NextActionCard } from "@/components/product-overview/next-action-card";
import { PillarScoreGrid } from "@/components/product-overview/pillar-score-grid";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { ProjectSummaryCard } from "@/components/product-overview/project-summary-card";
import { QuarterlyReviewCard } from "@/components/product-overview/quarterly-review-card";
import { RecommendationSummaryCard } from "@/components/product-overview/recommendation-summary-card";
import { RoadmapSummaryCard } from "@/components/product-overview/roadmap-summary-card";
import { TechnologyScoreCard } from "@/components/product-overview/technology-score-card";
import { PO_INTERACTIVE_TILE, PO_METRIC_VALUE } from "@/lib/product-overview/polish-classes";
import type { DemoDetailPanel } from "@/lib/product-overview/types";

type DemoDashboardProps = {
  compact?: boolean;
  readOnly?: boolean;
  onOpenDetail?: (panel: DemoDetailPanel) => void;
};

export function DemoDashboard({ compact = false, readOnly = false, onOpenDetail }: DemoDashboardProps) {
  const { demoProfile } = useProductOverview();
  const data = demoProfile.dashboard;
  const { openConnectedPillar, openConnectedRecommendation, openConnectedProject } = useProductOverview();

  function openDetail(panel: DemoDetailPanel) {
    if (!panel) return;
    if (panel.type === "pillar") {
      trackProductOverviewPillarOpened(panel.pillarId, "dashboard");
      openConnectedPillar(panel.pillarId, "dashboard_pillar");
      return;
    }
    if (panel.type === "recommendation") {
      trackProductOverviewRecommendationOpened(panel.recommendationId);
      openConnectedRecommendation(panel.recommendationId, "dashboard_recommendation");
      return;
    }
    if (panel.type === "project") {
      trackProductOverviewProjectOpened(panel.projectId);
      openConnectedProject(panel.projectId, "dashboard_project");
      return;
    }
    if (panel.type === "nextAction") {
      trackProductOverviewProjectOpened(data.nextAction.relatedProjectId);
      openConnectedProject(data.nextAction.relatedProjectId, "next_action");
      return;
    }
    if (panel.type === "roadmap") trackProductOverviewRoadmapPreviewed();
    if (panel.type === "qbr") trackProductOverviewQbrPreviewed();
    onOpenDetail?.(panel);
  }

  return (
    <div className={cn("bg-background", compact ? "p-3 sm:p-4" : "space-y-6")}>
      <div className={cn("flex flex-wrap items-center justify-between gap-3", compact && "mb-3")}>
        <div>
          <p className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-lg")}>
            {data.organization.name}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {data.organization.employeeCount} employees · {data.organization.locationCount} locations ·{" "}
            {data.organization.industry}
          </p>
        </div>
        {!compact ? <Badge variant="secondary">Client Success Dashboard</Badge> : null}
      </div>

      {!compact ? (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Technology Score", `${data.technologyScore.score}/${data.technologyScore.maxScore}`],
              ["Open Recommendations", String(data.metrics.openRecommendations)],
              ["Active Projects", String(data.metrics.activeProjects)],
              ["Roadmap Completion", `${data.metrics.roadmapCompletionPercent}%`],
              ["Next Quarterly Review", data.quarterlyReview.nextReviewDate],
              ["Annual Technology Plan", formatDemoCurrency(data.metrics.annualTechnologyPlan)],
              ["Approved Spend", formatDemoCurrency(data.metrics.approvedSpend)],
              ["Projected Score", `${data.technologyScore.projectedScore}/${data.technologyScore.maxScore}`],
            ].map(([label, value]) => (
              <div key={label} className={cn(PO_INTERACTIVE_TILE, "p-3")}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn("mt-1 text-sm font-semibold text-foreground", PO_METRIC_VALUE)}>
                  {value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "xl:grid-cols-12")}>
        <div className={cn(compact ? "" : "xl:col-span-7")}>
          <TechnologyScoreCard
            scoreState={data.technologyScore}
            compact={compact}
            readOnly={readOnly || compact}
          />
        </div>
        {!compact ? (
          <div className="xl:col-span-5">
            <NextActionCard
              nextAction={data.nextAction}
              onReview={() => openDetail({ type: "nextAction" })}
            />
          </div>
        ) : null}
      </div>

      <PillarScoreGrid
        pillars={data.pillars}
        compact={compact}
        onPillarClick={(pillarId) => openDetail({ type: "pillar", pillarId })}
      />

      {!compact ? (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <RecommendationSummaryCard
              metrics={data.metrics}
              onViewExample={() => openDetail({ type: "recommendation", recommendationId: data.featuredRecommendationId })}
            />
            <RoadmapSummaryCard
              completionPercent={data.metrics.roadmapCompletionPercent}
              quarters={data.roadmapQuarters}
              onExplore={() => openDetail({ type: "roadmap" })}
            />
          </div>

          <ProjectSummaryCard
            projects={data.projects}
            onProjectClick={(projectId) => openDetail({ type: "project", projectId })}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <QuarterlyReviewCard
              review={data.quarterlyReview}
              onPreview={() => openDetail({ type: "qbr" })}
            />
            <BudgetSummaryCard budget={data.budget} />
          </div>
        </>
      ) : null}
    </div>
  );
}
