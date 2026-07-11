import type { CommunicationEventType, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";

export async function recordCampaignEvent(input: {
  campaignId: string;
  eventType: string;
  title: string;
  description?: string | null;
  actorUserId?: string | null;
  recipientId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return prisma.campaignEvent.create({
    data: {
      campaignId: input.campaignId,
      eventType: input.eventType,
      title: input.title,
      description: input.description ?? null,
      actorUserId: input.actorUserId ?? null,
      recipientId: input.recipientId ?? null,
      metadataJson: (input.metadata ?? null) as Prisma.InputJsonValue,
    },
  });
}

export async function getCampaignTimeline(campaignId: string, limit = 50) {
  const events = await prisma.campaignEvent.findMany({
    where: { campaignId },
    orderBy: { occurredAt: "desc" },
    take: limit,
    include: {
      actor: { select: { id: true, name: true } },
      recipient: {
        include: {
          prospect: { select: { firstName: true, lastName: true, company: true, email: true } },
        },
      },
    },
  });

  return events.map((event) => ({
    id: event.id,
    eventType: event.eventType,
    title: event.title,
    description: event.description,
    occurredAt: event.occurredAt.toISOString(),
    actorName: event.actor?.name ?? null,
    prospectName: event.recipient
      ? `${event.recipient.prospect.firstName} ${event.recipient.prospect.lastName}`.trim()
      : null,
    prospectCompany: event.recipient?.prospect.company ?? null,
  }));
}

export async function syncCampaignRecipientFromMessageEvent(input: {
  messageId: string;
  eventType: CommunicationEventType;
  occurredAt: Date;
}) {
  const recipient = await prisma.campaignRecipient.findFirst({
    where: { communicationMessageId: input.messageId },
    include: {
      prospect: true,
      campaign: true,
    },
  });

  if (!recipient) return;

  const updates: {
    openedAt?: Date;
    clickedAt?: Date;
  } = {};

  let prospectStatus: string | null = null;
  let eventType: string | null = null;
  let eventTitle: string | null = null;

  if (input.eventType === "OPENED" && !recipient.openedAt) {
    updates.openedAt = input.occurredAt;
    prospectStatus = "opened";
    eventType = "invitation_opened";
    eventTitle = "Invitation opened";
  }

  if (input.eventType === "CLICKED" && !recipient.clickedAt) {
    updates.clickedAt = input.occurredAt;
    prospectStatus = "clicked";
    eventType = "invitation_clicked";
    eventTitle = "Invitation clicked";
  }

  if (Object.keys(updates).length > 0) {
    await prisma.campaignRecipient.update({
      where: { id: recipient.id },
      data: updates,
    });
  }

  if (prospectStatus) {
    await prisma.prospect.update({
      where: { id: recipient.prospectId },
      data: { status: prospectStatus as never, lastContactAt: input.occurredAt },
    });
  }

  if (eventType && eventTitle) {
    await recordCampaignEvent({
      campaignId: recipient.campaignId,
      eventType,
      title: eventTitle,
      description: `${recipient.prospect.firstName} ${recipient.prospect.lastName} — ${recipient.prospect.email}`,
      recipientId: recipient.id,
    });
  }

  if (recipient.clientId && eventType === "invitation_opened") {
    await recordOrganizationActivity({
      clientId: recipient.clientId,
      userId: recipient.userId,
      category: "COMMUNICATIONS",
      eventType: "invitation_opened",
      title: "Assessment invitation opened",
      description: `${recipient.prospect.email} opened the assessment invitation.`,
      sourceRecordType: "CommunicationMessage",
      sourceRecordId: input.messageId,
      visibility: "CLIENT_VISIBLE",
    });
  }

  if (recipient.clientId && eventType === "invitation_clicked") {
    await recordOrganizationActivity({
      clientId: recipient.clientId,
      userId: recipient.userId,
      category: "COMMUNICATIONS",
      eventType: "invitation_clicked",
      title: "Assessment invitation clicked",
      description: `${recipient.prospect.email} clicked the assessment invitation.`,
      sourceRecordType: "CommunicationMessage",
      sourceRecordId: input.messageId,
      visibility: "CLIENT_VISIBLE",
    });
  }
}

export async function syncCampaignRecipientAssessmentStarted(input: {
  assessmentId: string;
  clientId: string;
}) {
  const recipient = await prisma.campaignRecipient.findFirst({
    where: { assessmentId: input.assessmentId },
    include: { prospect: true },
  });
  if (!recipient || recipient.assessmentStartedAt) return;

  const now = new Date();
  await prisma.campaignRecipient.update({
    where: { id: recipient.id },
    data: { assessmentStartedAt: now },
  });
  await prisma.prospect.update({
    where: { id: recipient.prospectId },
    data: { status: "assessment_started", lastContactAt: now },
  });
  await recordCampaignEvent({
    campaignId: recipient.campaignId,
    eventType: "assessment_started",
    title: "Assessment started",
    description: `${recipient.prospect.firstName} ${recipient.prospect.lastName} started their assessment.`,
    recipientId: recipient.id,
  });
}

export async function syncCampaignRecipientAssessmentCompleted(input: {
  assessmentId: string;
  clientId: string;
}) {
  const recipient = await prisma.campaignRecipient.findFirst({
    where: { assessmentId: input.assessmentId },
    include: { prospect: true, campaign: true },
  });
  if (!recipient || recipient.assessmentCompletedAt) return;

  const now = new Date();
  await prisma.campaignRecipient.update({
    where: { id: recipient.id },
    data: { assessmentCompletedAt: now },
  });
  await prisma.prospect.update({
    where: { id: recipient.prospectId },
    data: { status: "assessment_completed", lastContactAt: now },
  });
  await recordCampaignEvent({
    campaignId: recipient.campaignId,
    eventType: "assessment_completed",
    title: "Assessment completed",
    description: `${recipient.prospect.firstName} ${recipient.prospect.lastName} completed their assessment.`,
    recipientId: recipient.id,
  });
}

export async function convertProspectOnActivation(input: {
  userId: string;
  clientId: string;
}) {
  const prospect = await prisma.prospect.findFirst({
    where: { clientId: input.clientId },
  });
  if (!prospect || prospect.status === "converted") return;

  const now = new Date();
  await prisma.$transaction([
    prisma.prospect.update({
      where: { id: prospect.id },
      data: { status: "converted", lastContactAt: now },
    }),
    prisma.client.update({
      where: { id: input.clientId },
      data: { status: "active" },
    }),
  ]);
}
