"use client";

import { ChevronRight } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectMilestoneTimeline } from "@/components/product-overview/project-milestone-timeline";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { trackProductOverviewProjectOpened } from "@/lib/analytics/product-overview-events";
import { STANDARD_TIMELINE } from "@/lib/product-overview/demo-execution";
import type { DemoProject } from "@/lib/product-overview/types";
import { cn } from "@/lib/utils";

function ProjectCard({
  project,
  highlighted,
  onClick,
}: {
  project: DemoProject;
  highlighted: boolean;
  onClick: (anchor: HTMLElement) => void;
}) {
  return (
    <button
      type="button"
      id={`product-overview-project-${project.id}`}
      data-demo-feature={`project:${project.id}`}
      onClick={(event) => onClick(event.currentTarget)}
      className={cn(
        "w-full rounded-xl border border-border/70 bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        highlighted && "ring-2 ring-primary ring-offset-2",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={project.priority === "Critical" ? "destructive" : "outline"}>
              {project.priority}
            </Badge>
            <Badge variant="outline">{project.status}</Badge>
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">{project.title}</h3>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Owner</dt>
          <dd className="mt-1 font-medium">{project.owner}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Due date</dt>
          <dd className="mt-1 font-medium">{project.targetCompletion}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Technology pillar</dt>
          <dd className="mt-1 font-medium">{project.pillarName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Related recommendation</dt>
          <dd className="mt-1 font-medium">{project.relatedRecommendation}</dd>
        </div>
      </dl>
    </button>
  );
}

export function ProjectsWorkspaceSection() {
  const { demoProfile, openConnectedProject, isHighlighted } = useProductOverview();
  const projects = demoProfile.dashboard.projects;

  return (
    <section
      id="product-overview-projects"
      className="scroll-mt-36 border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Project Execution
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Turn strategy into measurable progress
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Every roadmap initiative becomes a managed project with owners, milestones, budget
              tracking, and clear business outcomes.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {projects.map((project, index) => (
            <OfferReveal key={project.id} delayMs={index * 50}>
              <ProjectCard
                project={project}
                highlighted={isHighlighted({ projectId: project.id })}
                onClick={(anchor) => {
                  trackProductOverviewProjectOpened(project.id);
                  openConnectedProject(project.id, "projects_workspace", anchor);
                }}
              />
            </OfferReveal>
          ))}
        </div>

        <OfferReveal delayMs={200}>
          <Card className="mt-10 border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Project Lifecycle Timeline</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Every initiative follows a consistent path from planning through validation and completion.
              </p>
            </CardHeader>
            <CardContent>
              <ProjectMilestoneTimeline phases={STANDARD_TIMELINE} />
            </CardContent>
          </Card>
        </OfferReveal>
      </div>
    </section>
  );
}
