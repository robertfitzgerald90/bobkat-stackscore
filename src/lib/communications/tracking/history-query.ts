import type { CommunicationMessageStatus, Prisma } from "@/generated/prisma/client";
import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import { getEmailTemplate } from "@/lib/communications/registry";
import { statusLabel } from "@/lib/communications/tracking/status";
import { maskSensitiveUrl } from "@/lib/communications/tracking/url-sanitize";
import { prisma } from "@/lib/db";

export type CommunicationHistoryFilters = {
  query?: string;
  status?: CommunicationMessageStatus | "all";
  templateKey?: string | "all";
  clientId?: string | "all";
  isTest?: "all" | "production" | "test";
  opened?: "all" | "yes" | "no";
  clicked?: "all" | "yes" | "no";
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "sentAt" | "createdAt" | "recipientEmail" | "subject" | "status";
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type CommunicationHistoryRow = {
  id: string;
  sentAt: string | null;
  recipientEmail: string;
  recipientName: string | null;
  organizationName: string | null;
  clientId: string | null;
  templateKey: string;
  templateName: string;
  subject: string;
  status: CommunicationMessageStatus;
  statusLabel: string;
  deliveredAt: string | null;
  openCount: number;
  clickCount: number;
  relatedRecord: string | null;
  sentByName: string | null;
  isTest: boolean;
  lastActivityAt: string | null;
  providerMessageId: string | null;
};

export async function queryCommunicationHistory(filters: CommunicationHistoryFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 25));
  const skip = (page - 1) * limit;
  const sortBy = filters.sortBy ?? "sentAt";
  const sortDir = filters.sortDir ?? "desc";

  const where: Prisma.CommunicationMessageWhereInput = {};

  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }
  if (filters.templateKey && filters.templateKey !== "all") {
    where.templateKey = filters.templateKey;
  }
  if (filters.clientId && filters.clientId !== "all") {
    where.clientId = filters.clientId;
  }
  if (filters.isTest === "production") {
    where.isTest = false;
  } else if (filters.isTest === "test") {
    where.isTest = true;
  }
  if (filters.opened === "yes") {
    where.openCount = { gt: 0 };
  } else if (filters.opened === "no") {
    where.openCount = 0;
  }
  if (filters.clicked === "yes") {
    where.clickCount = { gt: 0 };
  } else if (filters.clicked === "no") {
    where.clickCount = 0;
  }
  if (filters.dateFrom || filters.dateTo) {
    where.sentAt = {};
    if (filters.dateFrom) where.sentAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.sentAt.lte = new Date(filters.dateTo);
  }

  const query = filters.query?.trim();
  if (query) {
    where.OR = [
      { recipientEmail: { contains: query, mode: "insensitive" } },
      { recipientName: { contains: query, mode: "insensitive" } },
      { subject: { contains: query, mode: "insensitive" } },
      { templateKey: { contains: query, mode: "insensitive" } },
      { providerMessageId: { contains: query, mode: "insensitive" } },
      { id: { contains: query, mode: "insensitive" } },
      { client: { companyName: { contains: query, mode: "insensitive" } } },
    ];
  }

  return withCommunicationDbFallback(async () => {
    const [total, records] = await Promise.all([
      prisma.communicationMessage.count({ where }),
      prisma.communicationMessage.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip,
        take: limit,
        include: {
          client: { select: { id: true, companyName: true } },
          createdBy: { select: { name: true } },
          assessment: { select: { id: true, assessmentName: true } },
          project: { select: { id: true, title: true } },
        },
      }),
    ]);

    const rows: CommunicationHistoryRow[] = records.map((record) => ({
      id: record.id,
      sentAt: record.sentAt?.toISOString() ?? null,
      recipientEmail: record.recipientEmail,
      recipientName: record.recipientName,
      organizationName: record.client?.companyName ?? null,
      clientId: record.clientId,
      templateKey: record.templateKey,
      templateName: getEmailTemplate(record.templateKey)?.name ?? record.templateKey,
      subject: record.subject,
      status: record.status,
      statusLabel: statusLabel(record.status),
      deliveredAt: record.deliveredAt?.toISOString() ?? null,
      openCount: record.openCount,
      clickCount: record.clickCount,
      relatedRecord: record.assessment
        ? `Assessment: ${record.assessment.assessmentName}`
        : record.project
          ? `Project: ${record.project.title}`
          : null,
      sentByName: record.createdBy?.name ?? null,
      isTest: record.isTest,
      lastActivityAt: (
        record.lastClickedAt ??
        record.lastOpenedAt ??
        record.deliveredAt ??
        record.sentAt ??
        record.createdAt
      ).toISOString(),
      providerMessageId: record.providerMessageId,
    }));

    return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }, { rows: [], total: 0, page, limit, totalPages: 0 });
}

export async function getCommunicationMessageDetail(messageId: string) {
  return withCommunicationDbFallback(async () => {
    const message = await prisma.communicationMessage.findUnique({
      where: { id: messageId },
      include: {
        client: { select: { id: true, companyName: true } },
        user: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        assessment: { select: { id: true, assessmentName: true } },
        project: { select: { id: true, title: true } },
        events: { orderBy: { occurredAt: "asc" } },
      },
    });
    if (!message) return null;

    const clickedLinks = message.events
      .filter((event) => event.eventType === "CLICKED" && event.url)
      .reduce(
        (acc, event) => {
          const key = event.url ?? "unknown";
          const existing = acc.get(key);
          if (existing) {
            existing.count += 1;
            existing.lastClickedAt = event.occurredAt.toISOString();
          } else {
            acc.set(key, {
              url: maskSensitiveUrl(event.url) ?? event.url ?? "",
              label: event.linkLabel,
              firstClickedAt: event.occurredAt.toISOString(),
              lastClickedAt: event.occurredAt.toISOString(),
              count: 1,
            });
          }
          return acc;
        },
        new Map<
          string,
          {
            url: string;
            label: string | null;
            firstClickedAt: string;
            lastClickedAt: string;
            count: number;
          }
        >(),
      );

    return {
      ...message,
      templateName: getEmailTemplate(message.templateKey)?.name ?? message.templateKey,
      statusLabel: statusLabel(message.status),
      clickedLinks: [...clickedLinks.values()],
      events: message.events.map((event) => ({
        id: event.id,
        eventType: event.eventType,
        source: event.source,
        occurredAt: event.occurredAt.toISOString(),
        url: maskSensitiveUrl(event.url),
        linkLabel: event.linkLabel,
        metadataJson: event.metadataJson,
      })),
      metadataJson: message.metadataJson,
    };
  }, null);
}
