/**
 * SS-UX-013 — Pure delivery DTO helpers (no Prisma / I/O).
 */

import type { ProjectTaskStatus } from "@/generated/prisma/client";

export type SerializedProjectTask = {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  description: string | null;
  internalNotes: string | null;
  status: ProjectTaskStatus;
  dueDate: string | null;
  sortOrder: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SerializedProjectMilestone = {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type SerializedProjectRecommendationLink = {
  id: string;
  projectId: string;
  recommendationId: string;
  isPrimary: boolean;
  title: string;
  status: string;
  createdAt: string;
};

export type CustomerVisibleProjectTask = {
  id: string;
  title: string;
  description: string | null;
  status: ProjectTaskStatus;
  dueDate: string | null;
  completedAt: string | null;
  sortOrder: number;
};

export type CustomerVisibleProjectMilestone = {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  completedAt: string | null;
  sortOrder: number;
};

/** Strip staff-only fields for customer projections. */
export function toCustomerVisibleTask(
  task: SerializedProjectTask,
): CustomerVisibleProjectTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    sortOrder: task.sortOrder,
  };
}

export function toCustomerVisibleMilestone(
  milestone: SerializedProjectMilestone,
): CustomerVisibleProjectMilestone {
  return {
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    targetDate: milestone.targetDate,
    completedAt: milestone.completedAt,
    sortOrder: milestone.sortOrder,
  };
}
