import { prisma } from "@/lib/db";
import { dashboardActiveProjectsWhere } from "@/lib/dashboard/active-projects";

export async function countDashboardActiveProjects(): Promise<number> {
  return prisma.project.count({
    where: dashboardActiveProjectsWhere(),
  });
}
