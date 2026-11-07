import { prisma } from "@/lib/db";
import type { PlannerTaskView } from "./model";

export async function listPlannerTasks(
  clientId: string,
): Promise<PlannerTaskView[]> {
  const tasks = await prisma.plannerTask.findMany({
    where: { clientId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  return tasks.map(
    ({
      sourceRecommendationId,
      id,
      title,
      description,
      owner,
      pillarCode,
      horizon,
      status,
      dueDate,
      steps,
    }) => ({
      sourceRecommendationId,
      id,
      title,
      description,
      owner,
      pillarCode,
      horizon: horizon as PlannerTaskView["horizon"],
      status: status as PlannerTaskView["status"],
      dueDate,
      steps,
    }),
  );
}
