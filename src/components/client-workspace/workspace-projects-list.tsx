import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { clientProjectsPath } from "@/lib/clients/paths";
import { formatPriority } from "@/lib/display";
import { formatProjectStatus } from "@/lib/projects";
import type { ProfileProjectSummary } from "@/lib/technology-profile/types";

type WorkspaceProjectsListProps = {
  clientId: string;
  projects: ProfileProjectSummary[];
};

export function WorkspaceProjectsList({ clientId, projects }: WorkspaceProjectsListProps) {
  return (
    <Card className="stat-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="h-4 w-4" />
              Projects
            </CardTitle>
            <CardDescription>
              Open and completed improvement work for this client
            </CardDescription>
          </div>
          <Link
            href={clientProjectsPath(clientId)}
            className={buttonClassName({
              variant: "outline",
              size: "sm",
              className: "w-full shrink-0 sm:w-auto",
            })}
          >
            Open Project Register
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {projects.length === 0 ? (
          <TpEmptyState
            icon={FolderKanban}
            title="No projects yet"
            message="Convert recommendations into projects to track delivery and score impact."
            positive
          />
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="rounded-lg border border-border/60 px-3 py-2.5 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{project.title}</p>
                <Badge variant="secondary">{formatProjectStatus(project.status)}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatPriority(project.priority)}
                {project.estimatedImpactPoints !== null
                  ? ` · +${project.estimatedImpactPoints} pts`
                  : ""}
                {project.recommendationTitle
                  ? ` · ${project.recommendationTitle}`
                  : ""}
              </p>
              <Link
                href={`${clientProjectsPath(clientId)}&selected=${project.id}`}
                className={buttonClassName({
                  variant: "link",
                  size: "sm",
                  className: "mt-1 h-auto p-0",
                })}
              >
                Open in Project Register
              </Link>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
