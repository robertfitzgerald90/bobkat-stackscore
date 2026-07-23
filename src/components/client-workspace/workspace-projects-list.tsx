import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { ClientEmptyState } from "@/components/client-ui";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CLIENT_INTERACTIVE_TILE, CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { clientProjectsPath } from "@/lib/clients/paths";
import { formatPriority } from "@/lib/display";
import { formatProjectStatus } from "@/lib/projects";
import type { ProfileProjectSummary } from "@/lib/technology-profile/types";
import { cn } from "@/lib/utils";

type WorkspaceProjectsListProps = {
  clientId: string;
  projects: ProfileProjectSummary[];
};

export function WorkspaceProjectsList({ clientId, projects }: WorkspaceProjectsListProps) {
  return (
    <Card className={CLIENT_SURFACE_CARD}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="h-4 w-4 text-primary" />
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
          <ClientEmptyState
            icon={FolderKanban}
            title="Your technology roadmap is waiting"
            description="Strategic initiatives appear here once recommendations become tracked delivery work with measurable business impact."
            nextStep="Complete an assessment to receive your first strategic recommendations."
            positive
            className="border-0 shadow-none"
          />
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={cn(CLIENT_INTERACTIVE_TILE, "px-3 py-2.5 text-sm")}
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
