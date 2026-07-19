import type { RecommendationStatus, RoadmapPhaseStatus, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  canUpdateInitiativeStatus,
  canUpdatePhaseStatus,
} from "./permissions";

const VALID_PHASE_STATUSES: RoadmapPhaseStatus[] = [
  "planned",
  "awaiting_approval",
  "approved",
  "in_progress",
  "completed",
  "deferred",
  "cancelled",
];

const VALID_RECOMMENDATION_STATUSES: RecommendationStatus[] = [
  "open",
  "accepted",
  "in_progress",
  "completed",
  "deferred",
  "declined",
  "archived",
];

export function isValidPhaseStatus(value: string): value is RoadmapPhaseStatus {
  return VALID_PHASE_STATUSES.includes(value as RoadmapPhaseStatus);
}

export function isValidRecommendationStatus(
  value: string,
): value is RecommendationStatus {
  return VALID_RECOMMENDATION_STATUSES.includes(value as RecommendationStatus);
}

export async function updateRoadmapPhaseStatus(input: {
  clientId: string;
  phaseId: string;
  status: RoadmapPhaseStatus;
  userId: string;
  role: UserRole;
  note?: string;
}) {
  const phase = await prisma.clientRoadmapPhase.findFirst({
    where: {
      id: input.phaseId,
      roadmap: { clientId: input.clientId },
    },
    include: { roadmap: true },
  });

  if (!phase) return null;

  if (!canUpdatePhaseStatus(input.role, phase.status, input.status)) {
    throw new Error("You do not have permission to apply this phase status change");
  }

  const isApproval = phase.status === "awaiting_approval" && input.status === "approved";
  const isCompletion = input.status === "completed";

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.clientRoadmapPhase.update({
      where: { id: phase.id },
      data: {
        status: input.status,
        ...(isApproval
          ? {
              approvedAt: new Date(),
              approvedByUserId: input.userId,
            }
          : {}),
        ...(isCompletion
          ? {
              completionDate: new Date(),
              actualCompletionDate: new Date(),
              projectCompletedAt: new Date(),
            }
          : {}),
        ...(input.status === "in_progress" && !phase.projectStartedAt
          ? { projectStartedAt: new Date() }
          : {}),
      },
    });

    await tx.clientRoadmapPhaseEvent.create({
      data: {
        phaseId: phase.id,
        fromStatus: phase.status,
        toStatus: input.status,
        changedByUserId: input.userId,
        note: input.note ?? null,
      },
    });

    if (isCompletion) {
      const incompletePhases = await tx.clientRoadmapPhase.count({
        where: {
          roadmapId: phase.roadmapId,
          status: { notIn: ["completed", "cancelled", "deferred"] },
        },
      });
      if (incompletePhases === 0) {
        await tx.clientRoadmap.update({
          where: { id: phase.roadmapId },
          data: { status: "completed", completedAt: new Date() },
        });
      }
    }

    return next;
  });

  return updated;
}

export async function updateRoadmapInitiativeStatus(input: {
  clientId: string;
  initiativeId: string;
  status: RecommendationStatus;
  role: UserRole;
}) {
  if (!canUpdateInitiativeStatus(input.role)) {
    throw new Error("Only consultants can update initiative status");
  }

  const initiative = await prisma.clientRoadmapInitiative.findFirst({
    where: {
      id: input.initiativeId,
      phase: { roadmap: { clientId: input.clientId } },
    },
  });

  if (!initiative) return null;

  return prisma.assessmentRecommendation.update({
    where: { id: initiative.recommendationId },
    data: {
      status: input.status,
      completedAt: input.status === "completed" ? new Date() : null,
    },
    include: { category: true },
  });
}
