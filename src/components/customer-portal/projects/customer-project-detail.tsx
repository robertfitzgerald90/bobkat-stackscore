import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, FileText, Loader2 } from "lucide-react";
import {
  ClientPageHeader,
  ClientPageShell,
  ClientSectionHeader,
  ClientStatusBadge,
} from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import { CLIENT_SURFACE_CARD, CLIENT_SURFACE_CARD_INDUSTRIAL } from "@/lib/client-ui/tokens";
import type {
  CustomerProjectDetailDto,
  CustomerProjectMilestoneDto,
  CustomerProjectTaskDto,
} from "@/lib/customer-portal/projects-dto";
import { cn } from "@/lib/utils";

type CustomerProjectDetailProps = {
  detail: CustomerProjectDetailDto;
};

export function CustomerProjectDetail({ detail }: CustomerProjectDetailProps) {
  const hasTasks = detail.tasks.length > 0;
  const hasMilestones = detail.milestones.length > 0;

  return (
    <ClientPageShell className="max-w-4xl space-y-8">
      <ClientPageHeader
        eyebrow="Project workspace"
        title={detail.title}
        description="Delivery detail for this improvement project — status, progress, tasks, and milestones managed by Bobkat IT."
        actions={
          <Link
            href={detail.listHref}
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            All projects
          </Link>
        }
      />

      <section
        className={cn(CLIENT_SURFACE_CARD_INDUSTRIAL, "space-y-4 p-5 sm:p-6")}
        aria-labelledby="project-overview-heading"
      >
        <div className="flex flex-wrap items-center gap-2">
          <ClientStatusBadge tone="muted">{detail.statusLabel}</ClientStatusBadge>
          <ClientStatusBadge tone="default">{detail.priorityLabel}</ClientStatusBadge>
          {detail.pillarName ? (
            detail.pillarHref ? (
              <Link
                href={detail.pillarHref}
                className="text-xs font-medium text-primary hover:underline"
              >
                {detail.pillarName}
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground">{detail.pillarName}</span>
            )
          ) : null}
        </div>
        <h2 id="project-overview-heading" className="text-xl font-bold text-foreground">
          Objective
        </h2>
        <p className="text-sm leading-relaxed text-foreground/90">
          {detail.description ??
            "Bobkat IT is delivering this improvement as a tracked project for your organization."}
        </p>

        <dl className="grid gap-3 sm:grid-cols-2">
          <MetaItem label="Start date" value={detail.startDateLabel ?? "Not set"} />
          <MetaItem
            label="Target completion"
            value={detail.targetCompletionDateLabel ?? "Not set"}
          />
          {detail.completedAtLabel ? (
            <MetaItem label="Completed" value={detail.completedAtLabel} />
          ) : null}
          <MetaItem
            label="Progress"
            value={
              detail.progressPercent !== null
                ? `${detail.progressPercent}% (${detail.tasksCompleted}/${detail.tasksTotal} tasks)`
                : `Tracked by status · ${detail.statusLabel}`
            }
          />
        </dl>

        {detail.progressPercent !== null ? (
          <div
            className="h-2 overflow-hidden rounded-sm bg-muted"
            role="progressbar"
            aria-valuenow={detail.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Task progress"
          >
            <div
              className="h-full bg-primary transition-[width]"
              style={{
                width: `${Math.max(0, Math.min(100, detail.progressPercent))}%`,
              }}
            />
          </div>
        ) : null}

        {detail.expectedOutcome ? (
          <div className="space-y-1.5 border-t border-border/60 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
              Expected outcome
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {detail.expectedOutcome}
            </p>
          </div>
        ) : null}

        {detail.completionReportHref ? (
          <div className="pt-2">
            <Link
              href={detail.completionReportHref}
              className={buttonClassName({ size: "sm" })}
            >
              <FileText className="mr-2 h-4 w-4" aria-hidden />
              View completion report
            </Link>
          </div>
        ) : null}
      </section>

      <section className="space-y-3" aria-labelledby="project-tasks-heading">
        <ClientSectionHeader
          eyebrow="Delivery"
          title="Tasks"
          description={
            hasTasks
              ? "Customer-visible delivery steps for this project."
              : "Task checklist will appear when Bobkat IT adds delivery steps."
          }
        />
        <h2 id="project-tasks-heading" className="sr-only">
          Project tasks
        </h2>
        {hasTasks ? (
          <ul className="space-y-2">
            {detail.tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        ) : (
          <p className="rounded-sm border border-dashed border-border bg-muted/15 px-4 py-6 text-sm text-muted-foreground">
            No tasks yet. Progress stays tied to project status until tasks are added.
          </p>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="project-milestones-heading">
        <ClientSectionHeader
          eyebrow="Checkpoints"
          title="Milestones"
          description={
            hasMilestones
              ? "Target checkpoints for this delivery."
              : "Milestones will appear when Bobkat IT configures them."
          }
        />
        <h2 id="project-milestones-heading" className="sr-only">
          Project milestones
        </h2>
        {hasMilestones ? (
          <ul className="space-y-2">
            {detail.milestones.map((milestone) => (
              <MilestoneRow key={milestone.id} milestone={milestone} />
            ))}
          </ul>
        ) : (
          <p className="rounded-sm border border-dashed border-border bg-muted/15 px-4 py-6 text-sm text-muted-foreground">
            No milestones yet.
          </p>
        )}
      </section>

      {detail.recommendations.length > 0 ? (
        <section className="space-y-3" aria-labelledby="project-recs-heading">
          <ClientSectionHeader
            eyebrow="Related"
            title="Recommendations"
            description="Assessment opportunities linked to this project."
          />
          <h2 id="project-recs-heading" className="sr-only">
            Related recommendations
          </h2>
          <ul className="space-y-2">
            {detail.recommendations.map((recommendation) => (
              <li key={recommendation.id}>
                <Link
                  href={recommendation.href}
                  className={cn(
                    CLIENT_SURFACE_CARD,
                    "flex flex-col gap-1 rounded-sm border bg-card p-4 transition-colors hover:border-primary",
                  )}
                >
                  <span className="font-medium text-foreground">{recommendation.title}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {recommendation.statusLabel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {detail.roadmapInitiatives.length > 0 ? (
        <section className="space-y-3" aria-labelledby="project-initiatives-heading">
          <ClientSectionHeader
            eyebrow="Roadmap"
            title="Related initiatives"
            description="Roadmap initiatives that share this project's recommendation."
          />
          <h2 id="project-initiatives-heading" className="sr-only">
            Related roadmap initiatives
          </h2>
          <ul className="space-y-2">
            {detail.roadmapInitiatives.map((initiative) => (
              <li key={initiative.id}>
                <Link
                  href={initiative.href}
                  className={cn(
                    CLIENT_SURFACE_CARD,
                    "flex flex-col gap-1 rounded-sm border bg-card p-4 transition-colors hover:border-primary",
                  )}
                >
                  <span className="font-medium text-foreground">{initiative.title}</span>
                  <span className="text-xs text-muted-foreground">
                    Phase · {initiative.phaseName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {detail.activity.length > 0 ? (
        <section className="space-y-3" aria-labelledby="project-activity-heading">
          <ClientSectionHeader
            eyebrow="History"
            title="Activity"
            description="Customer-visible updates for this project."
          />
          <h2 id="project-activity-heading" className="sr-only">
            Project activity
          </h2>
          <ol className="space-y-3">
            {detail.activity.map((event) => (
              <li
                key={event.id}
                className={cn(CLIENT_SURFACE_CARD, "rounded-sm border bg-card p-4")}
              >
                <p className="text-xs text-muted-foreground">{event.occurredAtLabel}</p>
                <p className="mt-1 font-medium text-foreground">{event.title}</p>
                {event.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {detail.showUpdatesPlaceholder ? (
        <section
          className="rounded-sm border border-dashed border-border/80 bg-muted/10 px-4 py-3"
          aria-label="Upcoming project capabilities"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Coming next
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Project updates — staff-initiated notifications will appear here in a later release.
          </p>
        </section>
      ) : null}
    </ClientPageShell>
  );
}

function TaskRow({ task }: { task: CustomerProjectTaskDto }) {
  const Icon =
    task.status === "completed"
      ? CheckCircle2
      : task.status === "in_progress"
        ? Loader2
        : Circle;

  return (
    <li className={cn(CLIENT_SURFACE_CARD, "flex gap-3 rounded-sm border bg-card p-4")}>
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          task.status === "completed"
            ? "text-primary"
            : "text-muted-foreground",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">{task.title}</p>
          <ClientStatusBadge tone="muted">{task.statusLabel}</ClientStatusBadge>
        </div>
        {task.description ? (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        ) : null}
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {task.dueDateLabel ? (
            <div>
              <dt className="inline">Due: </dt>
              <dd className="inline">{task.dueDateLabel}</dd>
            </div>
          ) : null}
          {task.completedAtLabel ? (
            <div>
              <dt className="inline">Completed: </dt>
              <dd className="inline">{task.completedAtLabel}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </li>
  );
}

function MilestoneRow({ milestone }: { milestone: CustomerProjectMilestoneDto }) {
  return (
    <li className={cn(CLIENT_SURFACE_CARD, "rounded-sm border bg-card p-4")}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium text-foreground">{milestone.title}</p>
        <ClientStatusBadge tone={milestone.isComplete ? "default" : "muted"}>
          {milestone.isComplete ? "Complete" : "Open"}
        </ClientStatusBadge>
      </div>
      {milestone.description ? (
        <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
      ) : null}
      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {milestone.targetDateLabel ? (
          <div>
            <dt className="inline">Target: </dt>
            <dd className="inline">{milestone.targetDateLabel}</dd>
          </div>
        ) : null}
        {milestone.completedAtLabel ? (
          <div>
            <dt className="inline">Completed: </dt>
            <dd className="inline">{milestone.completedAtLabel}</dd>
          </div>
        ) : null}
      </dl>
    </li>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border/60 bg-muted/10 px-3 py-2">
      <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
