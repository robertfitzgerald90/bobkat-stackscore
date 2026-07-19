"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CLIENT_INTERACTIVE_TILE,
  CLIENT_PROGRESS_FILL,
  CLIENT_PROGRESS_TRACK,
  CLIENT_SURFACE_CARD,
} from "@/lib/client-ui/tokens";
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
    <Card className={CLIENT_SURFACE_CARD}>
      <CardHeader className={cn("pb-3", compact && "px-4 pt-4")}>
        <CardTitle className={cn("text-base", compact && "text-sm")}>Active Projects</CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "px-4 pb-4")}>
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onProjectClick?.(project.id)}
            className={cn(CLIENT_INTERACTIVE_TILE, "w-full p-4 text-left")}
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
            <div className={cn("mt-3", CLIENT_PROGRESS_TRACK)}>
              <div
                className={CLIENT_PROGRESS_FILL}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
