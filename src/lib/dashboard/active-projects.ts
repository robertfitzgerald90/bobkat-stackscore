import type { Prisma } from "@/generated/prisma/client";
import type { ProjectStatus } from "@/generated/prisma/client";
import { OPEN_PROJECT_STATUSES } from "@/lib/projects";

/**
 * Statuses counted by the dashboard "Active Projects" KPI.
 * Matches client Technology Profile and Projects module "open" projects,
 * including `proposed` work created from recommendations before approval.
 */
export const DASHBOARD_ACTIVE_PROJECT_STATUSES: ProjectStatus[] = OPEN_PROJECT_STATUSES;

export function isDashboardActiveProjectStatus(status: ProjectStatus): boolean {
  return DASHBOARD_ACTIVE_PROJECT_STATUSES.includes(status);
}

export function dashboardActiveProjectsWhere(): Prisma.ProjectWhereInput {
  return {
    status: { in: DASHBOARD_ACTIVE_PROJECT_STATUSES },
    client: { status: { not: "archived" } },
  };
}
