/**
 * SS-UX-013 — Project progress from task completion only.
 * Never invents a percentage when no tasks exist.
 * Does not mutate project status or StackScore.
 */

import type { ProjectTaskStatus } from "@/generated/prisma/client";

export type ProjectProgressInput = {
  status: ProjectTaskStatus;
};

export type ProjectProgressResult = {
  /** null when the project has zero tasks */
  progressPercent: number | null;
  tasksTotal: number;
  tasksCompleted: number;
};

export function computeProjectProgress(
  tasks: readonly ProjectProgressInput[],
): ProjectProgressResult {
  const tasksTotal = tasks.length;
  if (tasksTotal === 0) {
    return { progressPercent: null, tasksTotal: 0, tasksCompleted: 0 };
  }

  const tasksCompleted = tasks.filter((task) => task.status === "completed").length;
  return {
    progressPercent: Math.round((tasksCompleted / tasksTotal) * 100),
    tasksTotal,
    tasksCompleted,
  };
}
