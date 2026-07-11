import type { NotificationDeliveryMode, Prisma } from "@/generated/prisma/client";
import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import { prisma } from "@/lib/db";

export type WorkflowCtaDestinations = Partial<
  Record<
    string,
    {
      primary?: string;
      secondary?: string;
    }
  >
>;

export type WorkflowRecipientDefaults = Partial<
  Record<
    string,
    {
      primaryContact?: boolean;
      assessmentOwner?: boolean;
      organizationUsers?: boolean;
      executiveContacts?: boolean;
      consultant?: boolean;
      additionalEmails?: string[];
    }
  >
>;

export type AttachmentDefaults = Partial<
  Record<
    string,
    {
      attachExecutiveReport?: boolean;
      attachProposalPdf?: boolean;
      attachRoadmapPdf?: boolean;
    }
  >
>;

export type CommunicationWorkflowSettingsRecord = {
  defaultSenderEmail: string | null;
  defaultReplyToEmail: string | null;
  recipientDefaults: WorkflowRecipientDefaults;
  ctaDestinations: WorkflowCtaDestinations;
  internalNotificationEmails: string[];
  proposalApprovalNotificationEmail: string;
  quarterlyReviewDaysAfterAssessment: number;
  quarterlyReviewLeadDays: number;
  attachmentDefaults: AttachmentDefaults;
  projectCompletionDefault: NotificationDeliveryMode;
};

const DEFAULT_SETTINGS: CommunicationWorkflowSettingsRecord = {
  defaultSenderEmail: null,
  defaultReplyToEmail: null,
  recipientDefaults: {},
  ctaDestinations: {
    "EMAIL-009": { primary: "/assessment-invitation" },
  },
  internalNotificationEmails: [],
  proposalApprovalNotificationEmail: "bobby@bobkatit.com",
  quarterlyReviewDaysAfterAssessment: 90,
  quarterlyReviewLeadDays: 14,
  attachmentDefaults: {
    "EMAIL-002": { attachExecutiveReport: true },
    "EMAIL-004": { attachProposalPdf: true },
    "EMAIL-003": { attachRoadmapPdf: true },
  },
  projectCompletionDefault: "automatic",
};

function parseJsonObject<T>(value: Prisma.JsonValue, fallback: T): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  return value as T;
}

function parseJsonStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function mapRecord(record: {
  defaultSenderEmail: string | null;
  defaultReplyToEmail: string | null;
  recipientDefaultsJson: Prisma.JsonValue;
  ctaDestinationsJson: Prisma.JsonValue;
  internalNotificationEmailsJson: Prisma.JsonValue;
  proposalApprovalNotificationEmail: string;
  quarterlyReviewDaysAfterAssessment: number;
  quarterlyReviewLeadDays: number;
  attachmentDefaultsJson: Prisma.JsonValue;
  projectCompletionDefault: NotificationDeliveryMode;
}): CommunicationWorkflowSettingsRecord {
  return {
    defaultSenderEmail: record.defaultSenderEmail,
    defaultReplyToEmail: record.defaultReplyToEmail,
    recipientDefaults: parseJsonObject(record.recipientDefaultsJson, {}),
    ctaDestinations: parseJsonObject(record.ctaDestinationsJson, DEFAULT_SETTINGS.ctaDestinations),
    internalNotificationEmails: parseJsonStringArray(record.internalNotificationEmailsJson),
    proposalApprovalNotificationEmail: record.proposalApprovalNotificationEmail,
    quarterlyReviewDaysAfterAssessment: record.quarterlyReviewDaysAfterAssessment,
    quarterlyReviewLeadDays: record.quarterlyReviewLeadDays,
    attachmentDefaults: parseJsonObject(record.attachmentDefaultsJson, DEFAULT_SETTINGS.attachmentDefaults),
    projectCompletionDefault: record.projectCompletionDefault,
  };
}

export async function getCommunicationWorkflowSettings(): Promise<CommunicationWorkflowSettingsRecord> {
  const record = await withCommunicationDbFallback(
    () => prisma.communicationWorkflowSettings.findUnique({ where: { id: "default" } }),
    null,
  );
  if (!record) return DEFAULT_SETTINGS;
  return mapRecord(record);
}

export async function upsertCommunicationWorkflowSettings(
  input: Partial<CommunicationWorkflowSettingsRecord>,
  updatedByUserId?: string,
): Promise<CommunicationWorkflowSettingsRecord> {
  const current = await getCommunicationWorkflowSettings();
  const merged: CommunicationWorkflowSettingsRecord = {
    ...current,
    ...input,
    recipientDefaults: { ...current.recipientDefaults, ...input.recipientDefaults },
    ctaDestinations: { ...current.ctaDestinations, ...input.ctaDestinations },
    attachmentDefaults: { ...current.attachmentDefaults, ...input.attachmentDefaults },
  };

  const record = await prisma.communicationWorkflowSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      defaultSenderEmail: merged.defaultSenderEmail,
      defaultReplyToEmail: merged.defaultReplyToEmail,
      recipientDefaultsJson: merged.recipientDefaults as Prisma.InputJsonValue,
      ctaDestinationsJson: merged.ctaDestinations as Prisma.InputJsonValue,
      internalNotificationEmailsJson: merged.internalNotificationEmails as Prisma.InputJsonValue,
      proposalApprovalNotificationEmail: merged.proposalApprovalNotificationEmail,
      quarterlyReviewDaysAfterAssessment: merged.quarterlyReviewDaysAfterAssessment,
      quarterlyReviewLeadDays: merged.quarterlyReviewLeadDays,
      attachmentDefaultsJson: merged.attachmentDefaults as Prisma.InputJsonValue,
      projectCompletionDefault: merged.projectCompletionDefault,
      updatedByUserId: updatedByUserId ?? null,
    },
    update: {
      defaultSenderEmail: merged.defaultSenderEmail,
      defaultReplyToEmail: merged.defaultReplyToEmail,
      recipientDefaultsJson: merged.recipientDefaults as Prisma.InputJsonValue,
      ctaDestinationsJson: merged.ctaDestinations as Prisma.InputJsonValue,
      internalNotificationEmailsJson: merged.internalNotificationEmails as Prisma.InputJsonValue,
      proposalApprovalNotificationEmail: merged.proposalApprovalNotificationEmail,
      quarterlyReviewDaysAfterAssessment: merged.quarterlyReviewDaysAfterAssessment,
      quarterlyReviewLeadDays: merged.quarterlyReviewLeadDays,
      attachmentDefaultsJson: merged.attachmentDefaults as Prisma.InputJsonValue,
      projectCompletionDefault: merged.projectCompletionDefault,
      updatedByUserId: updatedByUserId ?? null,
    },
  });

  return mapRecord(record);
}

export function resolveCtaDestination(
  settings: CommunicationWorkflowSettingsRecord,
  templateKey: string,
  slot: "primary" | "secondary",
  fallbackPath: string,
): string {
  return settings.ctaDestinations[templateKey]?.[slot] ?? fallbackPath;
}
