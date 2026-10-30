/**
 * SS-UX-012 — Authorized assembly for customer Projects dashboard + detail.
 * Read-only; excludes costs, internal notes, and non-deliverable recommendations.
 */

import type { UserRole } from "@/generated/prisma/client";
import { getClientActivityTimeline } from "@/lib/communications/activity/record-activity";
import {
  buildCustomerProjectDetail,
  buildCustomerProjectsExperience,
  type CustomerProjectDetailDto,
  type CustomerProjectRowInput,
  type CustomerProjectViewFilter,
  type CustomerProjectsExperienceDto,
} from "@/lib/customer-portal/projects-dto";
import { prisma } from "@/lib/db";
import { isClientDeliverableRecommendation } from "@/lib/recommendations/visibility";

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
    status: CustomerProjectRowInput["recommendation"] extends null
      ? never
      : NonNullable<CustomerProjectRowInput["recommendation"]>["status"];
    businessImpact: string;
    recommendationTemplate: { code: string } | null;
  } | null;
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

/**
 * Customer Projects dashboard. Tenant scope is caller-enforced (page ownership).
 * Never selects estimatedCost or internal Note rows.
 */
export async function getCustomerProjectsExperience(
  clientId: string,
  companyName: string,
  view: CustomerProjectViewFilter = "all",
): Promise<CustomerProjectsExperienceDto> {
  const projects = await prisma.project.findMany({
    where: { clientId },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    select: projectSelect,
  });

  return buildCustomerProjectsExperience({
    clientId,
    companyName,
    view,
    rows: projects.map(mapProjectRow),
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
      isClientDeliverableRecommendation(
        {
          title: row.recommendation.title,
          recommendationTemplate: row.recommendation.templateCode
            ? { code: row.recommendation.templateCode }
            : null,
          templateCode: row.recommendation.templateCode,
        },
        role,
      ),
  );

  const recommendationId = row.recommendation?.id;
  const [initiatives, activity] = await Promise.all([
    recommendationId
      ? prisma.clientRoadmapInitiative.findMany({
          where: { recommendationId },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            phase: { select: { id: true, name: true } },
          },
        })
      : Promise.resolve([]),
    getClientActivityTimeline(clientId, { includeInternal: false, limit: 40 }),
  ]);

  const projectActivity = activity.filter(
    (event) => event.sourceRecordId === projectId,
  );

  return buildCustomerProjectDetail({
    clientId,
    companyName,
    row,
    recommendationVisible,
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
  });
}
