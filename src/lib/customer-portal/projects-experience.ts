/**
 * SS-UX-012/013 — Authorized assembly for customer Projects dashboard + detail.
 * Read-only; excludes costs, internal notes, and non-deliverable recommendations.
 */

import type { UserRole } from "@/generated/prisma/client";
import { getClientActivityTimeline } from "@/lib/communications/activity/record-activity";
import {
  buildCustomerProjectDetail,
  buildCustomerProjectsExperience,
  type CustomerProjectDetailDto,
  type CustomerProjectRecommendationDto,
  type CustomerProjectRowInput,
  type CustomerProjectViewFilter,
  type CustomerProjectsExperienceDto,
} from "@/lib/customer-portal/projects-dto";
import { clientRecommendationDetailPath } from "@/lib/clients/paths";
import { prisma } from "@/lib/db";
import { listPublishedCustomerProjectUpdates } from "@/lib/projects/customer-update-service";
import { computeProjectProgress } from "@/lib/projects/progress";
import {
  isClientDeliverableRecommendation,
} from "@/lib/recommendations/visibility";

export type {
  CustomerProjectDetailDto,
  CustomerProjectViewFilter,
  CustomerProjectsExperienceDto,
};

function mapProjectRow(project: {
  id: string;
  title: string;
  description: string | null;
  status: CustomerProjectRowInput["status"];
  priority: CustomerProjectRowInput["priority"];
  startDate: Date | null;
  targetCompletionDate: Date | null;
  completedAt: Date | null;
  category: { code: string; name: string };
  recommendation: {
    id: string;
    title: string;
    status: NonNullable<CustomerProjectRowInput["recommendation"]>["status"];
    businessImpact: string;
    recommendationTemplate: { code: string } | null;
  } | null;
  progressPercent?: number | null;
}): CustomerProjectRowInput {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    priority: project.priority,
    startDate: project.startDate,
    targetCompletionDate: project.targetCompletionDate,
    completedAt: project.completedAt,
    categoryCode: project.category.code,
    categoryName: project.category.name,
    recommendation: project.recommendation
      ? {
          id: project.recommendation.id,
          title: project.recommendation.title,
          status: project.recommendation.status,
          businessImpact: project.recommendation.businessImpact,
          templateCode: project.recommendation.recommendationTemplate?.code ?? null,
        }
      : null,
    progressPercent: project.progressPercent ?? null,
  };
}

const projectSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  startDate: true,
  targetCompletionDate: true,
  completedAt: true,
  category: { select: { code: true, name: true } },
  recommendation: {
    select: {
      id: true,
      title: true,
      status: true,
      businessImpact: true,
      recommendationTemplate: { select: { code: true } },
    },
  },
} as const;

function isDeliverable(
  recommendation: {
    title: string;
    templateCode: string | null;
  },
  role: UserRole,
): boolean {
  return isClientDeliverableRecommendation(
    {
      title: recommendation.title,
      recommendationTemplate: recommendation.templateCode
        ? { code: recommendation.templateCode }
        : null,
      templateCode: recommendation.templateCode,
    },
    role,
  );
}

/**
 * Customer Projects dashboard. Tenant scope is caller-enforced (page ownership).
 * Never selects estimatedCost or staff-only task notes.
 */
export async function getCustomerProjectsExperience(
  clientId: string,
  companyName: string,
  view: CustomerProjectViewFilter = "all",
): Promise<CustomerProjectsExperienceDto> {
  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: { clientId },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      select: projectSelect,
    }),
    prisma.projectTask.findMany({
      where: { clientId },
      select: { projectId: true, status: true },
    }),
  ]);

  const tasksByProject = new Map<string, Array<{ status: (typeof tasks)[number]["status"] }>>();
  for (const task of tasks) {
    const list = tasksByProject.get(task.projectId) ?? [];
    list.push({ status: task.status });
    tasksByProject.set(task.projectId, list);
  }

  return buildCustomerProjectsExperience({
    clientId,
    companyName,
    view,
    rows: projects.map((project) => {
      const progress = computeProjectProgress(tasksByProject.get(project.id) ?? []);
      return mapProjectRow({
        ...project,
        progressPercent: progress.progressPercent,
      });
    }),
  });
}

/**
 * Customer project detail. Returns null when missing or not owned by clientId.
 */
export async function getCustomerProjectDetail(
  clientId: string,
  projectId: string,
  companyName: string,
  role: UserRole,
): Promise<CustomerProjectDetailDto | null> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, clientId },
    select: projectSelect,
  });

  if (!project) return null;
  if (project.status === "cancelled") return null;

  const row = mapProjectRow(project);
  const recommendationVisible = Boolean(
    row.recommendation &&
      isDeliverable(
        {
          title: row.recommendation.title,
          templateCode: row.recommendation.templateCode,
        },
        role,
      ),
  );

  const [taskRows, milestoneRows, recommendationLinks, activity, publishedUpdates] =
    await Promise.all([
      prisma.projectTask.findMany({
        where: { projectId, clientId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          dueDate: true,
          completedAt: true,
        },
      }),
      prisma.projectMilestone.findMany({
        where: { projectId, clientId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          targetDate: true,
          completedAt: true,
        },
      }),
      prisma.projectRecommendation.findMany({
        where: { projectId, clientId },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        include: {
          recommendation: {
            select: {
              id: true,
              title: true,
              status: true,
              recommendationTemplate: { select: { code: true } },
            },
          },
        },
      }),
      getClientActivityTimeline(clientId, { includeInternal: false, limit: 40 }),
      listPublishedCustomerProjectUpdates({ projectId, clientId }),
    ]);

  const progress = computeProjectProgress(taskRows);

  const recommendations: CustomerProjectRecommendationDto[] = recommendationLinks
    .filter((link) =>
      isDeliverable(
        {
          title: link.recommendation.title,
          templateCode: link.recommendation.recommendationTemplate?.code ?? null,
        },
        role,
      ),
    )
    .map((link) => ({
      id: link.recommendation.id,
      title: link.recommendation.title,
      status: link.recommendation.status,
      statusLabel: link.recommendation.status.replace(/_/g, " "),
      href: clientRecommendationDetailPath(clientId, link.recommendation.id),
    }));

  const recommendationIds = recommendations.map((item) => item.id);
  const initiatives =
    recommendationIds.length > 0
      ? await prisma.clientRoadmapInitiative.findMany({
          where: { recommendationId: { in: recommendationIds } },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            phase: { select: { id: true, name: true } },
          },
        })
      : [];

  const projectActivity = activity.filter((event) => event.sourceRecordId === projectId);

  return buildCustomerProjectDetail({
    clientId,
    companyName,
    row,
    recommendationVisible,
    recommendations,
    initiatives: initiatives.map((initiative) => ({
      id: initiative.id,
      title: initiative.title,
      phaseId: initiative.phase.id,
      phaseName: initiative.phase.name,
    })),
    activity: projectActivity.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      occurredAt: event.occurredAt,
      eventType: event.eventType,
      category: event.category,
      sourceRecordType: event.sourceRecordType,
      sourceRecordId: event.sourceRecordId,
    })),
    tasks: taskRows,
    milestones: milestoneRows,
    progressPercent: progress.progressPercent,
    tasksTotal: progress.tasksTotal,
    tasksCompleted: progress.tasksCompleted,
    publishedUpdates,
  });
}
