"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FolderKanban, Lightbulb, Map } from "lucide-react";
import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPageShell,
  ClientSectionHeader,
  ClientStatusBadge,
} from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import {
  CLIENT_EQUAL_CARD_GRID,
  CLIENT_INTERACTIVE_TILE,
  CLIENT_METRIC_VALUE,
  CLIENT_SURFACE_CARD_INDUSTRIAL,
} from "@/lib/client-ui/tokens";
import type {
  CustomerProjectViewFilter,
  CustomerProjectsExperienceDto,
} from "@/lib/customer-portal/projects-dto";
import { cn } from "@/lib/utils";

type CustomerProjectsExperienceProps = {
  experience: CustomerProjectsExperienceDto;
};

const VIEW_OPTIONS: Array<{ id: CustomerProjectViewFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "planned", label: "Planned" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

export function CustomerProjectsExperience({ experience }: CustomerProjectsExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { summary, projects, view } = experience;
  const totalVisible =
    summary.plannedCount + summary.activeCount + summary.completedCount;

  function setView(next: CustomerProjectViewFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("view");
    } else {
      params.set("view", next);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <ClientPageShell className="max-w-5xl space-y-8">
      <ClientPageHeader
        eyebrow="Delivery"
        title="Projects"
        description="Track technology improvement work Bobkat IT is delivering for your organization — status, timing, and related recommendations."
      />

      <section
        className={cn(CLIENT_SURFACE_CARD_INDUSTRIAL, "space-y-4 p-5 sm:p-6")}
        aria-label="Project summary"
      >
        <ClientSectionHeader
          eyebrow="At a glance"
          title="Delivery snapshot"
          description="Counts reflect your real projects. Progress percentages appear only after delivery tasks exist."
        />
        <div className={CLIENT_EQUAL_CARD_GRID}>
          <MetricWell label="Planned Projects" value={summary.plannedCount} />
          <MetricWell label="Active Projects" value={summary.activeCount} />
          <MetricWell label="Completed Projects" value={summary.completedCount} />
          <MetricWell
            label="Upcoming Target Dates"
            value={summary.upcomingTargetDateCount}
          />
        </div>
      </section>

      {totalVisible === 0 ? (
        <ClientEmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="When Bobkat IT turns improvement opportunities into delivery work, those projects appear here."
          nextStep="Review opportunities or your roadmap while planning begins."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={experience.opportunitiesHref}
                className={buttonClassName({})}
              >
                <Lightbulb className="mr-2 h-4 w-4" aria-hidden />
                Improvement opportunities
              </Link>
              <Link
                href={experience.roadmapHref}
                className={buttonClassName({ variant: "outline" })}
              >
                <Map className="mr-2 h-4 w-4" aria-hidden />
                Open Roadmap
              </Link>
            </div>
          }
        />
      ) : (
        <section className="space-y-4" aria-labelledby="projects-list-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <ClientSectionHeader
              eyebrow="Portfolio"
              title="Your projects"
              description="Filter by delivery stage. Cancelled work is hidden from this view."
            />
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Filter projects by status"
            >
              {VIEW_OPTIONS.map((option) => {
                const selected = view === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    className={buttonClassName({
                      variant: selected ? "default" : "outline",
                      size: "sm",
                    })}
                    onClick={() => setView(option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          <h2 id="projects-list-heading" className="sr-only">
            Project list
          </h2>

          {projects.length === 0 ? (
            <p className="rounded-sm border border-dashed border-border bg-muted/15 px-4 py-8 text-center text-sm text-muted-foreground">
              No projects match this filter. Try All, or review another status.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {projects.map((project) => (
                <li key={project.id} className="min-h-0">
                  <Link
                    href={project.href}
                    className={cn(
                      CLIENT_INTERACTIVE_TILE,
                      "h-full focus-visible:ring-offset-background",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{project.title}</p>
                      <ClientStatusBadge tone="muted">{project.statusLabel}</ClientStatusBadge>
                      <ClientStatusBadge tone="default">{project.priorityLabel}</ClientStatusBadge>
                    </div>
                    {project.descriptionPreview ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {project.descriptionPreview}
                      </p>
                    ) : null}
                    <dl className="mt-3 grid gap-1 text-xs text-muted-foreground">
                      {project.pillarName ? (
                        <div>
                          <dt className="inline font-medium text-foreground/80">Pillar: </dt>
                          <dd className="inline">{project.pillarName}</dd>
                        </div>
                      ) : null}
                      {project.startDateLabel ? (
                        <div>
                          <dt className="inline font-medium text-foreground/80">Start: </dt>
                          <dd className="inline">{project.startDateLabel}</dd>
                        </div>
                      ) : null}
                      {project.targetCompletionDateLabel ? (
                        <div>
                          <dt className="inline font-medium text-foreground/80">Target: </dt>
                          <dd className="inline">{project.targetCompletionDateLabel}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="inline font-medium text-foreground/80">Progress: </dt>
                        <dd className="inline">
                          {project.progressPercent !== null
                            ? `${project.progressPercent}%`
                            : `Status · ${project.statusLabel}`}
                        </dd>
                      </div>
                    </dl>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </ClientPageShell>
  );
}

function MetricWell({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex h-full flex-col rounded-sm border border-border/70 bg-muted/15 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-2 text-3xl font-semibold text-foreground", CLIENT_METRIC_VALUE)}>
        {value}
      </p>
    </div>
  );
}
