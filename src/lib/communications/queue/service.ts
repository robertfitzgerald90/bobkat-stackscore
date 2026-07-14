import type { CommunicationQueueStatus, Prisma } from "@/generated/prisma/client";
import { recordCommunicationSentActivity } from "@/lib/communications/activity/record-activity";
import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import { resolveRecipients } from "@/lib/communications/recipients/resolver";
import type { RecipientSelection } from "@/lib/communications/recipients/types";
import { renderCommunicationTemplate } from "@/lib/communications/render-template";
import { getCommunicationWorkflowSettings } from "@/lib/communications/settings/workflow-settings";
import { recordAndSendCommunication } from "@/lib/communications/tracking/record-outbound";
import {
  getWorkflowDefinition,
  type CommunicationWorkflowKey,
} from "@/lib/communications/workflows/registry";
import { prisma } from "@/lib/db";

const WORKFLOW_EVENT_KEYS: Record<string, string> = {
  assessment_complete: "ASSESSMENT_COMPLETE",
  roadmap_published: "ROADMAP_READY",
  proposal_published: "PROPOSAL_READY",
  project_batch_created: "PROJECTS_SHARED",
  project_completed: "PROJECT_COMPLETED",
  quarterly_review: "QUARTERLY_REVIEW_REMINDER",
  password_reset: "PASSWORD_RESET_REQUESTED",
  assessment_invitation: "ASSESSMENT_INVITATION_SENT",
};

export type EnqueueCommunicationInput = {
  workflowKey: CommunicationWorkflowKey;
  clientId?: string | null;
  prospectId?: string | null;
  assessmentId?: string | null;
  tipId?: string | null;
  projectIds?: string[];
  recipientSelection?: RecipientSelection;
  payload?: Record<string, unknown>;
  createdByUserId?: string | null;
  reviewRequired?: boolean;
  autoSend?: boolean;
  scheduledFor?: Date | null;
};

export async function enqueueCommunication(input: EnqueueCommunicationInput) {
  const workflow = getWorkflowDefinition(input.workflowKey);

  const item = await withCommunicationDbFallback(
    () =>
      prisma.communicationQueueItem.create({
        data: {
          workflowKey: input.workflowKey,
          templateKey: workflow.templateKey,
          status: input.autoSend ? "approved" : "pending_review",
          clientId: input.clientId ?? null,
          prospectId: input.prospectId ?? null,
          assessmentId: input.assessmentId ?? null,
          tipId: input.tipId ?? null,
          projectIdsJson: (input.projectIds ?? null) as Prisma.InputJsonValue,
          recipientSelectionJson: (input.recipientSelection ?? {}) as Prisma.InputJsonValue,
          payloadJson: (input.payload ?? null) as Prisma.InputJsonValue,
          reviewRequired: input.reviewRequired ?? workflow.reviewRequired,
          autoSend: input.autoSend ?? workflow.autoSend,
          scheduledFor: input.scheduledFor ?? null,
          createdByUserId: input.createdByUserId ?? null,
        },
      }),
    null,
  );

  if (!item) return null;

  if (input.autoSend ?? workflow.autoSend) {
    await processQueueItem(item.id, input.createdByUserId ?? undefined);
  }

  return item;
}

export async function approveQueueItem(queueItemId: string, approvedByUserId: string) {
  return prisma.communicationQueueItem.update({
    where: { id: queueItemId },
    data: {
      status: "approved",
      approvedByUserId,
    },
  });
}

export async function sendQueueItem(queueItemId: string, approvedByUserId?: string) {
  if (approvedByUserId) {
    await approveQueueItem(queueItemId, approvedByUserId);
  }
  return processQueueItem(queueItemId, approvedByUserId);
}

async function processQueueItem(queueItemId: string, actorUserId?: string) {
  const item = await prisma.communicationQueueItem.findUnique({ where: { id: queueItemId } });
  if (!item) throw new Error("Queue item not found");
  if (item.status === "sent") return item;

  await prisma.communicationQueueItem.update({
    where: { id: queueItemId },
    data: { status: "sending" },
  });

  try {
    const payload = (item.payloadJson ?? {}) as Record<string, unknown>;
    const selection = (item.recipientSelectionJson ?? {}) as RecipientSelection;
    const workflow = getWorkflowDefinition(item.workflowKey as CommunicationWorkflowKey);

    const recipients =
      item.clientId != null
        ? await resolveRecipients({
            clientId: item.clientId,
            audience: workflow.audience,
            templateKey: item.templateKey,
            selection,
            assessmentId: item.assessmentId,
            consultantUserId: actorUserId ?? item.createdByUserId,
          })
        : payload.email
          ? [{ email: String(payload.email), name: payload.name as string | undefined, source: "primary_contact" as const }]
          : [];

    if (recipients.length === 0) {
      throw new Error("No recipients resolved for queue item");
    }

    for (const recipient of recipients) {
      const rendered = await renderCommunicationTemplate(item.templateKey, {
        ...payload,
        firstName: payload.firstName ?? recipient.name?.split(" ")[0],
      });

      const sendResult = await recordAndSendCommunication({
        to: recipient.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        previewText: rendered.previewText,
        templateKey: item.templateKey,
        eventKey: WORKFLOW_EVENT_KEYS[item.workflowKey] ?? item.workflowKey,
        sendType: item.autoSend ? "AUTOMATED" : "MANUAL",
        idempotencyKey: `${WORKFLOW_EVENT_KEYS[item.workflowKey] ?? item.workflowKey}:${item.id}:${recipient.email}`,
        triggeredBy: item.autoSend ? "communication_queue_auto_send" : "communication_queue_manual_send",
        relatedEntityType: item.assessmentId
          ? "Assessment"
          : item.tipId
            ? "TechnologyImprovementPlan"
            : Array.isArray(item.projectIdsJson)
              ? "Project"
              : "CommunicationQueueItem",
        relatedEntityId:
          item.assessmentId ??
          item.tipId ??
          (Array.isArray(item.projectIdsJson) ? String(item.projectIdsJson[0]) : item.id),
        recipientName: recipient.name ?? null,
        clientId: item.clientId,
        userId: recipient.userId ?? null,
        assessmentId: item.assessmentId,
        projectId: Array.isArray(item.projectIdsJson) ? (item.projectIdsJson[0] as string) : null,
        proposalId: item.tipId,
        queueItemId: item.id,
        createdByUserId: actorUserId ?? item.createdByUserId,
        metadata: {
          workflowKey: item.workflowKey,
          queueItemId: item.id,
          recipientSource: recipient.source,
        },
      });

      if (item.clientId) {
        await recordCommunicationSentActivity({
          clientId: item.clientId,
          userId: recipient.userId ?? null,
          messageId: sendResult.messageId,
          templateKey: item.templateKey,
          subject: rendered.subject,
          recipientEmail: recipient.email,
        });
      }
    }

    return await prisma.communicationQueueItem.update({
      where: { id: queueItemId },
      data: {
        status: "sent",
        sentAt: new Date(),
        approvedByUserId: actorUserId ?? item.approvedByUserId,
      },
    });
  } catch (error) {
    await prisma.communicationQueueItem.update({
      where: { id: queueItemId },
      data: {
        status: "failed",
        failureReason: error instanceof Error ? error.message : "Send failed",
      },
    });
    throw error;
  }
}

export async function listPendingQueueItems(limit = 20) {
  return withCommunicationDbFallback(
    () =>
      prisma.communicationQueueItem.findMany({
        where: {
          status: { in: ["pending_review", "approved", "scheduled", "failed"] },
        },
        orderBy: [{ createdAt: "desc" }],
        take: limit,
        include: {
          client: { select: { companyName: true } },
        },
      }),
    [],
  );
}

export async function processDueScheduledQueueItems() {
  const due = await prisma.communicationQueueItem.findMany({
    where: {
      status: "scheduled",
      scheduledFor: { lte: new Date() },
    },
    take: 25,
  });

  for (const item of due) {
    await processQueueItem(item.id, item.approvedByUserId ?? undefined);
  }

  return due.length;
}

export async function dismissQueueItem(queueItemId: string) {
  return prisma.communicationQueueItem.update({
    where: { id: queueItemId },
    data: {
      status: "dismissed",
      dismissedAt: new Date(),
    },
  });
}

export async function scheduleQueueItem(queueItemId: string, scheduledFor: Date, approvedByUserId?: string) {
  return prisma.communicationQueueItem.update({
    where: { id: queueItemId },
    data: {
      status: "scheduled",
      scheduledFor,
      approvedByUserId: approvedByUserId ?? null,
    },
  });
}

export async function resolveProjectCompletionMode(input: {
  clientId: string;
  projectOverride?: "inherit" | "automatic" | "manual" | null;
}) {
  const [settings, client, projectOverride] = await Promise.all([
    getCommunicationWorkflowSettings(),
    prisma.client.findUnique({ where: { id: input.clientId } }),
    Promise.resolve(input.projectOverride ?? null),
  ]);

  const mode =
    projectOverride && projectOverride !== "inherit"
      ? projectOverride
      : client?.projectCompletionNotification && client.projectCompletionNotification !== "inherit"
        ? client.projectCompletionNotification
        : settings.projectCompletionDefault;

  return mode;
}
