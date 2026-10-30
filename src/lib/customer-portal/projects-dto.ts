/**
 * SS-UX-012/014 — Pure customer Projects DTO builders (no Prisma / I/O).
 * Progress is task-derived only; never invents percentages or fabricated activity.
 */

import type { Priority, ProjectStatus, RecommendationStatus } from "@/generated/prisma/client";
import {
  clientExplorePillarPath,
  clientProjectDetailPath,
  clientRecommendationDetailPath,
  clientRecommendationsPath,
  clientRoadmapPhasePath,
  clientWorkspaceProjectsPath,
  clientWorkspaceRoadmapPath,
} from "@/lib/clients/paths";
import { formatDisplayDate, PRIORITY_LABELS } from "@/lib/display";
import { PROJECT_STATUS_LABELS } from "@/lib/projects";
import { getPillarDisplayForCategoryCode } from "@/lib/technology-maturity/pillars";

/** Planned — committed but not yet in delivery. */
export const CUSTOMER_PLANNED_PROJECT_STATUSES: readonly ProjectStatus[] = [
  "proposed",
  "approved",
];

/** Active — scheduled or in progress. */
export const CUSTOMER_ACTIVE_PROJECT_STATUSES: readonly ProjectStatus[] = [
  "scheduled",
  "in_progress",
];

/** Customer-visible project activity kinds (real events only). */
export const CUSTOMER_PROJECT_ACTIVITY_EVENT_TYPES = [
  "project_task_completed",
  "project_milestone_completed",
  "project_completed",
  "project_started",
  "project_status_changed",
  "project_customer_update_published",
  "projects_shared",
] as const;

export type CustomerProjectViewFilter = "all" | "planned" | "active" | "completed";

export type CustomerProjectCardDto = {
  id: string;
  title: string;
  status: ProjectStatus;
  statusLabel: string;
  priority: Priority;
  priorityLabel: string;
  descriptionPreview: string | null;
  startDateLabel: string | null;
  targetCompletionDateLabel: string | null;
  pillarName: string | null;
  pillarHref: string | null;
  /** null when the project has zero tasks — never invent a percent. */
  progressPercent: number | null;
  href: string;
};

export type CustomerProjectTaskDto = {
  id: string;
  title: string;
  description: string | null;
  status: "not_started" | "in_progress" | "completed";
  statusLabel: string;
  dueDateLabel: string | null;
  completedAtLabel: string | null;
  group: "in_progress" | "up_next" | "completed";
};

export type CustomerProjectTaskGroupsDto = {
  inProgress: CustomerProjectTaskDto[];
  upNext: CustomerProjectTaskDto[];
  completed: CustomerProjectTaskDto[];
};

export type CustomerProjectMilestoneDto = {
  id: string;
  title: string;
  description: string | null;
  targetDateLabel: string | null;
  completedAtLabel: string | null;
  isComplete: boolean;
  isOverdue: boolean;
};

export type CustomerProjectNextMilestoneDto = {
  id: string;
  title: string;
  targetDateLabel: string | null;
  isOverdue: boolean;
};

export type CustomerProjectsSummaryDto = {
  plannedCount: number;
  activeCount: number;
  completedCount: number;
  upcomingTargetDateCount: number;
};

export type CustomerProjectsExperienceDto = {
  clientId: string;
  companyName: string;
  summary: CustomerProjectsSummaryDto;
  view: CustomerProjectViewFilter;
  projects: CustomerProjectCardDto[];
  opportunitiesHref: string;
  roadmapHref: string;
};

export type CustomerProjectRecommendationDto = {
  id: string;
  title: string;
  status: RecommendationStatus;
  statusLabel: string;
  href: string;
};

export type CustomerProjectInitiativeDto = {
  id: string;
  title: string;
  phaseName: string;
  href: string;
};

export type CustomerProjectActivityDto = {
  id: string;
  title: string;
  description: string | null;
  occurredAtLabel: string;
  eventType: string;
  kindLabel: string;
};

export type CustomerProjectDetailDto = {
  clientId: string;
  companyName: string;
  id: string;
  title: string;
  status: ProjectStatus;
  statusLabel: string;
  priority: Priority;
  priorityLabel: string;
  description: string | null;
  expectedOutcome: string | null;
  startDateLabel: string | null;
  targetCompletionDateLabel: string | null;
  completedAtLabel: string | null;
  pillarName: string | null;
  pillarHref: string | null;
  progressPercent: number | null;
  tasksTotal: number;
  tasksCompleted: number;
  tasks: CustomerProjectTaskDto[];
  taskGroups: CustomerProjectTaskGroupsDto;
  milestones: CustomerProjectMilestoneDto[];
  nextMilestone: CustomerProjectNextMilestoneDto | null;
  recommendations: CustomerProjectRecommendationDto[];
  roadmapInitiatives: CustomerProjectInitiativeDto[];
  activity: CustomerProjectActivityDto[];
  publishedUpdates: CustomerPublishedProjectUpdateDto[];
  completionReportHref: string | null;
  listHref: string;
};

export type CustomerProjectRowInput = {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  startDate: Date | string | null;
  targetCompletionDate: Date | string | null;
  completedAt: Date | string | null;
  categoryCode: string;
  categoryName: string;
  recommendation: {
    id: string;
    title: string;
    status: RecommendationStatus;
    businessImpact: string | null;
    templateCode: string | null;
  } | null;
  /** Precomputed progress; null when no tasks. */
  progressPercent?: number | null;
};

export type CustomerProjectTaskInput = {
  id: string;
  title: string;
  description: string | null;
  status: "not_started" | "in_progress" | "completed";
  dueDate: Date | string | null;
  completedAt: Date | string | null;
};

export type CustomerProjectMilestoneInput = {
  id: string;
  title: string;
  description: string | null;
  targetDate: Date | string | null;
  completedAt: Date | string | null;
};

export type CustomerProjectActivityInput = {
  id: string;
  title: string;
  description: string | null;
  occurredAt: Date | string;
  eventType: string;
  category: string;
  sourceRecordType: string | null;
  sourceRecordId: string | null;
};

export type CustomerProjectInitiativeInput = {
  id: string;
  title: string;
  phaseId: string;
  phaseName: string;
};

const CARD_DESCRIPTION_MAX = 160;

const TASK_STATUS_LABEL: Record<CustomerProjectTaskInput["status"], string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Complete",
};

const ACTIVITY_KIND_LABEL: Record<string, string> = {
  project_task_completed: "Task completed",
  project_milestone_completed: "Milestone completed",
  project_completed: "Project completed",
  project_started: "Project started",
  project_status_changed: "Status changed",
  project_customer_update_published: "Update published",
  projects_shared: "Project update",
};

export type CustomerPublishedProjectUpdateDto = {
  id: string;
  publishedAtLabel: string;
  subject: string | null;
  projectStatusLabel: string | null;
  progressPercent: number | null;
  workCompleted: Array<{ title: string; completedAtLabel: string | null }>;
  inProgress: Array<{ title: string; targetOrDueLabel: string | null }>;
  comingNext: Array<{ title: string; targetOrDueLabel: string | null }>;
  nextMilestoneTitle: string | null;
  nextMilestoneTargetLabel: string | null;
  staffMessage: string | null;
};

export function normalizeCustomerProjectViewFilter(
  value: string | null | undefined,
): CustomerProjectViewFilter {
  if (value === "planned" || value === "active" || value === "completed" || value === "all") {
    return value;
  }
  return "all";
}

export function isCustomerVisibleProjectStatus(status: ProjectStatus): boolean {
  return status !== "cancelled";
}

export function projectMatchesCustomerView(
  status: ProjectStatus,
  view: CustomerProjectViewFilter,
): boolean {
  if (!isCustomerVisibleProjectStatus(status)) return false;
  if (view === "all") return true;
  if (view === "planned") return CUSTOMER_PLANNED_PROJECT_STATUSES.includes(status);
  if (view === "active") return CUSTOMER_ACTIVE_PROJECT_STATUSES.includes(status);
  return status === "completed";
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateLabel(value: Date | string | null | undefined): string | null {
  const date = toDate(value);
  return date ? formatDisplayDate(date) : null;
}

function startOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function priorityLabel(priority: Priority): string {
  return PRIORITY_LABELS[priority] ?? priority;
}

function statusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status] ?? status;
}

function truncatePreview(text: string | null | undefined): string | null {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) return null;
  if (trimmed.length <= CARD_DESCRIPTION_MAX) return trimmed;
  return `${trimmed.slice(0, CARD_DESCRIPTION_MAX - 1).trimEnd()}…`;
}

function pillarForCategory(clientId: string, categoryCode: string) {
  const display = getPillarDisplayForCategoryCode(categoryCode);
  if (!display) {
    return { pillarName: null as string | null, pillarHref: null as string | null };
  }

  return {
    pillarName: display.pillarName,
    pillarHref: clientExplorePillarPath(clientId, categoryCode),
  };
}

function countUpcomingTargetDates(
  rows: CustomerProjectRowInput[],
  now: Date,
): number {
  const today = startOfDay(now);

  return rows.filter((row) => {
    if (!isCustomerVisibleProjectStatus(row.status)) return false;
    if (row.status === "completed") return false;
    const target = toDate(row.targetCompletionDate);
    if (!target) return false;
    return target.getTime() >= today.getTime();
  }).length;
}

function taskGroupForStatus(
  status: CustomerProjectTaskInput["status"],
): CustomerProjectTaskDto["group"] {
  if (status === "completed") return "completed";
  if (status === "in_progress") return "in_progress";
  return "up_next";
}

export function groupCustomerProjectTasks(
  tasks: CustomerProjectTaskDto[],
): CustomerProjectTaskGroupsDto {
  return {
    inProgress: tasks.filter((task) => task.group === "in_progress"),
    upNext: tasks.filter((task) => task.group === "up_next"),
    completed: tasks.filter((task) => task.group === "completed"),
  };
}

export function isCustomerProjectActivityEvent(eventType: string): boolean {
  return (CUSTOMER_PROJECT_ACTIVITY_EVENT_TYPES as readonly string[]).includes(eventType);
}

export function buildCustomerProjectCard(
  clientId: string,
  row: CustomerProjectRowInput,
): CustomerProjectCardDto {
  const pillar = pillarForCategory(clientId, row.categoryCode);

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    statusLabel: statusLabel(row.status),
    priority: row.priority,
    priorityLabel: priorityLabel(row.priority),
    descriptionPreview: truncatePreview(row.description),
    startDateLabel: dateLabel(row.startDate),
    targetCompletionDateLabel: dateLabel(row.targetCompletionDate),
    pillarName: pillar.pillarName ?? row.categoryName,
    pillarHref: pillar.pillarHref,
    progressPercent: row.progressPercent ?? null,
    href: clientProjectDetailPath(clientId, row.id),
  };
}

export function buildCustomerProjectsSummary(
  rows: CustomerProjectRowInput[],
  now: Date = new Date(),
): CustomerProjectsSummaryDto {
  const visible = rows.filter((row) => isCustomerVisibleProjectStatus(row.status));

  return {
    plannedCount: visible.filter((row) =>
      CUSTOMER_PLANNED_PROJECT_STATUSES.includes(row.status),
    ).length,
    activeCount: visible.filter((row) =>
      CUSTOMER_ACTIVE_PROJECT_STATUSES.includes(row.status),
    ).length,
    completedCount: visible.filter((row) => row.status === "completed").length,
    upcomingTargetDateCount: countUpcomingTargetDates(rows, now),
  };
}

export function buildCustomerProjectsExperience(input: {
  clientId: string;
  companyName: string;
  rows: CustomerProjectRowInput[];
  view?: CustomerProjectViewFilter;
  now?: Date;
}): CustomerProjectsExperienceDto {
  const view = input.view ?? "all";
  const summary = buildCustomerProjectsSummary(input.rows, input.now ?? new Date());
  const projects = input.rows
    .filter((row) => projectMatchesCustomerView(row.status, view))
    .map((row) => buildCustomerProjectCard(input.clientId, row));

  return {
    clientId: input.clientId,
    companyName: input.companyName,
    summary,
    view,
    projects,
    opportunitiesHref: clientRecommendationsPath(input.clientId),
    roadmapHref: clientWorkspaceRoadmapPath(input.clientId),
  };
}

export function buildCustomerProjectDetail(input: {
  clientId: string;
  companyName: string;
  row: CustomerProjectRowInput;
  recommendationVisible: boolean;
  recommendations?: CustomerProjectRecommendationDto[];
  initiatives: CustomerProjectInitiativeInput[];
  activity: CustomerProjectActivityInput[];
  tasks?: CustomerProjectTaskInput[];
  milestones?: CustomerProjectMilestoneInput[];
  progressPercent?: number | null;
  tasksTotal?: number;
  tasksCompleted?: number;
  publishedUpdates?: Array<{
    id: string;
    publishedAt: Date | string;
    subject: string | null;
    customerFacing: {
      projectStatusLabel: string | null;
      progressPercent: number | null;
      workCompleted: Array<{ title: string; completedAtLabel: string | null }>;
      inProgress: Array<{ title: string; targetOrDueLabel: string | null }>;
      comingNext: Array<{ title: string; targetOrDueLabel: string | null }>;
      nextMilestoneTitle: string | null;
      nextMilestoneTargetLabel: string | null;
      staffMessage: string | null;
    };
  }>;
  now?: Date;
}): CustomerProjectDetailDto {
  const { row, clientId } = input;
  const now = input.now ?? new Date();
  const today = startOfDay(now);
  const pillar = pillarForCategory(clientId, row.categoryCode);
  const recommendations: CustomerProjectRecommendationDto[] =
    input.recommendations ??
    (row.recommendation && input.recommendationVisible
      ? [
          {
            id: row.recommendation.id,
            title: row.recommendation.title,
            status: row.recommendation.status,
            statusLabel: row.recommendation.status.replace(/_/g, " "),
            href: clientRecommendationDetailPath(clientId, row.recommendation.id),
          },
        ]
      : []);

  const expectedOutcome =
    input.recommendationVisible && row.recommendation?.businessImpact?.trim()
      ? row.recommendation.businessImpact.trim()
      : null;

  const activity = input.activity
    .filter((event) => isCustomerProjectActivityEvent(event.eventType))
    .map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      occurredAtLabel: dateLabel(event.occurredAt) ?? "",
      eventType: event.eventType,
      kindLabel: ACTIVITY_KIND_LABEL[event.eventType] ?? "Update",
    }));

  const tasks = (input.tasks ?? []).map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    statusLabel: TASK_STATUS_LABEL[task.status],
    dueDateLabel: dateLabel(task.dueDate),
    completedAtLabel: dateLabel(task.completedAt),
    group: taskGroupForStatus(task.status),
  }));

  const milestones = (input.milestones ?? []).map((milestone) => {
    const target = toDate(milestone.targetDate);
    const isComplete = Boolean(milestone.completedAt);
    const isOverdue = Boolean(
      !isComplete && target && target.getTime() < today.getTime(),
    );
    return {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      targetDateLabel: dateLabel(milestone.targetDate),
      completedAtLabel: dateLabel(milestone.completedAt),
      isComplete,
      isOverdue,
    };
  });

  const nextOpen = (input.milestones ?? [])
    .map((milestone, index) => ({ milestone, index }))
    .filter(({ milestone }) => !milestone.completedAt)
    .sort((a, b) => {
      const aDate = toDate(a.milestone.targetDate)?.getTime() ?? Number.POSITIVE_INFINITY;
      const bDate = toDate(b.milestone.targetDate)?.getTime() ?? Number.POSITIVE_INFINITY;
      if (aDate !== bDate) return aDate - bDate;
      return a.index - b.index;
    })[0];

  const nextMilestone: CustomerProjectNextMilestoneDto | null = nextOpen
    ? {
        id: nextOpen.milestone.id,
        title: nextOpen.milestone.title,
        targetDateLabel: dateLabel(nextOpen.milestone.targetDate),
        isOverdue: Boolean(
          toDate(nextOpen.milestone.targetDate) &&
            toDate(nextOpen.milestone.targetDate)!.getTime() < today.getTime(),
        ),
      }
    : null;

  return {
    clientId,
    companyName: input.companyName,
    id: row.id,
    title: row.title,
    status: row.status,
    statusLabel: statusLabel(row.status),
    priority: row.priority,
    priorityLabel: priorityLabel(row.priority),
    description: row.description?.trim() ? row.description.trim() : null,
    expectedOutcome,
    startDateLabel: dateLabel(row.startDate),
    targetCompletionDateLabel: dateLabel(row.targetCompletionDate),
    completedAtLabel: dateLabel(row.completedAt),
    pillarName: pillar.pillarName ?? row.categoryName,
    pillarHref: pillar.pillarHref,
    progressPercent: input.progressPercent ?? null,
    tasksTotal: input.tasksTotal ?? tasks.length,
    tasksCompleted:
      input.tasksCompleted ?? tasks.filter((task) => task.status === "completed").length,
    tasks,
    taskGroups: groupCustomerProjectTasks(tasks),
    milestones,
    nextMilestone,
    recommendations,
    roadmapInitiatives: input.initiatives.map((initiative) => ({
      id: initiative.id,
      title: initiative.title,
      phaseName: initiative.phaseName,
      href: clientRoadmapPhasePath(clientId, initiative.phaseId),
    })),
    activity,
    publishedUpdates: (input.publishedUpdates ?? []).map((update) => ({
      id: update.id,
      publishedAtLabel: dateLabel(update.publishedAt) ?? "",
      subject: update.subject,
      projectStatusLabel: update.customerFacing.projectStatusLabel,
      progressPercent: update.customerFacing.progressPercent,
      workCompleted: update.customerFacing.workCompleted.map((item) => ({
        title: item.title,
        completedAtLabel: item.completedAtLabel,
      })),
      inProgress: update.customerFacing.inProgress.map((item) => ({
        title: item.title,
        targetOrDueLabel: item.targetOrDueLabel,
      })),
      comingNext: update.customerFacing.comingNext.map((item) => ({
        title: item.title,
        targetOrDueLabel: item.targetOrDueLabel,
      })),
      nextMilestoneTitle: update.customerFacing.nextMilestoneTitle,
      nextMilestoneTargetLabel: update.customerFacing.nextMilestoneTargetLabel,
      staffMessage: update.customerFacing.staffMessage,
    })),
    completionReportHref:
      row.status === "completed"
        ? `/clients/${clientId}/projects/${row.id}/completion-report`
        : null,
    listHref: clientWorkspaceProjectsPath(clientId),
  };
}
