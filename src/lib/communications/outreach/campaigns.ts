import type { CommunicationCampaignStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import { recordCampaignEvent } from "@/lib/communications/outreach/campaign-sync";

export type CampaignListFilters = {
  status?: CommunicationCampaignStatus;
  search?: string;
  page?: number;
  limit?: number;
};

function buildCampaignWhere(filters: CampaignListFilters): Prisma.CommunicationCampaignWhereInput {
  const where: Prisma.CommunicationCampaignWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  return where;
}

export async function listCampaigns(filters: CampaignListFilters = {}) {
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 20, 100);
  const skip = (page - 1) * limit;
  const where = buildCampaignWhere(filters);

  const [items, total] = await Promise.all([
    prisma.communicationCampaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { recipients: true } },
      },
    }),
    prisma.communicationCampaign.count({ where }),
  ]);

  const enriched = await Promise.all(
    items.map(async (campaign) => ({
      ...campaign,
      metrics: await getCampaignMetrics(campaign.id),
    })),
  );

  return { items: enriched, total, page, limit };
}

export async function getCampaignMetrics(campaignId: string) {
  return withCommunicationDbFallback(async () => {
    const recipients = await prisma.campaignRecipient.findMany({
      where: { campaignId },
      select: {
        invitedAt: true,
        openedAt: true,
        clickedAt: true,
        assessmentStartedAt: true,
        assessmentCompletedAt: true,
        communicationMessageId: true,
      },
    });

    const recipientCount = recipients.length;
    const invitationsSent = recipients.filter((r) => r.invitedAt).length;
    const opens = recipients.filter((r) => r.openedAt).length;
    const clicks = recipients.filter((r) => r.clickedAt).length;
    const assessmentStarts = recipients.filter((r) => r.assessmentStartedAt).length;
    const assessmentCompletions = recipients.filter((r) => r.assessmentCompletedAt).length;

    const messageIds = recipients
      .map((r) => r.communicationMessageId)
      .filter((id): id is string => Boolean(id));

    let delivered = 0;
    if (messageIds.length > 0) {
      delivered = await prisma.communicationMessage.count({
        where: {
          id: { in: messageIds },
          isTest: false,
          status: { in: ["DELIVERED", "OPENED", "CLICKED"] },
        },
      });
    }

    const conversionRate =
      invitationsSent > 0
        ? Math.round((assessmentCompletions / invitationsSent) * 1000) / 10
        : null;

    return {
      recipientCount,
      invitationsSent,
      delivered,
      opens,
      clicks,
      assessmentStarts,
      assessmentCompletions,
      conversionRate,
      deliveryRate:
        invitationsSent > 0 ? Math.round((delivered / invitationsSent) * 1000) / 10 : null,
      openRate: invitationsSent > 0 ? Math.round((opens / invitationsSent) * 1000) / 10 : null,
      clickRate: invitationsSent > 0 ? Math.round((clicks / invitationsSent) * 1000) / 10 : null,
      assessmentStartRate:
        invitationsSent > 0 ? Math.round((assessmentStarts / invitationsSent) * 1000) / 10 : null,
      assessmentCompletionRate:
        invitationsSent > 0
          ? Math.round((assessmentCompletions / invitationsSent) * 1000) / 10
          : null,
    };
  }, {
    recipientCount: 0,
    invitationsSent: 0,
    delivered: 0,
    opens: 0,
    clicks: 0,
    assessmentStarts: 0,
    assessmentCompletions: 0,
    conversionRate: null,
    deliveryRate: null,
    openRate: null,
    clickRate: null,
    assessmentStartRate: null,
    assessmentCompletionRate: null,
  });
}

export async function getCampaignDetail(campaignId: string) {
  const campaign = await prisma.communicationCampaign.findUnique({
    where: { id: campaignId },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      recipients: {
        orderBy: { createdAt: "desc" },
        include: {
          prospect: true,
          message: { select: { id: true, status: true, sentAt: true, openCount: true, clickCount: true } },
        },
      },
    },
  });

  if (!campaign) return null;

  const metrics = await getCampaignMetrics(campaignId);
  return { ...campaign, metrics };
}

export async function createCampaign(input: {
  name: string;
  description?: string | null;
  templateKey?: string;
  status?: CommunicationCampaignStatus;
  createdByUserId: string;
}) {
  const campaign = await prisma.communicationCampaign.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      templateKey: input.templateKey ?? "EMAIL-009",
      status: input.status ?? "draft",
      createdByUserId: input.createdByUserId,
    },
  });

  await recordCampaignEvent({
    campaignId: campaign.id,
    eventType: "campaign_created",
    title: "Campaign created",
    description: campaign.name,
    actorUserId: input.createdByUserId,
  });

  return campaign;
}

export async function updateCampaign(
  campaignId: string,
  input: {
    name?: string;
    description?: string | null;
    status?: CommunicationCampaignStatus;
    templateKey?: string;
  },
) {
  const campaign = await prisma.communicationCampaign.update({
    where: { id: campaignId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.templateKey !== undefined ? { templateKey: input.templateKey } : {}),
      ...(input.status === "completed" ? { completedAt: new Date() } : {}),
    },
  });

  if (input.status === "completed") {
    await recordCampaignEvent({
      campaignId,
      eventType: "campaign_finished",
      title: "Campaign finished",
      description: campaign.name,
    });
  }

  return campaign;
}

export async function getOutreachDashboardStats() {
  return withCommunicationDbFallback(async () => {
    const [activeCampaigns, recentCampaigns, aggregate] = await Promise.all([
      prisma.communicationCampaign.count({
        where: { status: { in: ["ready", "sending"] } },
      }),
      prisma.communicationCampaign.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          createdBy: { select: { name: true } },
          _count: { select: { recipients: true } },
        },
      }),
      prisma.campaignRecipient.aggregate({
        _count: { _all: true },
      }),
    ]);

    const recipients = await prisma.campaignRecipient.findMany({
      select: {
        invitedAt: true,
        assessmentStartedAt: true,
        assessmentCompletedAt: true,
      },
    });

    const invitationsSent = recipients.filter((r) => r.invitedAt).length;
    const assessmentsStarted = recipients.filter((r) => r.assessmentStartedAt).length;
    const assessmentsCompleted = recipients.filter((r) => r.assessmentCompletedAt).length;
    const conversionRate =
      invitationsSent > 0
        ? Math.round((assessmentsCompleted / invitationsSent) * 1000) / 10
        : null;

    const enrichedRecent = await Promise.all(
      recentCampaigns.map(async (c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        recipientCount: c._count.recipients,
        createdAt: c.createdAt.toISOString(),
        createdByName: c.createdBy.name,
        metrics: await getCampaignMetrics(c.id),
      })),
    );

    return {
      activeCampaigns,
      invitationsSent,
      assessmentsStarted,
      assessmentsCompleted,
      conversionRate,
      totalRecipients: aggregate._count._all,
      recentCampaigns: enrichedRecent,
    };
  }, {
    activeCampaigns: 0,
    invitationsSent: 0,
    assessmentsStarted: 0,
    assessmentsCompleted: 0,
    conversionRate: null,
    totalRecipients: 0,
    recentCampaigns: [],
  });
}

export async function getCampaignAnalyticsSummary() {
  return withCommunicationDbFallback(async () => {
    const campaigns = await prisma.communicationCampaign.findMany({
      where: { status: { not: "archived" } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const withMetrics = await Promise.all(
      campaigns.map(async (campaign) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        createdAt: campaign.createdAt.toISOString(),
        metrics: await getCampaignMetrics(campaign.id),
      })),
    );

    const topPerforming = [...withMetrics]
      .filter((c) => c.metrics.invitationsSent > 0)
      .sort((a, b) => (b.metrics.conversionRate ?? 0) - (a.metrics.conversionRate ?? 0))
      .slice(0, 5);

    const dashboard = await getOutreachDashboardStats();

    return {
      ...dashboard,
      topPerformingCampaigns: topPerforming,
      recentPerformance: withMetrics.slice(0, 8),
    };
  }, {
    activeCampaigns: 0,
    invitationsSent: 0,
    assessmentsStarted: 0,
    assessmentsCompleted: 0,
    conversionRate: null,
    totalRecipients: 0,
    recentCampaigns: [],
    topPerformingCampaigns: [],
    recentPerformance: [],
  });
}
