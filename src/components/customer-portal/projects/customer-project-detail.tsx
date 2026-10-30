import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Circle,
  FileText,
  Flag,
  Lightbulb,
  Loader2,
  Map,
} from "lucide-react";
import {
  ClientPageHeader,
  ClientPageShell,
  ClientSectionHeader,
  ClientStatusBadge,
} from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import {
  CLIENT_METRIC_VALUE,
  CLIENT_PROGRESS_FILL,
  CLIENT_PROGRESS_TRACK,
  CLIENT_SURFACE_CARD,
  CLIENT_SURFACE_CARD_INDUSTRIAL,
} from "@/lib/client-ui/tokens";
import type {
  CustomerProjectActivityDto,
  CustomerProjectDetailDto,
  CustomerProjectMilestoneDto,
  CustomerProjectTaskDto,
  CustomerProjectTaskGroupsDto,
  CustomerPublishedProjectUpdateDto,
} from "@/lib/customer-portal/projects-dto";
import { cn } from "@/lib/utils";

type CustomerProjectDetailProps = {
  detail: CustomerProjectDetailDto;
};

export function CustomerProjectDetail({ detail }: CustomerProjectDetailProps) {
  const hasTasks = detail.tasks.length > 0;
  const hasMilestones = detail.milestones.length > 0;
  const progressLabel =
    detail.progressPercent !== null
      ? `${detail.progressPercent}%`
      : "Status-based";

  return (
    <ClientPageShell className="max-w-4xl space-y-8">
      <ClientPageHeader
        eyebrow="Project workspace"
        title={detail.title}
        description="What Bobkat IT is delivering, what is done, and what comes next."
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
        className={cn(CLIENT_SURFACE_CARD_INDUSTRIAL, "space-y-5 p-5 sm:p-6")}
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

        <div>
          <h2 id="project-overview-heading" className="text-xl font-bold text-foreground">
            Objective
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {detail.description ??
              "Bobkat IT is delivering this improvement as a tracked project for your organization."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricWell
            label="Progress"
            value={progressLabel}
            hint={
              detail.progressPercent !== null
                ? `${detail.tasksCompleted} of ${detail.tasksTotal} tasks complete`
                : `Tracked by status · ${detail.statusLabel}`
            }
          />
          <MetricWell
            label="Tasks complete"
            value={
              detail.tasksTotal > 0
                ? `${detail.tasksCompleted}/${detail.tasksTotal}`
                : "—"
            }
            hint={detail.tasksTotal > 0 ? "From delivery checklist" : "No tasks yet"}
          />
          <MetricWell
            label="Start"
            value={detail.startDateLabel ?? "Not set"}
          />
          <MetricWell
            label="Target completion"
            value={detail.targetCompletionDateLabel ?? "Not set"}
          />
        </div>

        {detail.progressPercent !== null ? (
          <div
            className={CLIENT_PROGRESS_TRACK}
            role="progressbar"
            aria-valuenow={detail.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Task progress"
          >
            <div
              className={CLIENT_PROGRESS_FILL}
              style={{
                width: `${Math.max(0, Math.min(100, detail.progressPercent))}%`,
              }}
            />
          </div>
        ) : null}

        {detail.nextMilestone ? (
          <div className="flex flex-wrap items-start gap-3 rounded-sm border border-primary/25 bg-primary/5 px-3 py-3">
            <Flag className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 space-y-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
                Next milestone
              </p>
              <p className="text-sm font-medium text-foreground">{detail.nextMilestone.title}</p>
              <p className="text-xs text-muted-foreground">
                {detail.nextMilestone.targetDateLabel
                  ? `Target ${detail.nextMilestone.targetDateLabel}`
                  : "Target date not set"}
                {detail.nextMilestone.isOverdue ? " · Overdue" : ""}
              </p>
            </div>
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

        {detail.completedAtLabel ? (
          <p className="text-sm text-muted-foreground">
            Completed {detail.completedAtLabel}
          </p>
        ) : null}

        {detail.completionReportHref ? (
          <div>
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

      <PublishedUpdatesFeed updates={detail.publishedUpdates} />

      <TaskBoard groups={detail.taskGroups} hasTasks={hasTasks} />

      <MilestoneTimeline milestones={detail.milestones} hasMilestones={hasMilestones} />

      {detail.recommendations.length > 0 || detail.roadmapInitiatives.length > 0 ? (
        <RelatedImprovements
          recommendations={detail.recommendations}
          initiatives={detail.roadmapInitiatives}
        />
      ) : null}

      {detail.activity.length > 0 ? (
        <ActivityFeed activity={detail.activity} />
      ) : null}
    </ClientPageShell>
  );
}

function MetricWell({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-sm border border-border/60 bg-muted/10 px-3 py-2.5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-1 text-lg font-semibold text-foreground", CLIENT_METRIC_VALUE)}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function TaskBoard({
  groups,
  hasTasks,
}: {
  groups: CustomerProjectTaskGroupsDto;
  hasTasks: boolean;
}) {
  return (
    <section className="space-y-4" aria-labelledby="project-tasks-heading">
      <ClientSectionHeader
        eyebrow="Delivery"
        title="Tasks"
        description={
          hasTasks
            ? "Every customer-visible delivery step — in progress, up next, and completed."
            : "Task checklist will appear when Bobkat IT adds delivery steps."
        }
      />
      <h2 id="project-tasks-heading" className="sr-only">
        Project tasks
      </h2>

      {!hasTasks ? (
        <p className="rounded-sm border border-dashed border-border bg-muted/15 px-4 py-5 text-sm text-muted-foreground">
          No tasks yet. Progress stays tied to project status until tasks are added.
        </p>
      ) : (
        <div className="space-y-5">
          <TaskGroup
            title="In Progress"
            emptyLabel="Nothing in progress right now."
            tasks={groups.inProgress}
          />
          <TaskGroup
            title="Up Next"
            emptyLabel="No upcoming tasks queued."
            tasks={groups.upNext}
          />
          <TaskGroup
            title="Completed"
            emptyLabel="No completed tasks yet."
            tasks={groups.completed}
          />
        </div>
      )}
    </section>
  );
}

function TaskGroup({
  title,
  emptyLabel,
  tasks,
}: {
  title: string;
  emptyLabel: string;
  tasks: CustomerProjectTaskDto[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TaskRow({ task }: { task: CustomerProjectTaskDto }) {
  const Icon =
    task.status === "completed"
      ? CheckCircle2
      : task.status === "in_progress"
        ? Loader2
        : Circle;
  const hasDetails = Boolean(
    task.description || task.dueDateLabel || task.completedAtLabel,
  );

  return (
    <li>
      <details
        className={cn(
          CLIENT_SURFACE_CARD,
          "group rounded-sm border bg-card open:border-primary/40",
        )}
      >
        <summary className="flex cursor-pointer list-none items-start gap-3 p-4 marker:content-none [&::-webkit-details-marker]:hidden">
          <Icon
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0",
              task.status === "completed" ? "text-primary" : "text-muted-foreground",
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{task.title}</p>
              <ClientStatusBadge tone="muted">{task.statusLabel}</ClientStatusBadge>
            </div>
            {!hasDetails ? (
              <p className="text-xs text-muted-foreground">No additional details</p>
            ) : null}
          </div>
          {hasDetails ? (
            <ChevronDown
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden
            />
          ) : null}
        </summary>
        {hasDetails ? (
          <div className="space-y-2 border-t border-border/50 px-4 pb-4 pt-3 pl-11">
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
        ) : null}
      </details>
    </li>
  );
}

function MilestoneTimeline({
  milestones,
  hasMilestones,
}: {
  milestones: CustomerProjectMilestoneDto[];
  hasMilestones: boolean;
}) {
  return (
    <section className="space-y-3" aria-labelledby="project-milestones-heading">
      <ClientSectionHeader
        eyebrow="Checkpoints"
        title="Milestone timeline"
        description={
          hasMilestones
            ? "Major delivery checkpoints and target dates."
            : "Milestones will appear when Bobkat IT configures them."
        }
      />
      <h2 id="project-milestones-heading" className="sr-only">
        Milestone timeline
      </h2>

      {!hasMilestones ? (
        <p className="rounded-sm border border-dashed border-border bg-muted/15 px-4 py-5 text-sm text-muted-foreground">
          No milestones yet.
        </p>
      ) : (
        <ol className="relative space-y-0 border-l border-primary/30 ml-2 pl-5">
          {milestones.map((milestone) => (
            <li key={milestone.id} className="relative pb-5 last:pb-0">
              <span
                className={cn(
                  "absolute -left-[1.45rem] top-1.5 h-2.5 w-2.5 rounded-full border-2",
                  milestone.isComplete
                    ? "border-primary bg-primary"
                    : milestone.isOverdue
                      ? "border-amber-500 bg-amber-500/30"
                      : "border-muted-foreground/50 bg-background",
                )}
                aria-hidden
              />
              <div
                className={cn(
                  CLIENT_SURFACE_CARD,
                  "rounded-sm border bg-card p-4",
                  milestone.isOverdue && !milestone.isComplete
                    ? "border-amber-500/40"
                    : null,
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{milestone.title}</p>
                  <ClientStatusBadge
                    tone={
                      milestone.isComplete
                        ? "default"
                        : milestone.isOverdue
                          ? "warning"
                          : "muted"
                    }
                  >
                    {milestone.isComplete
                      ? "Complete"
                      : milestone.isOverdue
                        ? "Overdue"
                        : "Open"}
                  </ClientStatusBadge>
                </div>
                {milestone.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {milestone.description}
                  </p>
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
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function RelatedImprovements({
  recommendations,
  initiatives,
}: {
  recommendations: CustomerProjectDetailDto["recommendations"];
  initiatives: CustomerProjectDetailDto["roadmapInitiatives"];
}) {
  return (
    <section className="space-y-4" aria-labelledby="project-related-heading">
      <ClientSectionHeader
        eyebrow="Related"
        title="Linked improvements"
        description="Assessment opportunities and roadmap initiatives connected to this project."
      />
      <h2 id="project-related-heading" className="sr-only">
        Related improvements
      </h2>

      {recommendations.length > 0 ? (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5 text-primary" aria-hidden />
            Recommendations
          </p>
          <ul className="space-y-2">
            {recommendations.map((recommendation) => (
              <li key={recommendation.id}>
                <Link
                  href={recommendation.href}
                  className={cn(
                    CLIENT_SURFACE_CARD,
                    "flex flex-col gap-1 rounded-sm border bg-card p-4 transition-colors hover:border-primary",
                  )}
                >
                  <span className="font-medium text-foreground">{recommendation.title}</span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {recommendation.statusLabel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {initiatives.length > 0 ? (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Map className="h-3.5 w-3.5 text-primary" aria-hidden />
            Roadmap initiatives
          </p>
          <ul className="space-y-2">
            {initiatives.map((initiative) => (
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
        </div>
      ) : null}
    </section>
  );
}

function PublishedUpdatesFeed({
  updates,
}: {
  updates: CustomerPublishedProjectUpdateDto[];
}) {
  if (updates.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby="project-updates-heading">
      <ClientSectionHeader
        eyebrow="Communications"
        title="Updates"
        description="Published project updates from Bobkat IT."
      />
      <h2 id="project-updates-heading" className="sr-only">
        Project updates
      </h2>
      <ol className="space-y-3">
        {updates.map((update) => (
          <li
            key={update.id}
            className={cn(CLIENT_SURFACE_CARD, "space-y-3 rounded-sm border bg-card p-4")}
          >
            <div className="flex flex-wrap items-center gap-2">
              <ClientStatusBadge tone="default">Published</ClientStatusBadge>
              <p className="text-xs text-muted-foreground">{update.publishedAtLabel}</p>
            </div>
            {update.subject ? (
              <p className="font-medium text-foreground">{update.subject}</p>
            ) : null}
            {update.projectStatusLabel || update.progressPercent !== null ? (
              <p className="text-sm text-muted-foreground">
                {update.projectStatusLabel
                  ? `Status · ${update.projectStatusLabel}`
                  : null}
                {update.projectStatusLabel && update.progressPercent !== null
                  ? " · "
                  : null}
                {update.progressPercent !== null
                  ? `${update.progressPercent}% complete`
                  : null}
              </p>
            ) : null}
            {update.workCompleted.length > 0 ? (
              <UpdateList
                label="Work completed"
                items={update.workCompleted.map((item) => ({
                  title: item.title,
                  meta: item.completedAtLabel,
                }))}
              />
            ) : null}
            {update.inProgress.length > 0 ? (
              <UpdateList
                label="Currently in progress"
                items={update.inProgress.map((item) => ({
                  title: item.title,
                  meta: item.targetOrDueLabel,
                }))}
              />
            ) : null}
            {update.comingNext.length > 0 || update.nextMilestoneTitle ? (
              <div className="space-y-1.5">
                <UpdateList
                  label="Coming next"
                  items={update.comingNext.map((item) => ({
                    title: item.title,
                    meta: item.targetOrDueLabel,
                  }))}
                />
                {update.nextMilestoneTitle ? (
                  <p className="text-sm text-foreground/90">
                    Next milestone · {update.nextMilestoneTitle}
                    {update.nextMilestoneTargetLabel
                      ? ` (target ${update.nextMilestoneTargetLabel})`
                      : ""}
                  </p>
                ) : null}
              </div>
            ) : null}
            {update.staffMessage ? (
              <div className="space-y-1 border-t border-border/60 pt-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  Message
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {update.staffMessage}
                </p>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function UpdateList({
  label,
  items,
}: {
  label: string;
  items: Array<{ title: string; meta: string | null }>;
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="text-sm text-foreground/90">
            {item.title}
            {item.meta ? (
              <span className="text-muted-foreground"> · {item.meta}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivityFeed({ activity }: { activity: CustomerProjectActivityDto[] }) {
  return (
    <section className="space-y-3" aria-labelledby="project-activity-heading">
      <ClientSectionHeader
        eyebrow="History"
        title="Activity"
        description="Customer-visible delivery updates for this project."
      />
      <h2 id="project-activity-heading" className="sr-only">
        Project activity
      </h2>
      <ol className="space-y-2">
        {activity.map((event) => (
          <li
            key={event.id}
            className={cn(CLIENT_SURFACE_CARD, "rounded-sm border bg-card p-4")}
          >
            <div className="flex flex-wrap items-center gap-2">
              <ClientStatusBadge tone="muted">{event.kindLabel}</ClientStatusBadge>
              <p className="text-xs text-muted-foreground">{event.occurredAtLabel}</p>
            </div>
            <p className="mt-1.5 font-medium text-foreground">{event.title}</p>
            {event.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
