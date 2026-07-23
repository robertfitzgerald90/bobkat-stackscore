import { prisma } from "@/lib/db";
import type { ProjectStatus } from "@/generated/prisma/client";
import { projectInclude, serializeProject } from "@/lib/projects/serialize";
import type { UpdateProjectInput } from "@/lib/projects/schemas";
import { assertProjectDepositGate } from "@/lib/billing/deposit-service";

/** Keeps linked recommendation status in sync when a project completes or reopens. */
export async function updateProjectWithWorkflow(
  projectId: string,
  input: UpdateProjectInput,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.project.findUnique({
      where: { id: projectId },
      select: { id: true, recommendationId: true, status: true },
    });

    if (!existing) {
      return null;
    }

    const nextStatus = (input.status ?? existing.status) as ProjectStatus;
    if (
      nextStatus === "scheduled" ||
      nextStatus === "in_progress"
    ) {
      await assertProjectDepositGate(projectId);
    }
    const isCompleting = nextStatus === "completed" && existing.status !== "completed";
    const isReopening = existing.status === "completed" && nextStatus !== "completed";

    const project = await tx.project.update({
      where: { id: projectId },
      data: {
        ...(input.status ? { status: input.status as ProjectStatus } : {}),
        ...(input.notes !== undefined ? { description: input.notes } : {}),
        ...(input.assignedUserId !== undefined
          ? { assignedUserId: input.assignedUserId }
          : {}),
        ...(input.startDate !== undefined
          ? { startDate: input.startDate ? new Date(input.startDate) : null }
          : {}),
        ...(input.targetCompletionDate !== undefined
          ? {
              targetCompletionDate: input.targetCompletionDate
                ? new Date(input.targetCompletionDate)
                : null,
            }
          : {}),
        ...(input.actualImpactPoints !== undefined
          ? { actualImpactPoints: input.actualImpactPoints }
          : {}),
        completedAt: isCompleting
          ? new Date()
          : isReopening
            ? null
            : undefined,
      },
      include: projectInclude,
    });

    if (isCompleting) {
      await tx.assessmentRecommendation.update({
        where: { id: existing.recommendationId },
        data: { status: "completed", completedAt: new Date() },
      });
    } else if (isReopening) {
      await tx.assessmentRecommendation.update({
        where: { id: existing.recommendationId },
        data: { status: "in_progress", completedAt: null },
      });
    }

    return {
      project: serializeProject(project),
      isCompleting,
      isReopening,
    };
  });
}

export async function completeProjectWithNotifications(
  projectId: string,
  input: UpdateProjectInput,
  actorUserId?: string | null,
) {
  const result = await updateProjectWithWorkflow(projectId, input);
  if (!result) return null;

  if (result.isCompleting) {
    const { triggerProjectCompletedWorkflow } = await import(
      "@/lib/communications/workflows/triggers"
    );
    await triggerProjectCompletedWorkflow({
      projectId,
      clientId: result.project.clientId,
      createdByUserId: actorUserId ?? null,
    });
  }

  return result.project;
}
