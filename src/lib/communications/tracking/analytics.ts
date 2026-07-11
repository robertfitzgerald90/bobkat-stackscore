import type { Prisma } from "@/generated/prisma/client";
import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import { getEmailTemplate } from "@/lib/communications/registry";
import { prisma } from "@/lib/db";

export type AnalyticsFilters = {
  dateFrom?: string;
  dateTo?: string;
  templateKey?: string | "all";
  clientId?: string | "all";
  isTest?: boolean;
};

export type CommunicationAnalyticsSummary = {
  messagesSent: number;
  deliveredCount: number;
  uniqueOpened: number;
  uniqueClicked: number;
  bouncedCount: number;
  failedCount: number;
  deliveryRate: number | null;
  openRate: number | null;
  clickRate: number | null;
  bounceRate: number | null;
  failureRate: number | null;
  activationsAttributed: number;
  assessmentsStarted: number;
  assessmentsCompleted: number;
};

function buildMessageWhere(filters: AnalyticsFilters): Prisma.CommunicationMessageWhereInput {
  const where: Prisma.CommunicationMessageWhereInput = {
    isTest: filters.isTest ?? false,
  };
  if (filters.templateKey && filters.templateKey !== "all") {
    where.templateKey = filters.templateKey;
  }
  if (filters.clientId && filters.clientId !== "all") {
    where.clientId = filters.clientId;
  }
  if (filters.dateFrom || filters.dateTo) {
    where.sentAt = {};
    if (filters.dateFrom) where.sentAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.sentAt.lte = new Date(filters.dateTo);
  }
  return where;
}

function rate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export async function getCommunicationAnalyticsSummary(
  filters: AnalyticsFilters = {},
): Promise<CommunicationAnalyticsSummary> {
  return withCommunicationDbFallback(async () => {
    const where = buildMessageWhere(filters);

    const [
      messagesSent,
      deliveredCount,
      uniqueOpened,
      uniqueClicked,
      bouncedCount,
      failedCount,
      activationsAttributed,
      assessmentsStarted,
      assessmentsCompleted,
    ] = await Promise.all([
      prisma.communicationMessage.count({ where: { ...where, status: { not: "DRAFT" } } }),
      prisma.communicationMessage.count({
        where: { ...where, deliveredAt: { not: null } },
      }),
      prisma.communicationMessage.count({
        where: { ...where, firstOpenedAt: { not: null } },
      }),
      prisma.communicationMessage.count({
        where: { ...where, firstClickedAt: { not: null } },
      }),
      prisma.communicationMessage.count({
        where: { ...where, status: "BOUNCED" },
      }),
      prisma.communicationMessage.count({
        where: { ...where, status: "FAILED" },
      }),
      prisma.organizationActivityEvent.count({
        where: {
          eventType: "account_activated",
          ...(filters.clientId && filters.clientId !== "all"
            ? { clientId: filters.clientId }
            : {}),
          ...(filters.dateFrom || filters.dateTo
            ? {
                occurredAt: {
                  ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
                  ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
                },
              }
            : {}),
        },
      }),
      prisma.organizationActivityEvent.count({
        where: {
          eventType: "assessment_started",
          ...(filters.clientId && filters.clientId !== "all"
            ? { clientId: filters.clientId }
            : {}),
        },
      }),
      prisma.organizationActivityEvent.count({
        where: {
          eventType: "assessment_completed",
          ...(filters.clientId && filters.clientId !== "all"
            ? { clientId: filters.clientId }
            : {}),
        },
      }),
    ]);

    return {
      messagesSent,
      deliveredCount,
      uniqueOpened,
      uniqueClicked,
      bouncedCount,
      failedCount,
      deliveryRate: rate(deliveredCount, messagesSent),
      openRate: rate(uniqueOpened, deliveredCount),
      clickRate: rate(uniqueClicked, deliveredCount),
      bounceRate: rate(bouncedCount, messagesSent),
      failureRate: rate(failedCount, messagesSent),
      activationsAttributed,
      assessmentsStarted,
      assessmentsCompleted,
    };
  }, {
    messagesSent: 0,
    deliveredCount: 0,
    uniqueOpened: 0,
    uniqueClicked: 0,
    bouncedCount: 0,
    failedCount: 0,
    deliveryRate: null,
    openRate: null,
    clickRate: null,
    bounceRate: null,
    failureRate: null,
    activationsAttributed: 0,
    assessmentsStarted: 0,
    assessmentsCompleted: 0,
  });
}

export async function getMessagesSentOverTime(filters: AnalyticsFilters = {}) {
  return withCommunicationDbFallback(async () => {
    const where = buildMessageWhere(filters);
    const messages = await prisma.communicationMessage.findMany({
      where: { ...where, sentAt: { not: null } },
      select: { sentAt: true },
      orderBy: { sentAt: "asc" },
    });

    const buckets = new Map<string, number>();
    for (const message of messages) {
      if (!message.sentAt) continue;
      const key = message.sentAt.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return [...buckets.entries()].map(([date, count]) => ({ date, count }));
  }, []);
}

export async function getTemplatePerformance(filters: AnalyticsFilters = {}) {
  return withCommunicationDbFallback(async () => {
    const where = buildMessageWhere(filters);
    const grouped = await prisma.communicationMessage.groupBy({
      by: ["templateKey"],
      where,
      _count: { _all: true },
      _sum: { openCount: true, clickCount: true },
    });

    return grouped
      .map((row) => ({
        templateKey: row.templateKey,
        templateName: getEmailTemplate(row.templateKey)?.name ?? row.templateKey,
        sent: row._count._all,
        opens: row._sum.openCount ?? 0,
        clicks: row._sum.clickCount ?? 0,
      }))
      .sort((a, b) => b.sent - a.sent);
  }, []);
}

export async function getRecentDeliveryFailures(limit = 6) {
  return withCommunicationDbFallback(async () => {
    const records = await prisma.communicationMessage.findMany({
      where: {
        isTest: false,
        status: { in: ["FAILED", "BOUNCED"] },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: { client: { select: { companyName: true } } },
    });
    return records.map((record) => ({
      id: record.id,
      subject: record.subject,
      recipientEmail: record.recipientEmail,
      organizationName: record.client?.companyName ?? null,
      status: record.status,
      failureReason: record.failureReason,
      occurredAt: (record.failedAt ?? record.bouncedAt ?? record.updatedAt).toISOString(),
    }));
  }, []);
}

export async function getMostClickedLinks(filters: AnalyticsFilters = {}, limit = 8) {
  return withCommunicationDbFallback(async () => {
    const where = buildMessageWhere(filters);
    const events = await prisma.communicationEvent.findMany({
      where: {
        eventType: "CLICKED",
        message: where,
      },
      select: { url: true, linkLabel: true },
      take: 500,
    });

    const counts = new Map<string, { label: string | null; count: number }>();
    for (const event of events) {
      const key = event.url ?? "unknown";
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { label: event.linkLabel, count: 1 });
    }

    return [...counts.entries()]
      .map(([url, value]) => ({ url, label: value.label, count: value.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, []);
}
