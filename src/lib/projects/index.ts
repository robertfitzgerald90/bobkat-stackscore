import type { ProjectStatus } from "@/generated/prisma/client";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  proposed: "Proposed",
  approved: "Approved",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ALL_PROJECT_STATUSES: ProjectStatus[] = [
  "proposed",
  "approved",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];

export const OPEN_PROJECT_STATUSES: ProjectStatus[] = [
  "proposed",
  "approved",
  "scheduled",
  "in_progress",
];

export const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = [
  "approved",
  "scheduled",
  "in_progress",
];

export function isOpenProjectStatus(status: ProjectStatus): boolean {
  return OPEN_PROJECT_STATUSES.includes(status);
}

export function formatProjectStatus(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status];
}
