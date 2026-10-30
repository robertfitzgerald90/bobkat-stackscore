/**
 * SS-UX-013 — Staff-managed tasks, milestones, and recommendation links.
 * Does not mutate StackScore. Completing tasks/milestones does not complete projects
 * or change recommendation status.
 */

import type { ProjectTaskStatus } from "@/generated/prisma/client";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { prisma } from "@/lib/db";
import type {
  SerializedProjectMilestone,
  SerializedProjectRecommendationLink,
  SerializedProjectTask,
} from "@/lib/projects/delivery-dto";
import {
  toCustomerVisibleMilestone,
  toCustomerVisibleTask,
} from "@/lib/projects/delivery-dto";
import { computeProjectProgress } from "@/lib/projects/progress";
import type {
  CreateProjectMilestoneInput,
  CreateProjectTaskInput,
  UpdateProjectMilestoneInput,
  UpdateProjectTaskInput,
} from "@/lib/projects/task-schemas";

export type {
  CustomerVisibleProjectMilestone,
  CustomerVisibleProjectTask,
  SerializedProjectMilestone,
  SerializedProjectRecommendationLink,
  SerializedProjectTask,
} from "@/lib/projects/delivery-dto";

export { toCustomerVisibleMilestone, toCustomerVisibleTask };

function serializeTask(task: {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  description: string | null;
  internalNotes: string | null;
  status: ProjectTaskStatus;
  dueDate: Date | null;
  sortOrder: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): SerializedProjectTask {
  return {
    id: task.id,
    projectId: task.projectId,
    clientId: task.clientId,
    title: task.title,
    description: task.description,
    internalNotes: task.internalNotes,
    status: task.status,
    dueDate: task.dueDate?.toISOString() ?? null,
    sortOrder: task.sortOrder,
    completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function serializeMilestone(milestone: {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  description: string | null;
  targetDate: Date | null;
  completedAt: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): SerializedProjectMilestone {
  return {
    id: milestone.id,
    projectId: milestone.projectId,
    clientId: milestone.clientId,
    title: milestone.title,
    description: milestone.description,
    targetDate: milestone.targetDate?.toISOString() ?? null,
    completedAt: milestone.completedAt?.toISOString() ?? null,
    sortOrder: milestone.sortOrder,
    createdAt: milestone.createdAt.toISOString(),
    updatedAt: milestone.updatedAt.toISOString(),
  };
}

async function requireProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, clientId: true, title: true },
  });
  return project;
}

export async function listProjectTasks(projectId: string) {
  const tasks = await prisma.projectTask.findMany({
    where: { projectId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return tasks.map(serializeTask);
}

export async function listProjectMilestones(projectId: string) {
  const milestones = await prisma.projectMilestone.findMany({
    where: { projectId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return milestones.map(serializeMilestone);
}

export async function listProjectRecommendationLinks(projectId: string) {
  const links = await prisma.projectRecommendation.findMany({
    where: { projectId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    include: {
      recommendation: { select: { id: true, title: true, status: true } },
    },
  });

  return links.map(
    (link): SerializedProjectRecommendationLink => ({
      id: link.id,
      projectId: link.projectId,
      recommendationId: link.recommendationId,
      isPrimary: link.isPrimary,
      title: link.recommendation.title,
      status: link.recommendation.status,
      createdAt: link.createdAt.toISOString(),
    }),
  );
}

export async function getProjectDeliveryBundle(projectId: string) {
  const project = await requireProject(projectId);
  if (!project) return null;

  const [tasks, milestones, recommendations] = await Promise.all([
    listProjectTasks(projectId),
    listProjectMilestones(projectId),
    listProjectRecommendationLinks(projectId),
  ]);

  return {
    projectId,
    clientId: project.clientId,
    progress: computeProjectProgress(tasks),
    tasks,
    milestones,
    recommendations,
  };
}

export async function createProjectTask(
  projectId: string,
  input: CreateProjectTaskInput,
  actorUserId?: string | null,
) {
  const project = await requireProject(projectId);
  if (!project) return null;

  const maxSort = await prisma.projectTask.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });
  const status = input.status ?? "not_started";
  const task = await prisma.projectTask.create({
    data: {
      projectId,
      clientId: project.clientId,
      title: input.title,
      description: input.description ?? null,
      internalNotes: input.internalNotes ?? null,
      status,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      sortOrder: input.sortOrder ?? (maxSort._max.sortOrder ?? -1) + 1,
      completedAt: status === "completed" ? new Date() : null,
    },
  });

  if (status === "completed") {
    await recordOrganizationActivity({
      clientId: project.clientId,
      category: "PROJECT",
      eventType: "project_task_completed",
      title: `Task completed: ${task.title}`,
      description: `Completed on project “${project.title}”.`,
      visibility: "CLIENT_VISIBLE",
      actorUserId: actorUserId ?? null,
      sourceRecordType: "Project",
      sourceRecordId: projectId,
    });
  }

  return serializeTask(task);
}

export async function updateProjectTask(
  projectId: string,
  taskId: string,
  input: UpdateProjectTaskInput,
  actorUserId?: string | null,
) {
  const existing = await prisma.projectTask.findFirst({
    where: { id: taskId, projectId },
  });
  if (!existing) return null;

  const nextStatus = input.status ?? existing.status;
  const becomingComplete =
    nextStatus === "completed" && existing.status !== "completed";
  const reopening = existing.status === "completed" && nextStatus !== "completed";

  const task = await prisma.projectTask.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.internalNotes !== undefined
        ? { internalNotes: input.internalNotes }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.dueDate !== undefined
        ? { dueDate: input.dueDate ? new Date(input.dueDate) : null }
        : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      completedAt: becomingComplete
        ? new Date()
        : reopening
          ? null
          : undefined,
    },
  });

  if (becomingComplete) {
    const project = await requireProject(projectId);
    await recordOrganizationActivity({
      clientId: existing.clientId,
      category: "PROJECT",
      eventType: "project_task_completed",
      title: `Task completed: ${task.title}`,
      description: project
        ? `Completed on project “${project.title}”.`
        : "Task marked complete.",
      visibility: "CLIENT_VISIBLE",
      actorUserId: actorUserId ?? null,
      sourceRecordType: "Project",
      sourceRecordId: projectId,
    });
  }

  return serializeTask(task);
}

export async function deleteProjectTask(projectId: string, taskId: string) {
  const existing = await prisma.projectTask.findFirst({
    where: { id: taskId, projectId },
    select: { id: true },
  });
  if (!existing) return false;
  await prisma.projectTask.delete({ where: { id: taskId } });
  return true;
}

export async function reorderProjectTasks(projectId: string, orderedIds: string[]) {
  const tasks = await prisma.projectTask.findMany({
    where: { projectId },
    select: { id: true },
  });
  const owned = new Set(tasks.map((task) => task.id));
  if (orderedIds.some((id) => !owned.has(id)) || orderedIds.length !== owned.size) {
    throw new Error("Ordered task ids must match the project task set");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.projectTask.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return listProjectTasks(projectId);
}

export async function createProjectMilestone(
  projectId: string,
  input: CreateProjectMilestoneInput,
  actorUserId?: string | null,
) {
  const project = await requireProject(projectId);
  if (!project) return null;

  const maxSort = await prisma.projectMilestone.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });
  const completed = Boolean(input.completed);
  const milestone = await prisma.projectMilestone.create({
    data: {
      projectId,
      clientId: project.clientId,
      title: input.title,
      description: input.description ?? null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
      sortOrder: input.sortOrder ?? (maxSort._max.sortOrder ?? -1) + 1,
      completedAt: completed ? new Date() : null,
    },
  });

  if (completed) {
    await recordOrganizationActivity({
      clientId: project.clientId,
      category: "PROJECT",
      eventType: "project_milestone_completed",
      title: `Milestone completed: ${milestone.title}`,
      description: `Completed on project “${project.title}”.`,
      visibility: "CLIENT_VISIBLE",
      actorUserId: actorUserId ?? null,
      sourceRecordType: "Project",
      sourceRecordId: projectId,
    });
  }

  return serializeMilestone(milestone);
}

export async function updateProjectMilestone(
  projectId: string,
  milestoneId: string,
  input: UpdateProjectMilestoneInput,
  actorUserId?: string | null,
) {
  const existing = await prisma.projectMilestone.findFirst({
    where: { id: milestoneId, projectId },
  });
  if (!existing) return null;

  const wasComplete = Boolean(existing.completedAt);
  const nextComplete =
    input.completed === undefined ? wasComplete : Boolean(input.completed);
  const becomingComplete = nextComplete && !wasComplete;

  const milestone = await prisma.projectMilestone.update({
    where: { id: milestoneId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.targetDate !== undefined
        ? { targetDate: input.targetDate ? new Date(input.targetDate) : null }
        : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      completedAt: becomingComplete
        ? new Date()
        : input.completed === false
          ? null
          : undefined,
    },
  });

  if (becomingComplete) {
    const project = await requireProject(projectId);
    await recordOrganizationActivity({
      clientId: existing.clientId,
      category: "PROJECT",
      eventType: "project_milestone_completed",
      title: `Milestone completed: ${milestone.title}`,
      description: project
        ? `Completed on project “${project.title}”.`
        : "Milestone marked complete.",
      visibility: "CLIENT_VISIBLE",
      actorUserId: actorUserId ?? null,
      sourceRecordType: "Project",
      sourceRecordId: projectId,
    });
  }

  return serializeMilestone(milestone);
}

export async function deleteProjectMilestone(projectId: string, milestoneId: string) {
  const existing = await prisma.projectMilestone.findFirst({
    where: { id: milestoneId, projectId },
    select: { id: true },
  });
  if (!existing) return false;
  await prisma.projectMilestone.delete({ where: { id: milestoneId } });
  return true;
}

export async function reorderProjectMilestones(projectId: string, orderedIds: string[]) {
  const milestones = await prisma.projectMilestone.findMany({
    where: { projectId },
    select: { id: true },
  });
  const owned = new Set(milestones.map((milestone) => milestone.id));
  if (orderedIds.some((id) => !owned.has(id)) || orderedIds.length !== owned.size) {
    throw new Error("Ordered milestone ids must match the project milestone set");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.projectMilestone.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return listProjectMilestones(projectId);
}

/**
 * Link an additional recommendation. Does not change recommendation status.
 * Rejects recommendations that already own a legacy Project.recommendationId
 * or are already linked via ProjectRecommendation.
 */
export async function linkProjectRecommendation(
  projectId: string,
  recommendationId: string,
) {
  const project = await requireProject(projectId);
  if (!project) return { ok: false as const, error: "Project not found" };

  const recommendation = await prisma.assessmentRecommendation.findUnique({
    where: { id: recommendationId },
    select: { id: true, clientId: true, title: true, status: true },
  });
  if (!recommendation) return { ok: false as const, error: "Recommendation not found" };
  if (recommendation.clientId !== project.clientId) {
    return { ok: false as const, error: "Recommendation does not belong to this client" };
  }

  const owningProject = await prisma.project.findUnique({
    where: { recommendationId },
    select: { id: true },
  });
  if (owningProject && owningProject.id !== projectId) {
    return {
      ok: false as const,
      error: "Recommendation already has its own project",
    };
  }

  const existingLink = await prisma.projectRecommendation.findUnique({
    where: { recommendationId },
  });
  if (existingLink) {
    if (existingLink.projectId === projectId) {
      return { ok: false as const, error: "Recommendation is already linked" };
    }
    return {
      ok: false as const,
      error: "Recommendation is already linked to another project",
    };
  }

  const link = await prisma.projectRecommendation.create({
    data: {
      projectId,
      clientId: project.clientId,
      recommendationId,
      isPrimary: false,
    },
    include: {
      recommendation: { select: { id: true, title: true, status: true } },
    },
  });

  return {
    ok: true as const,
    link: {
      id: link.id,
      projectId: link.projectId,
      recommendationId: link.recommendationId,
      isPrimary: link.isPrimary,
      title: link.recommendation.title,
      status: link.recommendation.status,
      createdAt: link.createdAt.toISOString(),
    } satisfies SerializedProjectRecommendationLink,
  };
}

/**
 * Unlink a non-primary recommendation. Primary legacy links cannot be removed
 * while Project.recommendationId remains required.
 */
export async function unlinkProjectRecommendation(
  projectId: string,
  recommendationId: string,
) {
  const link = await prisma.projectRecommendation.findFirst({
    where: { projectId, recommendationId },
  });
  if (!link) return { ok: false as const, error: "Link not found" };
  if (link.isPrimary) {
    return {
      ok: false as const,
      error: "Primary recommendation cannot be unlinked while legacy project FK remains",
    };
  }

  await prisma.projectRecommendation.delete({ where: { id: link.id } });
  return { ok: true as const };
}

/** Ensure create-project also seeds the join table (idempotent). */
export async function ensurePrimaryProjectRecommendationLink(input: {
  projectId: string;
  clientId: string;
  recommendationId: string;
}) {
  await prisma.projectRecommendation.upsert({
    where: { recommendationId: input.recommendationId },
    create: {
      projectId: input.projectId,
      clientId: input.clientId,
      recommendationId: input.recommendationId,
      isPrimary: true,
    },
    update: {
      projectId: input.projectId,
      clientId: input.clientId,
      isPrimary: true,
    },
  });
}
