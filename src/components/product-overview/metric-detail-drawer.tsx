"use client";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  featuredRecommendation,
  getDemoPillarById,
  getDemoProjectById,
  northstarDemoDashboard,
} from "@/lib/product-overview/demo-dashboard";
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

export function MetricDetailDrawer({ panel, onClose }: MetricDetailDrawerProps) {
  const open = panel !== null;

  let title = "";
  let description = "";
  let body: React.ReactNode = null;

  switch (panel?.type) {
    case "pillar": {
      const pillar = getDemoPillarById(panel.pillarId);
      title = pillar?.name ?? "Technology Pillar";
      description = "Pillar score, risk, and improvement context";
      body = pillar ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-4xl font-semibold tabular-nums">{pillar.score}</p>
            <Badge variant="outline">{pillar.maturityLabel}</Badge>
          </div>
          <DetailSection label="Summary">{pillar.summary}</DetailSection>
          <DetailSection label="Primary risk">{pillar.primaryRisk}</DetailSection>
          <DetailSection label="Example recommendation">{pillar.exampleRecommendation}</DetailSection>
          <DetailSection label="Target score">{pillar.targetScore}</DetailSection>
          <DetailSection label="Business impact">{pillar.businessImpact}</DetailSection>
        </div>
      ) : null;
      break;
    }
    case "recommendation": {
      title = featuredRecommendation.title;
      description = "Example recommendation detail";
      body = (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="destructive">{featuredRecommendation.priority} priority</Badge>
            <Badge variant="outline">{featuredRecommendation.effort} effort</Badge>
          </div>
          <DetailSection label="Estimated cost">{featuredRecommendation.estimatedCost}</DetailSection>
          <DetailSection label="Target">{featuredRecommendation.target}</DetailSection>
          <DetailSection label="Why it matters">{featuredRecommendation.whyItMatters}</DetailSection>
          <DetailSection label="Expected outcome">{featuredRecommendation.expectedOutcome}</DetailSection>
        </div>
      );
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
