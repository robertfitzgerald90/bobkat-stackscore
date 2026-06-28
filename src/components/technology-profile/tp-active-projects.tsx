import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPriority } from "@/lib/display";
import { formatProjectStatus } from "@/lib/projects";
import type { ProfileProjectSummary } from "@/lib/technology-profile/types";

type TpActiveProjectsProps = {
  projects: ProfileProjectSummary[];
};

export function TpActiveProjects({ projects }: TpActiveProjectsProps) {
  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4" />
          Active Projects
        </CardTitle>
        <CardDescription>
          {projects.length > 0
            ? `${projects.length} in progress`
            : "Improvements currently being delivered"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.length === 0 ? (
          <TpEmptyState
            icon={FolderKanban}
            title="No active projects"
            message="Convert open recommendations into projects to track implementation and score impact."
            positive
          />
        ) : (
          projects.map((project) => (
            <div key={project.id} className="rounded-lg border border-border/60 p-4 text-sm">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="font-semibold">{project.title}</p>
                <Badge variant="secondary">{formatProjectStatus(project.status)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPriority(project.priority)}
                {project.estimatedImpactPoints !== null
                  ? ` · +${project.estimatedImpactPoints} pts`
                  : ""}
              </p>
              <Link
                href={`/projects?selected=${project.id}`}
                className={buttonClassName({
                  variant: "link",
                  size: "sm",
                  className: "mt-2 h-auto p-0",
                })}
              >
                Open project
              </Link>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
