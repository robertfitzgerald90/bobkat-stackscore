import type {
  CommunicationEventSource,
  CommunicationEventType,
  CommunicationMessageStatus,
  Prisma,
} from "@/generated/prisma/client";
import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import {
  recordCommunicationSentActivity,
} from "@/lib/communications/activity/record-activity";
import { getPublishedTemplateVersion } from "@/lib/communications/template-versions";
import { deriveStatusFromEvent } from "@/lib/communications/tracking/status";
import { extractLinkLabel, maskSensitiveUrl } from "@/lib/communications/tracking/url-sanitize";
import { getEmailConfig } from "@/lib/email/config";
import { sendEmail } from "@/lib/email/send";
import { prisma } from "@/lib/db";

export type OutboundCommunicationInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  previewText?: string | null;
  templateKey: string;
  templateVersion?: number | null;
  recipientName?: string | null;
  isTest?: boolean;
  clientId?: string | null;
  userId?: string | null;
  assessmentId?: string | null;
  projectId?: string | null;
  createdByUserId?: string | null;
  campaignId?: string | null;
  metadata?: Record<string, unknown>;
};

export type OutboundCommunicationResult = {
  messageId: string;
  providerMessageId?: string;
  status: CommunicationMessageStatus;
  delivered: boolean;
  provider: "resend" | "console";
};

async function resolveTemplateVersion(templateKey: string): Promise<number | null> {
  const published = await getPublishedTemplateVersion(templateKey);
  return published?.versionNumber ?? null;
}

export async function recordAndSendCommunication(
  input: OutboundCommunicationInput,
): Promise<OutboundCommunicationResult> {
  const email = input.to.trim().toLowerCase();
  const { from } = getEmailConfig();
  const templateVersion =
    input.templateVersion ?? (input.isTest ? null : await resolveTemplateVersion(input.templateKey));

  const message = await withCommunicationDbFallback(
    () =>
      prisma.communicationMessage.create({
        data: {
          templateKey: input.templateKey,
          templateVersion,
          subject: input.subject,
          previewText: input.previewText ?? null,
          recipientEmail: email,
          recipientName: input.recipientName ?? null,
          senderEmail: from,
          clientId: input.clientId ?? null,
          userId: input.userId ?? null,
          assessmentId: input.assessmentId ?? null,
          projectId: input.projectId ?? null,
          campaignId: input.campaignId ?? null,
          status: "QUEUED",
          isTest: input.isTest ?? false,
          metadataJson: (input.metadata ?? null) as Prisma.InputJsonValue,
          createdByUserId: input.createdByUserId ?? null,
        },
      }),
    null,
  );

  if (!message) {
    const result = await sendEmail({
      to: email,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return {
      messageId: "untracked",
      providerMessageId: result.id,
      status: result.delivered ? "SENT" : "FAILED",
      delivered: result.delivered,
      provider: result.provider,
    };
  }

  await createCommunicationEvent({
    messageId: message.id,
    eventType: "MESSAGE_CREATED",
    source: "STACKSCORE",
    occurredAt: message.createdAt,
  });
  await createCommunicationEvent({
    messageId: message.id,
    eventType: "QUEUED",
    source: "STACKSCORE",
    occurredAt: message.createdAt,
  });

  try {
    const result = await sendEmail({
      to: email,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    const sentAt = new Date();
    await prisma.communicationMessage.update({
      where: { id: message.id },
      data: {
        providerMessageId: result.id ?? null,
        status: "SENT",
        sentAt,
        failureReason: null,
      },
    });

    await createCommunicationEvent({
      messageId: message.id,
      eventType: "SENT",
      source: result.provider === "resend" ? "RESEND" : "SYSTEM",
      occurredAt: sentAt,
      metadata: { provider: result.provider },
    });

    if (!input.isTest && input.clientId) {
      await recordCommunicationSentActivity({
        clientId: input.clientId,
        userId: input.userId,
        messageId: message.id,
        templateKey: input.templateKey,
        subject: input.subject,
        recipientEmail: email,
      });
    }

    return {
      messageId: message.id,
      providerMessageId: result.id,
      status: "SENT",
      delivered: result.delivered,
      provider: result.provider,
    };
  } catch (error) {
    const failureReason = error instanceof Error ? error.message : "Send failed";
    const failedAt = new Date();
    await prisma.communicationMessage.update({
      where: { id: message.id },
      data: {
        status: "FAILED",
        failedAt,
        failureReason,
      },
    });
    await createCommunicationEvent({
      messageId: message.id,
      eventType: "FAILED",
      source: "STACKSCORE",
      occurredAt: failedAt,
      metadata: { reason: failureReason },
    });
    throw error;
  }
}

export async function createCommunicationEvent(input: {
  messageId: string;
  eventType: CommunicationEventType;
  source: CommunicationEventSource;
  occurredAt: Date;
  providerEventId?: string | null;
  url?: string | null;
  linkLabel?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<boolean> {
  if (input.providerEventId) {
    const existing = await prisma.communicationEvent.findUnique({
      where: { providerEventId: input.providerEventId },
    });
    if (existing) return false;
  }

  await prisma.communicationEvent.create({
    data: {
      communicationMessageId: input.messageId,
      eventType: input.eventType,
      providerEventId: input.providerEventId ?? null,
      source: input.source,
      occurredAt: input.occurredAt,
      url: maskSensitiveUrl(input.url),
      linkLabel: input.linkLabel ?? extractLinkLabel(input.url),
      userAgent: input.userAgent ?? null,
      metadataJson: (input.metadata ?? null) as Prisma.InputJsonValue,
    },
  });
  return true;
}

export async function applyCommunicationProviderEvent(input: {
  providerMessageId: string;
  eventType: CommunicationEventType;
  providerEventId: string;
  occurredAt: Date;
  url?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<{ matched: boolean; messageId?: string }> {
  const message = await prisma.communicationMessage.findUnique({
    where: { providerMessageId: input.providerMessageId },
  });

  if (!message) {
    console.warn("[communications/webhook] Unmatched provider message", {
      providerMessageId: input.providerMessageId,
      eventType: input.eventType,
    });
    return { matched: false };
  }

  const created = await createCommunicationEvent({
    messageId: message.id,
    eventType: input.eventType,
    source: "RESEND",
    occurredAt: input.occurredAt,
    providerEventId: input.providerEventId,
    url: input.url,
    userAgent: input.userAgent,
    metadata: input.metadata,
  });

  if (!created) {
    return { matched: true, messageId: message.id };
  }

  const nextStatus = deriveStatusFromEvent(message.status, input.eventType);
  const updates: Prisma.CommunicationMessageUpdateInput = {
    status: nextStatus,
  };

  if (input.eventType === "DELIVERED") {
    updates.deliveredAt = message.deliveredAt ?? input.occurredAt;
  }
  if (input.eventType === "OPENED") {
    updates.openCount = { increment: 1 };
    updates.firstOpenedAt = message.firstOpenedAt ?? input.occurredAt;
    updates.lastOpenedAt = input.occurredAt;
  }
  if (input.eventType === "CLICKED") {
    updates.clickCount = { increment: 1 };
    updates.firstClickedAt = message.firstClickedAt ?? input.occurredAt;
    updates.lastClickedAt = input.occurredAt;
  }
  if (input.eventType === "BOUNCED") {
    updates.bouncedAt = input.occurredAt;
    updates.failureReason =
      typeof input.metadata?.reason === "string" ? input.metadata.reason : "Email bounced";
  }
  if (input.eventType === "FAILED") {
    updates.failedAt = input.occurredAt;
    updates.failureReason =
      typeof input.metadata?.reason === "string" ? input.metadata.reason : "Email failed";
  }

  await prisma.communicationMessage.update({
    where: { id: message.id },
    data: updates,
  });

  if (!message.isTest) {
    const { syncCampaignRecipientFromMessageEvent } = await import(
      "@/lib/communications/outreach/campaign-sync"
    );
    await syncCampaignRecipientFromMessageEvent({
      messageId: message.id,
      eventType: input.eventType,
      occurredAt: input.occurredAt,
    });
  }

  return { matched: true, messageId: message.id };
}
