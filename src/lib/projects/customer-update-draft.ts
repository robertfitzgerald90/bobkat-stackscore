/**
 * SS-UX-015 — Pure draft builder for customer project updates.
 * Never invents completed work, deadlines, or progress.
 */

import type { ProjectStatus, ProjectTaskStatus } from "@/generated/prisma/client";
import { formatDisplayDate } from "@/lib/display";
import { PROJECT_STATUS_LABELS } from "@/lib/projects";
import { computeProjectProgress } from "@/lib/projects/progress";

export type ProjectUpdateItemKind = "task" | "milestone" | "status";

export type ProjectUpdateDraftItem = {
  id: string;
  kind: ProjectUpdateItemKind;
  title: string;
  detail: string | null;
  completedAtLabel: string | null;
  targetOrDueLabel: string | null;
  included: boolean;
};

export type ProjectUpdateDraftPayload = {
  projectId: string;
  projectName: string;
  projectStatus: ProjectStatus;
  projectStatusLabel: string;
  progressPercent: number | null;
  tasksCompleted: number;
  tasksTotal: number;
  sincePublishedAt: string | null;
  generatedAt: string;
  workCompleted: ProjectUpdateDraftItem[];
  inProgress: ProjectUpdateDraftItem[];
  comingNext: ProjectUpdateDraftItem[];
  nextMilestoneTitle: string | null;
  nextMilestoneTargetLabel: string | null;
  staffMessage: string;
  includeProjectStatus: boolean;
  includeWorkCompleted: boolean;
  includeInProgress: boolean;
  includeComingNext: boolean;
  includeStaffMessage: boolean;
};

export type ProjectUpdateTaskInput = {
  id: string;
  title: string;
  description: string | null;
  status: ProjectTaskStatus;
  dueDate: Date | string | null;
  completedAt: Date | string | null;
};

export type ProjectUpdateMilestoneInput = {
  id: string;
  title: string;
  description: string | null;
  targetDate: Date | string | null;
  completedAt: Date | string | null;
};

export type ProjectUpdateStatusEventInput = {
  id: string;
  title: string;
  description: string | null;
  occurredAt: Date | string;
};

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateLabel(value: Date | string | null | undefined): string | null {
  const date = toDate(value);
  return date ? formatDisplayDate(date) : null;
}

function afterWatermark(value: Date | string | null | undefined, since: Date | null): boolean {
  const date = toDate(value);
  if (!date) return false;
  if (!since) return true;
  return date.getTime() > since.getTime();
}

export function draftHasSendableContent(draft: ProjectUpdateDraftPayload): boolean {
  if (draft.includeStaffMessage && draft.staffMessage.trim()) return true;
  if (draft.includeProjectStatus) return true;
  if (
    draft.includeWorkCompleted &&
    draft.workCompleted.some((item) => item.included)
  ) {
    return true;
  }
  if (draft.includeInProgress && draft.inProgress.some((item) => item.included)) {
    return true;
  }
  if (draft.includeComingNext && draft.comingNext.some((item) => item.included)) {
    return true;
  }
  return false;
}

export function buildProjectUpdateDraft(input: {
  projectId: string;
  projectName: string;
  projectStatus: ProjectStatus;
  tasks: ProjectUpdateTaskInput[];
  milestones: ProjectUpdateMilestoneInput[];
  statusEvents?: ProjectUpdateStatusEventInput[];
  sincePublishedAt?: Date | string | null;
  now?: Date;
  staffMessage?: string;
}): ProjectUpdateDraftPayload {
  const now = input.now ?? new Date();
  const since = toDate(input.sincePublishedAt ?? null);
  const progress = computeProjectProgress(input.tasks);

  const workCompleted: ProjectUpdateDraftItem[] = [];

  for (const event of input.statusEvents ?? []) {
    if (!afterWatermark(event.occurredAt, since)) continue;
    workCompleted.push({
      id: event.id,
      kind: "status",
      title: event.title,
      detail: event.description,
      completedAtLabel: dateLabel(event.occurredAt),
      targetOrDueLabel: null,
      included: true,
    });
  }

  for (const task of input.tasks) {
    if (task.status !== "completed") continue;
    if (!afterWatermark(task.completedAt, since)) continue;
    workCompleted.push({
      id: task.id,
      kind: "task",
      title: task.title,
      detail: task.description,
      completedAtLabel: dateLabel(task.completedAt),
      targetOrDueLabel: dateLabel(task.dueDate),
      included: true,
    });
  }

  for (const milestone of input.milestones) {
    if (!milestone.completedAt) continue;
    if (!afterWatermark(milestone.completedAt, since)) continue;
    workCompleted.push({
      id: milestone.id,
      kind: "milestone",
      title: milestone.title,
      detail: milestone.description,
      completedAtLabel: dateLabel(milestone.completedAt),
      targetOrDueLabel: dateLabel(milestone.targetDate),
      included: true,
    });
  }

  const inProgress: ProjectUpdateDraftItem[] = input.tasks
    .filter((task) => task.status === "in_progress")
    .map((task) => ({
      id: task.id,
      kind: "task" as const,
      title: task.title,
      detail: task.description,
      completedAtLabel: null,
      targetOrDueLabel: dateLabel(task.dueDate),
      included: true,
    }));

  const openMilestones = input.milestones
    .map((milestone, index) => ({ milestone, index }))
    .filter(({ milestone }) => !milestone.completedAt)
    .sort((a, b) => {
      const aTime = toDate(a.milestone.targetDate)?.getTime() ?? Number.POSITIVE_INFINITY;
      const bTime = toDate(b.milestone.targetDate)?.getTime() ?? Number.POSITIVE_INFINITY;
      if (aTime !== bTime) return aTime - bTime;
      return a.index - b.index;
    });

  const nextOpen = openMilestones[0]?.milestone ?? null;

  const comingNext: ProjectUpdateDraftItem[] = [
    ...input.tasks
      .filter((task) => task.status === "not_started")
      .map((task) => ({
        id: task.id,
        kind: "task" as const,
        title: task.title,
        detail: task.description,
        completedAtLabel: null,
        targetOrDueLabel: dateLabel(task.dueDate),
        included: true,
      })),
    ...(nextOpen
      ? [
          {
            id: nextOpen.id,
            kind: "milestone" as const,
            title: nextOpen.title,
            detail: nextOpen.description,
            completedAtLabel: null,
            targetOrDueLabel: dateLabel(nextOpen.targetDate),
            included: true,
          },
        ]
      : []),
  ];

  return {
    projectId: input.projectId,
    projectName: input.projectName,
    projectStatus: input.projectStatus,
    projectStatusLabel: PROJECT_STATUS_LABELS[input.projectStatus] ?? input.projectStatus,
    progressPercent: progress.progressPercent,
    tasksCompleted: progress.tasksCompleted,
    tasksTotal: progress.tasksTotal,
    sincePublishedAt: since?.toISOString() ?? null,
    generatedAt: now.toISOString(),
    workCompleted,
    inProgress,
    comingNext,
    nextMilestoneTitle: nextOpen?.title ?? null,
    nextMilestoneTargetLabel: dateLabel(nextOpen?.targetDate ?? null),
    staffMessage: input.staffMessage?.trim() ?? "",
    includeProjectStatus: true,
    includeWorkCompleted: workCompleted.length > 0,
    includeInProgress: inProgress.length > 0,
    includeComingNext: comingNext.length > 0,
    includeStaffMessage: Boolean(input.staffMessage?.trim()),
  };
}

export function applyDraftEdits(
  draft: ProjectUpdateDraftPayload,
  patch: Partial<{
    staffMessage: string;
    includeProjectStatus: boolean;
    includeWorkCompleted: boolean;
    includeInProgress: boolean;
    includeComingNext: boolean;
    includeStaffMessage: boolean;
    excludedItemIds: string[];
    includedItemIds: string[];
  }>,
): ProjectUpdateDraftPayload {
  const excluded = new Set(patch.excludedItemIds ?? []);
  const included = new Set(patch.includedItemIds ?? []);

  const mapItems = (items: ProjectUpdateDraftItem[]) =>
    items.map((item) => {
      if (excluded.has(item.id)) return { ...item, included: false };
      if (included.has(item.id)) return { ...item, included: true };
      return item;
    });

  const next: ProjectUpdateDraftPayload = {
    ...draft,
    workCompleted: mapItems(draft.workCompleted),
    inProgress: mapItems(draft.inProgress),
    comingNext: mapItems(draft.comingNext),
  };

  if (patch.staffMessage !== undefined) {
    next.staffMessage = patch.staffMessage;
    next.includeStaffMessage =
      patch.includeStaffMessage ?? Boolean(patch.staffMessage.trim());
  }
  if (patch.includeProjectStatus !== undefined) {
    next.includeProjectStatus = patch.includeProjectStatus;
  }
  if (patch.includeWorkCompleted !== undefined) {
    next.includeWorkCompleted = patch.includeWorkCompleted;
  }
  if (patch.includeInProgress !== undefined) {
    next.includeInProgress = patch.includeInProgress;
  }
  if (patch.includeComingNext !== undefined) {
    next.includeComingNext = patch.includeComingNext;
  }
  if (patch.includeStaffMessage !== undefined) {
    next.includeStaffMessage = patch.includeStaffMessage;
  }

  return next;
}

/** Build customer-safe section copy for email + published portal view. */
export function buildCustomerFacingUpdateSections(draft: ProjectUpdateDraftPayload) {
  const included = (items: ProjectUpdateDraftItem[]) =>
    items.filter((item) => item.included);

  const workCompleted = draft.includeWorkCompleted
    ? included(draft.workCompleted).map((item) => ({
        title: item.title,
        detail: item.detail,
        completedAtLabel: item.completedAtLabel,
        kind: item.kind,
      }))
    : [];

  const inProgress = draft.includeInProgress
    ? included(draft.inProgress).map((item) => ({
        title: item.title,
        detail: item.detail,
        targetOrDueLabel: item.targetOrDueLabel,
        kind: item.kind,
      }))
    : [];

  const comingNext = draft.includeComingNext
    ? included(draft.comingNext).map((item) => ({
        title: item.title,
        detail: item.detail,
        targetOrDueLabel: item.targetOrDueLabel,
        kind: item.kind,
      }))
    : [];

  return {
    projectName: draft.projectName,
    projectStatusLabel: draft.includeProjectStatus ? draft.projectStatusLabel : null,
    progressPercent: draft.includeProjectStatus ? draft.progressPercent : null,
    tasksCompleted: draft.tasksCompleted,
    tasksTotal: draft.tasksTotal,
    workCompleted,
    inProgress,
    comingNext,
    nextMilestoneTitle: draft.includeComingNext ? draft.nextMilestoneTitle : null,
    nextMilestoneTargetLabel: draft.includeComingNext
      ? draft.nextMilestoneTargetLabel
      : null,
    staffMessage:
      draft.includeStaffMessage && draft.staffMessage.trim()
        ? draft.staffMessage.trim()
        : null,
  };
}
