import Link from "next/link";
import { CheckCircle2, FolderKanban } from "lucide-react";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/display";
import type { ProfileProjectSummary } from "@/lib/technology-profile/types";

type TpRecentProgressProps = {
  clientId: string;
  projects: ProfileProjectSummary[];
};

export function TpRecentProgress({ clientId, projects }: TpRecentProgressProps) {
  return (
    <Card className="stat-card h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Recent Progress
        </CardTitle>
        <CardDescription>Completed improvements delivering profile impact</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.length === 0 ? (
          <TpEmptyState
            icon={CheckCircle2}
            title="No completed projects"
            message="When improvement projects finish, expected and actual StackScore impact will appear here."
            actionLabel="View projects"
            actionHref="/projects"
          />
        ) : (
          projects.map((project) => (
            <div key={project.id} className="rounded-lg border border-border/60 p-4 text-sm">
              <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                <p className="font-semibold">{project.title}</p>
                {project.completedAt ? (
                  <span className="text-xs text-muted-foreground">
                    {formatDisplayDate(project.completedAt)}
                  </span>
                ) : null}
              </div>
              {project.recommendationTitle ? (
                <p className="mb-2 text-xs text-muted-foreground">
                  From: {project.recommendationTitle}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {project.estimatedImpactPoints !== null ? (
                  <span>Expected: +{project.estimatedImpactPoints} pts</span>
                ) : null}
                {project.actualImpactPoints !== null ? (
                  <span className="font-medium text-foreground">
                    Actual: +{project.actualImpactPoints} pts
                  </span>
                ) : null}
              </div>
              <Link
                href={`/clients/${clientId}/projects/${project.id}/completion-report`}
                className={buttonClassName({
                  variant: "link",
                  size: "sm",
                  className: "mt-2 h-auto p-0",
                })}
              >
                View completion report
              </Link>
              <Link
                href={`/projects?selected=${project.id}`}
                className={buttonClassName({
                  variant: "link",
                  size: "sm",
                  className: "mt-1 block h-auto p-0 text-muted-foreground",
                })}
              >
                <FolderKanban className="mr-1 inline h-3.5 w-3.5" />
                Open project
              </Link>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
