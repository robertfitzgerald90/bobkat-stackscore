import type {
  OrganizationActivityCategory,
  OrganizationActivityVisibility,
  Prisma,
} from "@/generated/prisma/client";
import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import { prisma } from "@/lib/db";

export type RecordActivityInput = {
  clientId: string;
  userId?: string | null;
  category: OrganizationActivityCategory;
  eventType: string;
  title: string;
  description?: string | null;
  occurredAt?: Date;
  source?: string;
  sourceRecordType?: string | null;
  sourceRecordId?: string | null;
  visibility?: OrganizationActivityVisibility;
  actorUserId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function recordOrganizationActivity(
  input: RecordActivityInput,
): Promise<void> {
  await withCommunicationDbFallback(
    () =>
      prisma.organizationActivityEvent.create({
        data: {
          clientId: input.clientId,
          userId: input.userId ?? null,
          category: input.category,
          eventType: input.eventType,
          title: input.title,
          description: input.description ?? null,
          occurredAt: input.occurredAt ?? new Date(),
          source: input.source ?? "STACKSCORE",
          sourceRecordType: input.sourceRecordType ?? null,
          sourceRecordId: input.sourceRecordId ?? null,
          visibility: input.visibility ?? "INTERNAL",
          actorUserId: input.actorUserId ?? null,
          metadataJson: (input.metadata ?? null) as Prisma.InputJsonValue,
        },
      }),
    undefined,
  );
}

export async function recordCommunicationSentActivity(input: {
  clientId: string;
  userId?: string | null;
  messageId: string;
  templateKey: string;
  subject: string;
  recipientEmail: string;
  visibility?: OrganizationActivityVisibility;
}): Promise<void> {
  await recordOrganizationActivity({
    clientId: input.clientId,
    userId: input.userId,
    category: "COMMUNICATIONS",
    eventType: "communication_sent",
    title: `${input.templateKey} sent`,
    description: `${input.subject} delivered to ${input.recipientEmail}`,
    source: "STACKSCORE",
    sourceRecordType: "CommunicationMessage",
    sourceRecordId: input.messageId,
    visibility: input.visibility ?? "CLIENT_VISIBLE",
    metadata: {
      templateKey: input.templateKey,
      subject: input.subject,
    },
  });
}

export async function recordAccountActivatedActivity(input: {
  clientId: string;
  userId: string;
  email: string;
}): Promise<void> {
  await recordOrganizationActivity({
    clientId: input.clientId,
    userId: input.userId,
    category: "ACCOUNT",
    eventType: "account_activated",
    title: "Account activated",
    description: `${input.email} activated their StackScore account.`,
    source: "STACKSCORE",
    sourceRecordType: "User",
    sourceRecordId: input.userId,
    visibility: "CLIENT_VISIBLE",
  });
}

export async function recordAssessmentCompletedActivity(input: {
  clientId: string;
  assessmentId: string;
  assessmentName: string;
  actorUserId?: string | null;
}): Promise<void> {
  await recordOrganizationActivity({
    clientId: input.clientId,
    category: "ASSESSMENT",
    eventType: "assessment_completed",
    title: "Assessment completed",
    description: `${input.assessmentName} was completed.`,
    source: "STACKSCORE",
    sourceRecordType: "Assessment",
    sourceRecordId: input.assessmentId,
    visibility: "CLIENT_VISIBLE",
    actorUserId: input.actorUserId ?? null,
  });
}

export async function recordAssessmentStartedActivity(input: {
  clientId: string;
  assessmentId: string;
  assessmentName: string;
  userId?: string | null;
}): Promise<void> {
  await recordOrganizationActivity({
    clientId: input.clientId,
    userId: input.userId,
    category: "ASSESSMENT",
    eventType: "assessment_started",
    title: "Assessment started",
    description: `${input.assessmentName} was started.`,
    source: "STACKSCORE",
    sourceRecordType: "Assessment",
    sourceRecordId: input.assessmentId,
    visibility: "CLIENT_VISIBLE",
  });
}

export type ActivityFeedItem = {
  id: string;
  clientId: string;
  clientName: string;
  category: OrganizationActivityCategory;
  eventType: string;
  title: string;
  description: string | null;
  occurredAt: string;
  href: string | null;
};

export async function getRecentOrganizationActivity(limit = 8): Promise<ActivityFeedItem[]> {
  return withCommunicationDbFallback(async () => {
    const records = await prisma.organizationActivityEvent.findMany({
      orderBy: { occurredAt: "desc" },
      take: limit,
      include: {
        client: { select: { id: true, companyName: true } },
      },
    });

    return records.map((record) => ({
      id: record.id,
      clientId: record.clientId,
      clientName: record.client.companyName,
      category: record.category,
      eventType: record.eventType,
      title: record.title,
      description: record.description,
      occurredAt: record.occurredAt.toISOString(),
      href: buildActivityHref(record),
    }));
  }, []);
}

function buildActivityHref(record: {
  clientId: string;
  sourceRecordType: string | null;
  sourceRecordId: string | null;
  category: OrganizationActivityCategory;
}): string | null {
  if (record.sourceRecordType === "CommunicationMessage" && record.sourceRecordId) {
    return `/admin/communications/history/${record.sourceRecordId}`;
  }
  if (record.sourceRecordType === "Assessment" && record.sourceRecordId) {
    return `/assessments/${record.sourceRecordId}`;
  }
  if (record.category === "COMMUNICATIONS") {
    return `/admin/communications/history`;
  }
  return `/clients/${record.clientId}/activity`;
}

export async function getClientActivityTimeline(
  clientId: string,
  options: { includeInternal?: boolean; limit?: number } = {},
) {
  const limit = options.limit ?? 50;
  return withCommunicationDbFallback(async () => {
    const records = await prisma.organizationActivityEvent.findMany({
      where: {
        clientId,
        ...(options.includeInternal
          ? {}
          : { visibility: "CLIENT_VISIBLE" as OrganizationActivityVisibility }),
      },
      orderBy: { occurredAt: "desc" },
      take: limit,
    });

    return records.map((record) => ({
      id: record.id,
      category: record.category,
      eventType: record.eventType,
      title: record.title,
      description: record.description,
      occurredAt: record.occurredAt.toISOString(),
      visibility: record.visibility,
      source: record.source,
      sourceRecordType: record.sourceRecordType,
      sourceRecordId: record.sourceRecordId,
    }));
  }, []);
}
