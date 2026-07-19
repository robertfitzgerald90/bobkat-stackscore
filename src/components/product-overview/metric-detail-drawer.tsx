"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import {
  getDemoPillarById,
  getDemoProjectById,
  northstarDemoDashboard,
} from "@/lib/product-overview/demo-dashboard";
import {
  getDemoConnectionByPillarId,
  getDemoConnectionByRecommendationId,
  getDemoRecommendationById,
  getDemoRoadmapInitiativeById,
} from "@/lib/product-overview/demo-strategy";
import type { DemoDetailPanel } from "@/lib/product-overview/types";

type MetricDetailDrawerProps = {
  panel: DemoDetailPanel;
  onClose: () => void;
};

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-2 text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

function ConnectedLinks({
  pillarId,
  recommendationId,
  roadmapInitiativeId,
}: {
  pillarId?: string;
  recommendationId?: string;
  roadmapInitiativeId?: string;
}) {
  const { openConnectedPillar, openConnectedRecommendation, openConnectedRoadmapInitiative } =
    useProductOverview();

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Connected in StackScore</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {pillarId ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => openConnectedPillar(pillarId, "drawer_link")}
          >
            View pillar
          </Button>
        ) : null}
        {recommendationId ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => openConnectedRecommendation(recommendationId, "drawer_link")}
          >
            View recommendation
          </Button>
        ) : null}
        {roadmapInitiativeId ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => openConnectedRoadmapInitiative(roadmapInitiativeId, "drawer_link")}
          >
            View roadmap initiative
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function MetricDetailDrawer({ panel, onClose }: MetricDetailDrawerProps) {
  const open = panel !== null;

  let title = "";
  let description = "";
  let body: React.ReactNode = null;

  switch (panel?.type) {
    case "pillar":
    case "assessmentPillar": {
      const pillar = getDemoPillarById(panel.pillarId);
      const connection = getDemoConnectionByPillarId(panel.pillarId);
      title = pillar?.name ?? "Technology Pillar";
      description =
        panel.type === "assessmentPillar"
          ? "Assessment finding, risk, and recommended improvement"
          : "Pillar score, risk, and improvement context";
      body = pillar ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Current score</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{pillar.score}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Target score</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{pillar.targetScore}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">{pillar.maturityLabel}</Badge>
            <Badge variant={pillar.priorityLevel === "Critical" ? "destructive" : "outline"}>
              {pillar.priorityLevel} priority
            </Badge>
          </div>
          {panel.type === "assessmentPillar" ? (
            <>
              <DetailSection label="Key finding">{pillar.keyFinding}</DetailSection>
              <DetailSection label="Business risk">{pillar.primaryRisk}</DetailSection>
              <DetailSection label="Recommended improvement">
                {pillar.recommendedImprovement}
              </DetailSection>
              <DetailSection label="Expected business outcome">
                {pillar.expectedBusinessOutcome}
              </DetailSection>
            </>
          ) : (
            <>
              <DetailSection label="Summary">{pillar.summary}</DetailSection>
              <DetailSection label="Primary risk">{pillar.primaryRisk}</DetailSection>
              <DetailSection label="Example recommendation">{pillar.exampleRecommendation}</DetailSection>
              <DetailSection label="Business impact">{pillar.businessImpact}</DetailSection>
            </>
          )}
          <ConnectedLinks
            pillarId={pillar.id}
            recommendationId={connection?.recommendationId}
            roadmapInitiativeId={connection?.roadmapInitiativeId}
          />
        </div>
      ) : null;
      break;
    }
    case "recommendation": {
      const recommendation = getDemoRecommendationById(panel.recommendationId);
      const connection = getDemoConnectionByRecommendationId(panel.recommendationId);
      const roadmapInitiative = recommendation
        ? getDemoRoadmapInitiativeById(recommendation.relatedRoadmapInitiativeId)
        : undefined;
      title = recommendation?.title ?? "Recommendation Detail";
      description = "Why this recommendation exists and how it connects to the roadmap";
      body = recommendation ? (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant={recommendation.priority === "Critical" ? "destructive" : "default"}>
              {recommendation.priority} priority
            </Badge>
            <Badge variant="outline">{recommendation.effort} effort</Badge>
            <Badge variant="outline">{recommendation.status}</Badge>
          </div>
          <DetailSection label="Why this recommendation exists">{recommendation.whyItMatters}</DetailSection>
          <DetailSection label="Risk if ignored">{recommendation.riskIfIgnored}</DetailSection>
          <DetailSection label="Expected benefit">{recommendation.expectedOutcome}</DetailSection>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Estimated timeline</p>
              <p className="mt-1 font-medium">{recommendation.estimatedTimeline}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Estimated investment</p>
              <p className="mt-1 font-medium">{recommendation.estimatedCost}</p>
            </div>
          </div>
          <DetailSection label="Dependencies">
            {recommendation.dependencies.length > 0 ? (
              <ul className="space-y-1">
                {recommendation.dependencies.map((dependency) => (
                  <li key={dependency}>• {dependency}</li>
                ))}
              </ul>
            ) : (
              "No dependencies recorded."
            )}
          </DetailSection>
          <DetailSection label="Related technology pillar">{recommendation.pillarName}</DetailSection>
          <DetailSection label="Related roadmap initiative">
            {roadmapInitiative?.title ?? "Not yet mapped"}
          </DetailSection>
          <ConnectedLinks
            pillarId={connection?.pillarId ?? recommendation.pillarId}
            recommendationId={recommendation.id}
            roadmapInitiativeId={connection?.roadmapInitiativeId ?? recommendation.relatedRoadmapInitiativeId}
          />
        </div>
      ) : null;
      break;
    }
    case "roadmapInitiative": {
      const initiative = getDemoRoadmapInitiativeById(panel.initiativeId);
      const recommendation = initiative
        ? getDemoRecommendationById(initiative.relatedRecommendationId)
        : undefined;
      title = initiative?.title ?? "Roadmap Initiative";
      description = "Strategic initiative detail and business outcome";
      body = initiative ? (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant={initiative.priority === "Critical" ? "destructive" : "outline"}>
              {initiative.priority} priority
            </Badge>
            <Badge variant="outline">{initiative.status}</Badge>
            <Badge variant="outline">{initiative.quarter}</Badge>
          </div>
          <DetailSection label="Description">{initiative.description}</DetailSection>
          <DetailSection label="Budget">{initiative.budget}</DetailSection>
          <DetailSection label="Expected business outcome">{initiative.expectedBusinessOutcome}</DetailSection>
          <DetailSection label="Related recommendation">
            {recommendation?.title ?? "Not mapped"}
          </DetailSection>
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Completion</span>
              <span>{initiative.completionPercent}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${initiative.completionPercent}%` }}
              />
            </div>
          </div>
          <ConnectedLinks
            pillarId={initiative.relatedPillarId}
            recommendationId={initiative.relatedRecommendationId}
            roadmapInitiativeId={initiative.id}
          />
        </div>
      ) : null;
      break;
    }
    case "project":
    case "nextAction": {
      const projectId =
        panel.type === "project"
          ? panel.projectId
          : northstarDemoDashboard.nextAction.relatedProjectId;
      const project = getDemoProjectById(projectId);
      title = project?.title ?? "Project Detail";
      description = panel.type === "nextAction" ? "Priority project detail" : "Active project detail";
      body = project ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">{project.status}</Badge>
            <span className="text-sm text-muted-foreground">{project.progress}% complete</span>
          </div>
          {panel.type === "nextAction" ? (
            <DetailSection label="Recommended action">{northstarDemoDashboard.nextAction.body}</DetailSection>
          ) : null}
          <DetailSection label="Description">{project.description}</DetailSection>
          <DetailSection label="Owner">{project.owner}</DetailSection>
          <DetailSection label="Target completion">{project.targetCompletion}</DetailSection>
          <DetailSection label="Milestones">
            <ul className="space-y-1">
              {project.milestones.map((milestone) => (
                <li key={milestone}>• {milestone}</li>
              ))}
            </ul>
          </DetailSection>
          <DetailSection label="Related recommendation">{project.relatedRecommendation}</DetailSection>
          <DetailSection label="Business outcome">{project.businessOutcome}</DetailSection>
          <DetailSection label="Budget range">{project.budgetRange}</DetailSection>
        </div>
      ) : null;
      break;
    }
    case "roadmap": {
      title = "Roadmap Preview";
      description = "Quarter-based strategic roadmap for Northstar Manufacturing";
      body = (
        <div className="space-y-4">
          {northstarDemoDashboard.roadmapQuarters.map((quarter) => (
            <div key={quarter.quarter} className="rounded-xl border border-border/70 p-4">
              <p className="font-medium text-foreground">{quarter.quarter}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {quarter.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
      break;
    }
    case "qbr": {
      const review = northstarDemoDashboard.quarterlyReview;
      title = "Executive Quarterly Review Preview";
      description = `Prepared for ${review.nextReviewDate}`;
      body = (
        <div className="space-y-5">
          <DetailSection label="Status">{review.status}</DetailSection>
          <DetailSection label="Executive summary">
            <ul className="space-y-2">
              {review.executiveSummary.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </DetailSection>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Score change</p>
              <p className="mt-1 text-xl font-semibold text-success">+{review.scoreChange}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Budget variance</p>
              <p className="mt-1 text-xl font-semibold">{review.budgetVariance}</p>
            </div>
          </div>
        </div>
      );
      break;
    }
    default:
      break;
  }

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent size="wide" aria-describedby="metric-detail-description">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription id="metric-detail-description">{description}</SheetDescription>
        </SheetHeader>
        <SheetBody>{body}</SheetBody>
      </SheetContent>
    </Sheet>
  );
}
