import { prisma } from "@/lib/db";
import type { ProjectStatus } from "@/generated/prisma/client";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { PROJECT_STATUS_LABELS } from "@/lib/projects";
import { projectInclude, serializeProject } from "@/lib/projects/serialize";
import type { UpdateProjectInput } from "@/lib/projects/schemas";
import { assertProjectDepositGate } from "@/lib/billing/deposit-service";

/**
 * Keeps the *primary* linked recommendation in sync when a project completes or reopens.
 * SS-UX-013: additional ProjectRecommendation links are NOT auto-completed/reopened.
 * Completing all tasks/milestones never calls this — project status remains staff-driven.
 * SS-UX-015: records CLIENT_VISIBLE project_status_changed when status changes.
 */
export async function updateProjectWithWorkflow(
  projectId: string,
  input: UpdateProjectInput,
  actorUserId?: string | null,
) {
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.project.findUnique({
      where: { id: projectId },
      select: { id: true, clientId: true, title: true, recommendationId: true, status: true },
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
    const statusChanged = nextStatus !== existing.status;

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

    // Compatibility: only the legacy primary recommendationId is synced.
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
      statusChanged,
      previousStatus: existing.status,
      nextStatus,
      clientId: existing.clientId,
      title: existing.title,
    };
  });

  if (result?.statusChanged) {
    const fromLabel = PROJECT_STATUS_LABELS[result.previousStatus] ?? result.previousStatus;
    const toLabel = PROJECT_STATUS_LABELS[result.nextStatus] ?? result.nextStatus;
    await recordOrganizationActivity({
      clientId: result.clientId,
      category: "PROJECT",
      eventType: "project_status_changed",
      title: `Project status changed: ${fromLabel} → ${toLabel}`,
      description: `“${result.title}” moved from ${fromLabel} to ${toLabel}.`,
      visibility: "CLIENT_VISIBLE",
      actorUserId: actorUserId ?? null,
      sourceRecordType: "Project",
      sourceRecordId: projectId,
    });
  }

  return result
    ? {
        project: result.project,
        isCompleting: result.isCompleting,
        isReopening: result.isReopening,
      }
    : null;
}

export async function completeProjectWithNotifications(
  projectId: string,
  input: UpdateProjectInput,
  actorUserId?: string | null,
) {
  const result = await updateProjectWithWorkflow(projectId, input, actorUserId);
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
