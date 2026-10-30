/**
 * SS-UX-007 — Authorized assembly for the customer roadmap experience.
 * Reuses getClientRoadmapDashboard (scrubbed). Does not mutate roadmap data.
 */

import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getClientRoadmapDashboard } from "@/lib/client-roadmap";
import { getBookingUrl } from "@/lib/support/config";
import { formatPriority } from "@/lib/display";
import { formatProjectStatus } from "@/lib/projects";
import { isClientDeliverableRecommendation } from "@/lib/recommendations/visibility";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";
import {
  buildCustomerRoadmapExperience,
  buildCustomerRoadmapProjectSummary,
  type CustomerRoadmapExperienceDto,
  type CustomerRoadmapProjectSummary,
} from "@/lib/customer-portal/roadmap-dto";

export type { CustomerRoadmapExperienceDto };

async function listCustomerRoadmapProjects(
  clientId: string,
  role: UserRole,
): Promise<CustomerRoadmapProjectSummary[]> {
  const projects = await prisma.project.findMany({
    where: {
      clientId,
      status: { not: "cancelled" },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 8,
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      recommendation: {
        select: {
          title: true,
          recommendationTemplate: { select: { code: true } },
        },
      },
    },
  });

  return projects.map((project) => {
    const recommendation = project.recommendation;
    const recommendationTitle =
      recommendation &&
      isClientDeliverableRecommendation(recommendation as Record<string, unknown>, role)
        ? recommendation.title
        : null;

    return buildCustomerRoadmapProjectSummary(clientId, {
      id: project.id,
      title: project.title,
      statusLabel: formatProjectStatus(project.status),
      priorityLabel: formatPriority(project.priority),
      recommendationTitle,
    });
  });
}

/**
 * Assemble the customer roadmap experience. Returns null when no roadmap exists.
 */
export async function getCustomerRoadmapExperience(
  clientId: string,
  role: UserRole,
): Promise<CustomerRoadmapExperienceDto | null> {
  const dashboard = await getClientRoadmapDashboard(clientId, role);
  if (!dashboard) return null;

  const [projects, bookingHref, profileDetail] = await Promise.all([
    listCustomerRoadmapProjects(clientId, role),
    Promise.resolve(getBookingUrl()),
    getTechnologyProfileDetail(clientId, role),
  ]);

  return buildCustomerRoadmapExperience({
    dashboard,
    projects,
    bookingHref,
    officialStackScore: profileDetail?.profile.overallStackScore ?? null,
  });
}
