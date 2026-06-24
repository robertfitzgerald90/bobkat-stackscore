import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { logSystemNote } from "@/lib/records/activity";
import type {
  AssessmentDeletionPreview,
  ClientDeletionPreview,
  ProjectDeletionPreview,
  RecommendationDeletionPreview,
  UserDeletionPreview,
} from "@/lib/records/types";

export async function getClientDeletionPreview(
  clientId: string,
): Promise<ClientDeletionPreview | null> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      companyName: true,
      _count: {
        select: {
          assessments: true,
          recommendations: true,
          projects: true,
          scoreHistory: true,
          documents: true,
          activityNotes: true,
        },
      },
      assessments: { select: { id: true } },
    },
  });

  if (!client) return null;

  const assessmentIds = client.assessments.map((assessment) => assessment.id);
  const responseCount =
    assessmentIds.length > 0
      ? await prisma.assessmentResponse.count({
          where: { assessmentId: { in: assessmentIds } },
        })
      : 0;

  return {
    entityType: "client",
    entityId: client.id,
    entityName: client.companyName,
    counts: {
      assessments: client._count.assessments,
      assessmentResponses: responseCount,
      recommendations: client._count.recommendations,
      projects: client._count.projects,
      scoreHistory: client._count.scoreHistory,
      documents: client._count.documents,
      notes: client._count.activityNotes,
    },
  };
}

export async function archiveClient(clientId: string, userId: string) {
  const client = await prisma.client.update({
    where: { id: clientId },
    data: { status: "archived" },
  });

  await logSystemNote({
    clientId,
    userId,
    content: `Client archived by administrator.`,
  });

  return client;
}

export async function restoreClient(clientId: string, userId: string) {
  const client = await prisma.client.update({
    where: { id: clientId },
    data: { status: "inactive" },
  });

  await logSystemNote({
    clientId,
    userId,
    content: `Client restored from archive by administrator.`,
  });

  return client;
}

export async function deleteClientPermanently(clientId: string, userId: string) {
  const preview = await getClientDeletionPreview(clientId);
  if (!preview) return null;

  await prisma.$transaction(async (tx) => {
    await tx.note.create({
      data: {
        clientId,
        userId,
        noteType: "system",
        visibility: "internal",
        content: `Client "${preview.entityName}" permanently deleted by administrator.`,
      },
    });

    const assessmentIds = (
      await tx.assessment.findMany({
        where: { clientId },
        select: { id: true },
      })
    ).map((assessment) => assessment.id);

    const projectIds = (
      await tx.project.findMany({
        where: { clientId },
        select: { id: true },
      })
    ).map((project) => project.id);

    await tx.note.deleteMany({
      where: {
        OR: [
          { clientId },
          { assessmentId: { in: assessmentIds } },
          { projectId: { in: projectIds } },
        ],
      },
    });

    await tx.document.deleteMany({
      where: {
        OR: [
          { clientId },
          { assessmentId: { in: assessmentIds } },
          { projectId: { in: projectIds } },
        ],
      },
    });

    await tx.project.deleteMany({ where: { clientId } });
    await tx.clientScoreHistory.deleteMany({ where: { clientId } });
    await tx.assessment.deleteMany({ where: { clientId } });
    await tx.assessmentRecommendation.deleteMany({ where: { clientId } });
    await tx.client.delete({ where: { id: clientId } });
  });

  return preview;
}

export async function getAssessmentDeletionPreview(
  assessmentId: string,
): Promise<AssessmentDeletionPreview | null> {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      client: { select: { companyName: true } },
      _count: {
        select: {
          responses: true,
          recommendations: true,
          categoryScores: true,
          scoreHistory: true,
          documents: true,
          notes: true,
          derivedAssessments: true,
        },
      },
    },
  });

  if (!assessment) return null;

  return {
    entityType: "assessment",
    entityId: assessment.id,
    entityName: assessment.assessmentName,
    clientName: assessment.client.companyName,
    counts: {
      responses: assessment._count.responses,
      recommendations: assessment._count.recommendations,
      categoryScores: assessment._count.categoryScores,
      scoreHistory: assessment._count.scoreHistory,
      documents: assessment._count.documents,
      notes: assessment._count.notes,
      derivedAssessments: assessment._count.derivedAssessments,
    },
  };
}

export async function archiveAssessment(assessmentId: string, userId: string) {
  const assessment = await prisma.assessment.update({
    where: { id: assessmentId },
    data: { status: "archived" },
  });

  await logSystemNote({
    clientId: assessment.clientId,
    assessmentId,
    userId,
    content: `Assessment "${assessment.assessmentName}" archived by administrator.`,
  });

  return assessment;
}

export async function deleteAssessmentPermanently(assessmentId: string, userId: string) {
  const preview = await getAssessmentDeletionPreview(assessmentId);
  if (!preview) return null;

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { clientId: true, assessmentName: true },
  });
  if (!assessment) return null;

  await prisma.$transaction(async (tx) => {
    await tx.note.deleteMany({ where: { assessmentId } });
    await tx.document.deleteMany({ where: { assessmentId } });
    await tx.clientScoreHistory.deleteMany({ where: { assessmentId } });
    await tx.assessment.delete({ where: { id: assessmentId } });
  });

  await logSystemNote({
    clientId: assessment.clientId,
    userId,
    content: `Assessment "${assessment.assessmentName}" permanently deleted by administrator.`,
  });

  return preview;
}

export async function getProjectDeletionPreview(
  projectId: string,
): Promise<ProjectDeletionPreview | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: { select: { companyName: true } },
      _count: { select: { documents: true, notes: true } },
    },
  });

  if (!project) return null;

  return {
    entityType: "project",
    entityId: project.id,
    entityName: project.title,
    clientName: project.client.companyName,
    counts: {
      documents: project._count.documents,
      notes: project._count.notes,
    },
  };
}

export async function cancelProject(projectId: string, userId: string) {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status: "cancelled", completedAt: null },
    include: { client: { select: { companyName: true } } },
  });

  await logSystemNote({
    clientId: project.clientId,
    projectId,
    userId,
    content: `Project "${project.title}" cancelled by administrator.`,
  });

  return project;
}

export async function deleteProjectPermanently(projectId: string, userId: string) {
  const preview = await getProjectDeletionPreview(projectId);
  if (!preview) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { clientId: true, title: true },
  });
  if (!project) return null;

  await prisma.$transaction(async (tx) => {
    await tx.note.deleteMany({ where: { projectId } });
    await tx.document.deleteMany({ where: { projectId } });
    await tx.project.delete({ where: { id: projectId } });
  });

  await logSystemNote({
    clientId: project.clientId,
    userId,
    content: `Project "${project.title}" permanently deleted by administrator.`,
  });

  return preview;
}

export async function archiveRecommendation(recommendationId: string, userId: string) {
  const recommendation = await prisma.assessmentRecommendation.update({
    where: { id: recommendationId },
    data: { status: "archived", completedAt: null },
  });

  await logSystemNote({
    clientId: recommendation.clientId,
    assessmentId: recommendation.assessmentId,
    userId,
    content: `Recommendation "${recommendation.title}" archived by administrator.`,
  });

  return recommendation;
}

export async function getRecommendationDeletionPreview(
  recommendationId: string,
): Promise<RecommendationDeletionPreview | null> {
  const recommendation = await prisma.assessmentRecommendation.findUnique({
    where: { id: recommendationId },
    include: {
      client: { select: { companyName: true } },
      project: { select: { id: true } },
    },
  });

  if (!recommendation) return null;

  return {
    entityType: "recommendation",
    entityId: recommendation.id,
    entityName: recommendation.title,
    clientName: recommendation.client.companyName,
    hasProject: recommendation.project !== null,
  };
}

export async function deleteRecommendationPermanently(
  recommendationId: string,
  userId: string,
) {
  const preview = await getRecommendationDeletionPreview(recommendationId);
  if (!preview) return null;

  const recommendation = await prisma.assessmentRecommendation.findUnique({
    where: { id: recommendationId },
    select: {
      clientId: true,
      assessmentId: true,
      title: true,
      project: { select: { id: true } },
    },
  });
  if (!recommendation) return null;

  if (recommendation.project) {
    throw new Error("Cannot delete a recommendation that has an associated project.");
  }

  await prisma.assessmentRecommendation.delete({ where: { id: recommendationId } });

  await logSystemNote({
    clientId: recommendation.clientId,
    assessmentId: recommendation.assessmentId,
    userId,
    content: `Recommendation "${recommendation.title}" permanently deleted by administrator.`,
  });

  return preview;
}

export async function getUserDeletionPreview(
  userId: string,
): Promise<UserDeletionPreview | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          assessments: true,
          recommendationsCreated: true,
          projectsAssigned: true,
          documentsUploaded: true,
          notes: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    entityType: "user",
    entityId: user.id,
    entityName: user.name,
    counts: {
      assessments: user._count.assessments,
      recommendationsCreated: user._count.recommendationsCreated,
      projectsAssigned: user._count.projectsAssigned,
      documentsUploaded: user._count.documentsUploaded,
      notes: user._count.notes,
    },
  };
}

export async function deleteUserPermanently(userId: string) {
  const preview = await getUserDeletionPreview(userId);
  if (!preview) return null;

  if (preview.counts.assessments > 0) {
    throw new Error("Cannot delete a user who has conducted assessments.");
  }

  if (preview.counts.recommendationsCreated > 0) {
    throw new Error("Cannot delete a user who has created recommendations.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.project.updateMany({
      where: { assignedUserId: userId },
      data: { assignedUserId: null },
    });

    await tx.document.updateMany({
      where: { uploadedByUserId: userId },
      data: { uploadedByUserId: await getFallbackAdminId(tx) },
    });

    await tx.note.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });

  return preview;
}

async function getFallbackAdminId(tx: Prisma.TransactionClient) {
  const admin = await tx.user.findFirst({
    where: { role: "admin", isActive: true },
    select: { id: true },
  });

  if (!admin) {
    throw new Error("No active administrator available to reassign uploaded documents.");
  }

  return admin.id;
}
