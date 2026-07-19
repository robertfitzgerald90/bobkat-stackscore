"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DemoProject } from "@/lib/product-overview/types";

type ProjectSummaryCardProps = {
  projects: DemoProject[];
  compact?: boolean;
  onProjectClick?: (projectId: string) => void;
};

export function ProjectSummaryCard({
  projects,
  compact = false,
  onProjectClick,
}: ProjectSummaryCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className={cn("pb-3", compact && "px-4 pt-4")}>
        <CardTitle className={cn("text-base", compact && "text-sm")}>Active Projects</CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "px-4 pb-4")}>
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onProjectClick?.(project.id)}
            className="w-full rounded-xl border border-border/70 p-4 text-left transition-colors hover:border-primary/30 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{project.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">Owner: {project.owner}</p>
              </div>
              <Badge variant="outline">{project.status}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{project.progress}% complete</span>
              <span>Target: {project.targetCompletion}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
