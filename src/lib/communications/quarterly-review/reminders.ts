import { getCommunicationWorkflowSettings } from "@/lib/communications/settings/workflow-settings";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { prisma } from "@/lib/db";

function buildIdempotencyKey(clientId: string, dueAt: Date) {
  return `${clientId}:${dueAt.toISOString().slice(0, 10)}`;
}

export async function scanQuarterlyReviewReminders() {
  const settings = await getCommunicationWorkflowSettings();
  const now = new Date();
  const leadMs = settings.quarterlyReviewLeadDays * 24 * 60 * 60 * 1000;

  const clients = await prisma.client.findMany({
    where: {
      quarterlyReviewAnchorAt: { not: null },
      status: { in: ["active", "prospect"] },
    },
    select: {
      id: true,
      companyName: true,
      quarterlyReviewAnchorAt: true,
    },
  });

  let created = 0;

  for (const client of clients) {
    if (!client.quarterlyReviewAnchorAt) continue;
    const dueAt = new Date(client.quarterlyReviewAnchorAt);
    dueAt.setDate(dueAt.getDate() + settings.quarterlyReviewDaysAfterAssessment);

    const windowStart = new Date(dueAt.getTime() - leadMs);
    if (now < windowStart || now > new Date(dueAt.getTime() + 30 * 24 * 60 * 60 * 1000)) {
      continue;
    }

    const idempotencyKey = buildIdempotencyKey(client.id, dueAt);
    const existing = await prisma.quarterlyReviewReminder.findUnique({
      where: { idempotencyKey },
    });
    if (existing) continue;

    await prisma.quarterlyReviewReminder.create({
      data: {
        clientId: client.id,
        dueAt,
        status: "pending",
        lastAssessmentCompletedAt: client.quarterlyReviewAnchorAt,
        idempotencyKey,
      },
    });

    await recordOrganizationActivity({
      clientId: client.id,
      category: "TECHNOLOGY",
      eventType: "quarterly_review_due",
      title: "Business review due",
      description: `Business Review due around ${dueAt.toLocaleDateString()}.`,
      visibility: "INTERNAL",
    });

    created += 1;
  }

  return { created, scanned: clients.length };
}

export async function listQuarterlyReviewReminders(limit = 20) {
  return prisma.quarterlyReviewReminder.findMany({
    where: { status: { in: ["pending", "scheduled", "delayed"] } },
    orderBy: [{ dueAt: "asc" }],
    take: limit,
    include: {
      client: { select: { companyName: true } },
    },
  });
}

export async function actOnQuarterlyReviewReminder(input: {
  reminderId: string;
  action: "send" | "schedule" | "delay" | "dismiss";
  actorUserId: string;
  scheduledFor?: Date;
  dismissReason?: string;
}) {
  const reminder = await prisma.quarterlyReviewReminder.findUnique({
    where: { id: input.reminderId },
    include: { client: true },
  });
  if (!reminder) throw new Error("Reminder not found");

  if (input.action === "dismiss") {
    return prisma.quarterlyReviewReminder.update({
      where: { id: reminder.id },
      data: {
        status: "dismissed",
        dismissedAt: new Date(),
        dismissReason: input.dismissReason ?? null,
      },
    });
  }

  if (input.action === "delay") {
    const delayedUntil = new Date();
    delayedUntil.setDate(delayedUntil.getDate() + 30);
    return prisma.quarterlyReviewReminder.update({
      where: { id: reminder.id },
      data: {
        status: "delayed",
        delayedUntil,
      },
    });
  }

  const { enqueueCommunication } = await import("@/lib/communications/queue/service");
  const { buildQuarterlyReviewEmailData } = await import("@/lib/communications/workflows/email-data");
  const payload = await buildQuarterlyReviewEmailData({
    clientId: reminder.clientId,
    organizationName: reminder.client.companyName,
  });

  const queueItem = await enqueueCommunication({
    workflowKey: "quarterly_review",
    clientId: reminder.clientId,
    payload,
    createdByUserId: input.actorUserId,
    reviewRequired: true,
    autoSend: input.action === "send",
    scheduledFor: input.action === "schedule" ? input.scheduledFor ?? null : null,
  });

  return prisma.quarterlyReviewReminder.update({
    where: { id: reminder.id },
    data: {
      status: input.action === "schedule" ? "scheduled" : "sent",
      scheduledFor: input.action === "schedule" ? input.scheduledFor ?? null : null,
      queueItemId: queueItem?.id ?? null,
    },
  });
}
