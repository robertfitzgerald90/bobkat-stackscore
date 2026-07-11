import { enqueueCommunication } from "@/lib/communications/queue/service";
import { buildAssessmentCompleteEmailData } from "@/lib/communications/workflows/email-data";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { prisma } from "@/lib/db";

export async function triggerAssessmentCompleteWorkflow(input: {
  assessmentId: string;
  clientId: string;
  createdByUserId: string;
}) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: input.assessmentId },
    include: {
      client: true,
      recommendations: {
        where: { status: { in: ["open", "accepted", "in_progress"] } },
        orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }],
        take: 6,
      },
    },
  });
  if (!assessment?.completedAt) return null;

  const strengths = assessment.recommendations
    .filter((rec) => rec.priority === "low" || rec.priority === "medium")
    .slice(0, 3)
    .map((rec) => rec.title);
  const priorities = assessment.recommendations
    .filter((rec) => rec.priority === "critical" || rec.priority === "high")
    .slice(0, 3)
    .map((rec) => rec.title);

  const payload = await buildAssessmentCompleteEmailData({
    assessmentId: assessment.id,
    assessmentName: assessment.assessmentName,
    organizationName: assessment.client.companyName,
    completedAt: assessment.completedAt.toLocaleDateString(),
    overallScore: assessment.overallScore ? Math.round(Number(assessment.overallScore)) : null,
    strengths,
    priorities,
    executiveSummary: assessment.executiveSummary,
    firstName: assessment.client.primaryContactName.split(" ")[0],
  });

  await prisma.client.update({
    where: { id: input.clientId },
    data: { quarterlyReviewAnchorAt: assessment.completedAt },
  });

  const queueItem = await enqueueCommunication({
    workflowKey: "assessment_complete",
    clientId: input.clientId,
    assessmentId: input.assessmentId,
    payload,
    createdByUserId: input.createdByUserId,
    reviewRequired: true,
    autoSend: false,
  });

  if (queueItem) {
    await recordOrganizationActivity({
      clientId: input.clientId,
      category: "COMMUNICATIONS",
      eventType: "assessment_complete_notification_queued",
      title: "Assessment complete notification queued",
      description: "Review recipients and send the assessment complete email.",
      sourceRecordType: "CommunicationQueueItem",
      sourceRecordId: queueItem.id,
      visibility: "INTERNAL",
      actorUserId: input.createdByUserId,
    });
  }

  return queueItem;
}

export async function triggerRoadmapPublishedWorkflow(input: {
  clientId: string;
  tipId: string;
  createdByUserId: string;
}) {
  const tip = await prisma.technologyImprovementPlan.findFirst({
    where: { id: input.tipId, clientId: input.clientId },
    include: { client: true },
  });
  if (!tip?.generatedAt) return null;

  const { assembleTipPlanDetail } = await import("@/lib/technology-improvement-plan/service");
  const { buildRoadmapReadyEmailData } = await import("@/lib/communications/workflows/email-data");
  const record = await prisma.technologyImprovementPlan.findFirstOrThrow({
    where: { id: input.tipId },
    include: {
      document: { select: { id: true } },
      client: { select: { companyName: true } },
      assessment: { select: { assessmentName: true, overallScore: true } },
    },
  });
  const detail = await assembleTipPlanDetail(record, "admin");
  const payload = await buildRoadmapReadyEmailData({
    clientId: input.clientId,
    tipId: input.tipId,
    roadmapName: tip.title,
    organizationName: tip.client.companyName,
    executiveSummary: detail.executiveSummary ?? undefined,
    phaseCount: detail.roadmapPhases.length,
    projectCount: detail.playbooks.length,
    estimatedTimeline: detail.roadmapPhases.map((phase) => phase.label).join(" → "),
    nextAction: detail.roadmapPhases[0]?.label,
    firstName: undefined,
  });

  return enqueueCommunication({
    workflowKey: "roadmap_published",
    clientId: input.clientId,
    tipId: input.tipId,
    payload,
    createdByUserId: input.createdByUserId,
    reviewRequired: true,
    autoSend: false,
  });
}

export async function triggerProjectCompletedWorkflow(input: {
  projectId: string;
  clientId: string;
  createdByUserId?: string | null;
}) {
  const project = await prisma.project.findFirst({
    where: { id: input.projectId, clientId: input.clientId },
    include: {
      client: true,
      recommendation: true,
    },
  });
  if (!project?.completedAt) return null;

  const { resolveProjectCompletionMode } = await import("@/lib/communications/queue/service");
  const { buildProjectCompletedEmailData } = await import("@/lib/communications/workflows/email-data");

  const mode = await resolveProjectCompletionMode({
    clientId: input.clientId,
    projectOverride: project.completionNotificationOverride,
  });

  const payload = await buildProjectCompletedEmailData({
    clientId: input.clientId,
    projectId: project.id,
    projectName: project.title,
    organizationName: project.client.companyName,
    startDate: project.startDate?.toLocaleDateString() ?? null,
    completionDate: project.completedAt.toLocaleDateString(),
    description: project.description,
    businessOutcome: project.recommendation?.businessImpact ?? null,
    relatedRecommendation: project.recommendation?.title ?? null,
    firstName: project.client.primaryContactName.split(" ")[0],
  });

  return enqueueCommunication({
    workflowKey: "project_completed",
    clientId: input.clientId,
    projectIds: [project.id],
    payload,
    createdByUserId: input.createdByUserId ?? null,
    reviewRequired: mode === "manual",
    autoSend: mode === "automatic",
  });
}

export async function triggerProjectBatchNotification(input: {
  clientId: string;
  projectIds: string[];
  createdByUserId: string;
}) {
  const projects = await prisma.project.findMany({
    where: { clientId: input.clientId, id: { in: input.projectIds } },
    include: { recommendation: true, client: true },
  });
  if (projects.length === 0) throw new Error("No projects selected");

  const { buildProjectCreatedEmailData } = await import("@/lib/communications/workflows/email-data");
  const payload = await buildProjectCreatedEmailData({
    clientId: input.clientId,
    organizationName: projects[0].client.companyName,
    projects: projects.map((project) => ({
      name: project.title,
      purpose: project.description,
      businessOutcome: project.recommendation?.businessImpact ?? null,
      estimatedCost: project.estimatedCost ? `$${Number(project.estimatedCost).toLocaleString()}` : null,
    })),
    firstName: projects[0].client.primaryContactName.split(" ")[0],
  });

  const queueItem = await enqueueCommunication({
    workflowKey: "project_batch_created",
    clientId: input.clientId,
    projectIds: input.projectIds,
    payload,
    createdByUserId: input.createdByUserId,
    reviewRequired: true,
    autoSend: false,
  });

  await recordOrganizationActivity({
    clientId: input.clientId,
    category: "PROJECT",
    eventType: "projects_shared",
    title: "Projects shared notification queued",
    description: `${projects.length} project(s) queued for customer notification.`,
    visibility: "INTERNAL",
    actorUserId: input.createdByUserId,
  });

  return queueItem;
}
