/**
 * SS-UX-015 — Manual customer project updates.
 * Reuses Communications render + recordAndSendCommunication.
 * Never auto-sends. Never invents activity.
 */

import type { Prisma } from "@/generated/prisma/client";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { buildProtectedAppUrl } from "@/lib/communications/links/build-protected-url";
import { getEmailTemplate } from "@/lib/communications/registry";
import { resolveRecipients } from "@/lib/communications/recipients/resolver";
import { recordAndSendCommunication } from "@/lib/communications/tracking/record-outbound";
import { getCommunicationBrandSettings } from "@/lib/communications/brand-settings";
import { prisma } from "@/lib/db";
import {
  applyDraftEdits,
  buildCustomerFacingUpdateSections,
  buildProjectUpdateDraft,
  draftHasSendableContent,
  type ProjectUpdateDraftPayload,
} from "@/lib/projects/customer-update-draft";
import { computeProjectProgress } from "@/lib/projects/progress";

export const PROJECT_CUSTOMER_UPDATE_TEMPLATE_KEY = "EMAIL-011";
export const PROJECT_CUSTOMER_UPDATE_EVENT_KEY = "PROJECT_CUSTOMER_UPDATE";

export type ProjectCustomerUpdateSnapshot = {
  customerFacing: ReturnType<typeof buildCustomerFacingUpdateSections>;
  email: {
    subject: string;
    previewText: string;
    html: string;
    text: string;
    paragraphs: string[];
    summaryItems: string[];
  };
  recipients: Array<{ email: string; name: string | null }>;
  draft: ProjectUpdateDraftPayload;
};

function asDraft(value: unknown): ProjectUpdateDraftPayload {
  return value as ProjectUpdateDraftPayload;
}

async function loadProjectContext(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      clientId: true,
      title: true,
      status: true,
      client: { select: { id: true, companyName: true, primaryContactEmail: true } },
      tasks: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          dueDate: true,
          completedAt: true,
        },
      },
      milestones: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          targetDate: true,
          completedAt: true,
        },
      },
    },
  });
}

async function lastPublishedAt(projectId: string): Promise<Date | null> {
  const previous = await prisma.projectCustomerUpdate.findFirst({
    where: { projectId, status: "sent", publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    select: { publishedAt: true },
  });
  return previous?.publishedAt ?? null;
}

async function loadStatusEventsSince(projectId: string, clientId: string, since: Date | null) {
  return prisma.organizationActivityEvent.findMany({
    where: {
      clientId,
      sourceRecordType: "Project",
      sourceRecordId: projectId,
      visibility: "CLIENT_VISIBLE",
      eventType: "project_status_changed",
      ...(since ? { occurredAt: { gt: since } } : {}),
    },
    orderBy: { occurredAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      occurredAt: true,
    },
  });
}

function serializeUpdate(row: {
  id: string;
  projectId: string;
  clientId: string;
  status: string;
  draftJson: unknown;
  snapshotJson: unknown;
  subject: string | null;
  previewText: string | null;
  publishedAt: Date | null;
  communicationMessageId: string | null;
  idempotencyKey: string | null;
  sentAt: Date | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  communicationMessage?: {
    id: string;
    status: string;
    recipientEmail: string;
    subject: string;
    sentAt: Date | null;
    deliveredAt: Date | null;
    failedAt: Date | null;
    failureReason: string | null;
    isTest: boolean;
  } | null;
}) {
  return {
    id: row.id,
    projectId: row.projectId,
    clientId: row.clientId,
    status: row.status,
    draft: asDraft(row.draftJson),
    snapshot: (row.snapshotJson as ProjectCustomerUpdateSnapshot | null) ?? null,
    subject: row.subject,
    previewText: row.previewText,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    communicationMessageId: row.communicationMessageId,
    idempotencyKey: row.idempotencyKey,
    sentAt: row.sentAt?.toISOString() ?? null,
    failureReason: row.failureReason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    delivery: row.communicationMessage
      ? {
          messageId: row.communicationMessage.id,
          status: row.communicationMessage.status,
          recipientEmail: row.communicationMessage.recipientEmail,
          subject: row.communicationMessage.subject,
          sentAt: row.communicationMessage.sentAt?.toISOString() ?? null,
          deliveredAt: row.communicationMessage.deliveredAt?.toISOString() ?? null,
          failedAt: row.communicationMessage.failedAt?.toISOString() ?? null,
          failureReason: row.communicationMessage.failureReason,
          isTest: row.communicationMessage.isTest,
        }
      : null,
  };
}

export async function listProjectCustomerUpdates(projectId: string) {
  const rows = await prisma.projectCustomerUpdate.findMany({
    where: { projectId },
    orderBy: [{ createdAt: "desc" }],
    include: {
      communicationMessage: {
        select: {
          id: true,
          status: true,
          recipientEmail: true,
          subject: true,
          sentAt: true,
          deliveredAt: true,
          failedAt: true,
          failureReason: true,
          isTest: true,
        },
      },
    },
  });
  return rows.map(serializeUpdate);
}

export async function getProjectCustomerUpdate(projectId: string, updateId: string) {
  const row = await prisma.projectCustomerUpdate.findFirst({
    where: { id: updateId, projectId },
    include: {
      communicationMessage: {
        select: {
          id: true,
          status: true,
          recipientEmail: true,
          subject: true,
          sentAt: true,
          deliveredAt: true,
          failedAt: true,
          failureReason: true,
          isTest: true,
        },
      },
    },
  });
  return row ? serializeUpdate(row) : null;
}

/** Published updates for customer portal (no draft/failed/recipient metadata). */
export async function listPublishedCustomerProjectUpdates(input: {
  projectId: string;
  clientId: string;
}) {
  const rows = await prisma.projectCustomerUpdate.findMany({
    where: {
      projectId: input.projectId,
      clientId: input.clientId,
      status: "sent",
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      publishedAt: true,
      subject: true,
      snapshotJson: true,
    },
  });

  return rows.map((row) => {
    const snapshot = row.snapshotJson as ProjectCustomerUpdateSnapshot;
    return {
      id: row.id,
      publishedAt: row.publishedAt!.toISOString(),
      subject: row.subject,
      customerFacing: snapshot.customerFacing,
    };
  });
}

export async function prepareProjectCustomerUpdate(
  projectId: string,
  actorUserId?: string | null,
) {
  const project = await loadProjectContext(projectId);
  if (!project) return null;

  const since = await lastPublishedAt(projectId);
  const statusEvents = await loadStatusEventsSince(projectId, project.clientId, since);
  const draft = buildProjectUpdateDraft({
    projectId: project.id,
    projectName: project.title,
    projectStatus: project.status,
    tasks: project.tasks,
    milestones: project.milestones,
    statusEvents,
    sincePublishedAt: since,
  });

  const row = await prisma.projectCustomerUpdate.create({
    data: {
      projectId: project.id,
      clientId: project.clientId,
      status: "draft",
      draftJson: draft as unknown as Prisma.InputJsonValue,
      createdByUserId: actorUserId ?? null,
    },
  });

  return serializeUpdate({ ...row, communicationMessage: null });
}

export async function updateProjectCustomerUpdateDraft(
  projectId: string,
  updateId: string,
  patch: Parameters<typeof applyDraftEdits>[1],
) {
  const existing = await prisma.projectCustomerUpdate.findFirst({
    where: { id: updateId, projectId },
  });
  if (!existing) return null;
  if (existing.status !== "draft" && existing.status !== "failed") {
    return { ok: false as const, error: "Only draft or failed updates can be edited" };
  }

  const nextDraft = applyDraftEdits(asDraft(existing.draftJson), patch);
  const row = await prisma.projectCustomerUpdate.update({
    where: { id: updateId },
    data: {
      draftJson: nextDraft as unknown as Prisma.InputJsonValue,
      status: "draft",
      failureReason: null,
    },
  });

  return { ok: true as const, update: serializeUpdate({ ...row, communicationMessage: null }) };
}

function buildEmailPayload(input: {
  draft: ProjectUpdateDraftPayload;
  organizationName: string;
  clientId: string;
  projectId: string;
  firstName?: string | null;
}) {
  const sections = buildCustomerFacingUpdateSections(input.draft);
  const paragraphs: string[] = [
    `Here is a progress update on ${sections.projectName} for ${input.organizationName}.`,
  ];

  if (sections.staffMessage) {
    paragraphs.push(sections.staffMessage);
  }

  if (sections.workCompleted.length > 0) {
    paragraphs.push(
      `Completed: ${sections.workCompleted.map((item) => item.title).join("; ")}.`,
    );
  }

  if (sections.inProgress.length > 0) {
    paragraphs.push(
      `In progress: ${sections.inProgress.map((item) => item.title).join("; ")}.`,
    );
  }

  if (sections.comingNext.length > 0) {
    paragraphs.push(
      `Coming next: ${sections.comingNext.map((item) => item.title).join("; ")}.`,
    );
  }

  paragraphs.push(
    "Sign in to StackScore for the full project workspace, including task details and milestones.",
  );

  const summaryItems = [
    `Project: ${sections.projectName}`,
    sections.projectStatusLabel ? `Status: ${sections.projectStatusLabel}` : "",
    sections.progressPercent !== null
      ? `Progress: ${sections.progressPercent}% (${sections.tasksCompleted}/${sections.tasksTotal} tasks)`
      : "",
    sections.nextMilestoneTitle
      ? `Next milestone: ${sections.nextMilestoneTitle}${
          sections.nextMilestoneTargetLabel
            ? ` (target ${sections.nextMilestoneTargetLabel})`
            : ""
        }`
      : "",
  ].filter(Boolean);

  return {
    sections,
    emailData: {
      heroTitle: "Project Progress Update",
      heroDescription: `${sections.projectName} — delivery update from Bobkat IT.`,
      previewText: `Progress update for ${sections.projectName}.`,
      paragraphs,
      summaryTitle: "Update Summary",
      summaryItems,
      primaryCta: {
        label: "View Project Workspace",
        href: buildProtectedAppUrl(
          `/clients/${input.clientId}/projects/${input.projectId}`,
        ),
      },
      founderClosing: true,
      firstName: input.firstName ?? undefined,
    },
  };
}

export async function previewProjectCustomerUpdate(projectId: string, updateId: string) {
  const existing = await prisma.projectCustomerUpdate.findFirst({
    where: { id: updateId, projectId },
  });
  if (!existing) return null;

  const project = await loadProjectContext(projectId);
  if (!project) return null;

  const draft = asDraft(existing.draftJson);
  if (!draftHasSendableContent(draft)) {
    return {
      ok: false as const,
      error: "Draft has no customer-visible content. Add a message or include activity items.",
    };
  }

  const recipients = await resolveRecipients({
    clientId: project.clientId,
    audience: "projects",
    templateKey: PROJECT_CUSTOMER_UPDATE_TEMPLATE_KEY,
  });

  const template = getEmailTemplate(PROJECT_CUSTOMER_UPDATE_TEMPLATE_KEY);
  if (!template) {
    return { ok: false as const, error: "EMAIL-011 template is not registered" };
  }

  const { sections, emailData } = buildEmailPayload({
    draft,
    organizationName: project.client.companyName,
    clientId: project.clientId,
    projectId: project.id,
  });

  const brand = await getCommunicationBrandSettings();
  const rendered = await template.render(emailData as Record<string, unknown>, { brand });

  return {
    ok: true as const,
    preview: {
      subject: rendered.subject,
      previewText: rendered.previewText,
      html: rendered.html,
      text: rendered.text,
      recipients: recipients.map((recipient) => ({
        email: recipient.email,
        name: recipient.name,
        source: recipient.source,
      })),
      customerFacing: sections,
      emptyActivity:
        draft.workCompleted.filter((item) => item.included).length === 0 &&
        draft.inProgress.filter((item) => item.included).length === 0 &&
        draft.comingNext.filter((item) => item.included).length === 0,
    },
  };
}

export async function sendProjectCustomerUpdate(input: {
  projectId: string;
  updateId: string;
  actorUserId?: string | null;
  /** Staging validation only — forces TEST send type and skips publish. */
  isTest?: boolean;
}) {
  const existing = await prisma.projectCustomerUpdate.findFirst({
    where: { id: input.updateId, projectId: input.projectId },
  });
  if (!existing) return null;
  if (existing.status === "sent" && existing.idempotencyKey) {
    return {
      ok: false as const,
      error: "This update was already sent",
      update: await getProjectCustomerUpdate(input.projectId, input.updateId),
    };
  }
  if (existing.status !== "draft" && existing.status !== "failed") {
    return { ok: false as const, error: `Cannot send update in status ${existing.status}` };
  }

  const project = await loadProjectContext(input.projectId);
  if (!project) return null;

  const draft = asDraft(existing.draftJson);
  if (!draftHasSendableContent(draft)) {
    return {
      ok: false as const,
      error: "Draft has no customer-visible content. Add a message or include activity items.",
    };
  }

  const recipients = await resolveRecipients({
    clientId: project.clientId,
    audience: "projects",
    templateKey: PROJECT_CUSTOMER_UPDATE_TEMPLATE_KEY,
  });
  const primary = recipients[0];
  if (!primary?.email) {
    return {
      ok: false as const,
      error: "No valid client recipient resolved for this project update",
    };
  }

  // Server-side ownership: recipient must belong to resolved client set only.
  const allowed = new Set(recipients.map((recipient) => recipient.email.toLowerCase()));
  if (!allowed.has(primary.email.toLowerCase())) {
    return { ok: false as const, error: "Recipient failed ownership validation" };
  }

  const template = getEmailTemplate(PROJECT_CUSTOMER_UPDATE_TEMPLATE_KEY);
  if (!template) {
    return { ok: false as const, error: "EMAIL-011 template is not registered" };
  }

  const { sections, emailData } = buildEmailPayload({
    draft,
    organizationName: project.client.companyName,
    clientId: project.clientId,
    projectId: project.id,
    firstName: primary.name?.split(/\s+/)[0] ?? null,
  });

  const brand = await getCommunicationBrandSettings();
  const rendered = await template.render(emailData as Record<string, unknown>, { brand });
  const idempotencyKey = `project-customer-update:${input.updateId}`;

  await prisma.projectCustomerUpdate.update({
    where: { id: input.updateId },
    data: {
      status: "sending",
      subject: rendered.subject,
      previewText: rendered.previewText,
      idempotencyKey,
      failureReason: null,
    },
  });

  try {
    const result = await recordAndSendCommunication({
      to: primary.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      previewText: rendered.previewText,
      templateKey: PROJECT_CUSTOMER_UPDATE_TEMPLATE_KEY,
      eventKey: PROJECT_CUSTOMER_UPDATE_EVENT_KEY,
      sendType: input.isTest ? "TEST" : "MANUAL",
      isTest: Boolean(input.isTest),
      idempotencyKey: input.isTest ? null : idempotencyKey,
      clientId: project.clientId,
      projectId: project.id,
      createdByUserId: input.actorUserId ?? null,
      recipientName: primary.name,
      relatedEntityType: "ProjectCustomerUpdate",
      relatedEntityId: input.updateId,
      metadata: {
        projectCustomerUpdateId: input.updateId,
        progressPercent: computeProjectProgress(project.tasks).progressPercent,
      },
    });

    const snapshot: ProjectCustomerUpdateSnapshot = {
      customerFacing: sections,
      email: {
        subject: rendered.subject,
        previewText: rendered.previewText,
        html: rendered.html,
        text: rendered.text,
        paragraphs: emailData.paragraphs,
        summaryItems: emailData.summaryItems,
      },
      recipients: recipients.map((recipient) => ({
        email: recipient.email,
        name: recipient.name,
      })),
      draft,
    };

    const now = new Date();
    const updated = await prisma.projectCustomerUpdate.update({
      where: { id: input.updateId },
      data: {
        status: "sent",
        snapshotJson: snapshot as unknown as Prisma.InputJsonValue,
        subject: rendered.subject,
        previewText: rendered.previewText,
        communicationMessageId: result.messageId,
        publishedAt: input.isTest ? null : now,
        sentAt: now,
        sentByUserId: input.actorUserId ?? null,
        failureReason: null,
      },
    });

    if (!input.isTest) {
      await recordOrganizationActivity({
        clientId: project.clientId,
        category: "PROJECT",
        eventType: "project_customer_update_published",
        title: `Project update published: ${project.title}`,
        description: rendered.subject,
        visibility: "CLIENT_VISIBLE",
        actorUserId: input.actorUserId ?? null,
        sourceRecordType: "Project",
        sourceRecordId: project.id,
        metadata: {
          projectCustomerUpdateId: input.updateId,
          communicationMessageId: result.messageId,
        },
      });
    }

    return {
      ok: true as const,
      update: serializeUpdate({ ...updated, communicationMessage: null }),
      messageId: result.messageId,
      providerStatus: result.status,
      deliveredConfirmed: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Send failed";
    const failed = await prisma.projectCustomerUpdate.update({
      where: { id: input.updateId },
      data: {
        status: "failed",
        failureReason: message,
      },
    });
    return {
      ok: false as const,
      error: message,
      update: serializeUpdate({ ...failed, communicationMessage: null }),
    };
  }
}

export async function cancelProjectCustomerUpdate(projectId: string, updateId: string) {
  const existing = await prisma.projectCustomerUpdate.findFirst({
    where: { id: updateId, projectId },
  });
  if (!existing) return null;
  if (existing.status === "sent" || existing.status === "sending") {
    return { ok: false as const, error: "Cannot cancel a sent or in-flight update" };
  }
  const row = await prisma.projectCustomerUpdate.update({
    where: { id: updateId },
    data: { status: "cancelled" },
  });
  return { ok: true as const, update: serializeUpdate({ ...row, communicationMessage: null }) };
}
