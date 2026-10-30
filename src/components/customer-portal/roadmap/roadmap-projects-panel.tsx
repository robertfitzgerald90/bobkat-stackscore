import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { ClientEmptyState, ClientSectionHeader, ClientStatusBadge } from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import type { CustomerRoadmapProjectSummary } from "@/lib/customer-portal/roadmap-dto";
import { cn } from "@/lib/utils";

type RoadmapProjectsPanelProps = {
  projects: CustomerRoadmapProjectSummary[];
  projectsHref: string;
};

export function RoadmapProjectsPanel({ projects, projectsHref }: RoadmapProjectsPanelProps) {
  return (
    <section className="space-y-4" aria-labelledby="roadmap-projects-heading">
      <ClientSectionHeader
        eyebrow="Delivery"
        title="Projects"
        description="Existing customer-visible projects linked from recommendations — not invented from initiatives."
        actions={
          <Link href={projectsHref} className={buttonClassName({ variant: "outline", size: "sm" })}>
            Open projects
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
          </Link>
        }
      />
      <h2 id="roadmap-projects-heading" className="sr-only">
        Projects
      </h2>

      {projects.length === 0 ? (
        <ClientEmptyState
          icon={FolderKanban}
          title="No projects linked yet"
          description="When recommendations become tracked delivery work, those projects appear here and on the Projects page."
          variant="default"
        />
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={project.href}
                className={cn(
                  CLIENT_SURFACE_CARD,
                  "flex flex-col gap-2 rounded-sm border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between motion-reduce:transition-none",
                )}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{project.title}</p>
                    <ClientStatusBadge tone="muted">{project.statusLabel}</ClientStatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {project.priorityLabel}
                    {project.recommendationTitle
                      ? ` · ${project.recommendationTitle}`
                      : " · No linked recommendation title"}
                  </p>
                </div>
                <span className="inline-flex items-center text-xs font-medium text-primary">
                  Open
                  <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
