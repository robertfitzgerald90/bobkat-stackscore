import type {
  OperationalNotificationCategory,
  OperationalNotificationSeverity,
  Prisma,
  UserRole,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { isConsultantRole } from "@/lib/client-roadmap/permissions";
import { buildRefreshEvents } from "@/lib/technology-lifecycle/refresh";

export type OperationalNotificationView = {
  id: string;
  clientId: string | null;
  category: OperationalNotificationCategory;
  severity: OperationalNotificationSeverity;
  title: string;
  body: string;
  actionHref: string | null;
  actionLabel: string | null;
  createdAt: string;
  readAt: string | null;
};

type NotificationDraft = {
  userId: string;
  clientId?: string | null;
  category: OperationalNotificationCategory;
  severity: OperationalNotificationSeverity;
  title: string;
  body: string;
  actionHref?: string | null;
  actionLabel?: string | null;
  dedupeKey: string;
  metadataJson?: Prisma.InputJsonValue;
};

export async function listOperationalNotifications(
  userId: string,
  options: { unreadOnly?: boolean; limit?: number } = {},
): Promise<OperationalNotificationView[]> {
  const notifications = await prisma.operationalNotification.findMany({
    where: {
      userId,
      dismissedAt: null,
      ...(options.unreadOnly ? { readAt: null } : {}),
    },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    take: options.limit ?? 40,
  });

  return notifications.map((item) => ({
    id: item.id,
    clientId: item.clientId,
    category: item.category,
    severity: item.severity,
    title: item.title,
    body: item.body,
    actionHref: item.actionHref,
    actionLabel: item.actionLabel,
    createdAt: item.createdAt.toISOString(),
    readAt: item.readAt?.toISOString() ?? null,
  }));
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return prisma.operationalNotification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}

export async function dismissNotification(userId: string, notificationId: string) {
  return prisma.operationalNotification.updateMany({
    where: { id: notificationId, userId },
    data: { dismissedAt: new Date(), readAt: new Date() },
  });
}

async function upsertNotification(draft: NotificationDraft) {
  return prisma.operationalNotification.upsert({
    where: {
      userId_dedupeKey: {
        userId: draft.userId,
        dedupeKey: draft.dedupeKey,
      },
    },
    create: {
      userId: draft.userId,
      clientId: draft.clientId ?? null,
      category: draft.category,
      severity: draft.severity,
      title: draft.title,
      body: draft.body,
      actionHref: draft.actionHref ?? null,
      actionLabel: draft.actionLabel ?? null,
      dedupeKey: draft.dedupeKey,
      metadataJson: draft.metadataJson,
    },
    update: {
      title: draft.title,
      body: draft.body,
      actionHref: draft.actionHref ?? null,
      actionLabel: draft.actionLabel ?? null,
      severity: draft.severity,
      dismissedAt: null,
      metadataJson: draft.metadataJson,
    },
  });
}

/**
 * Scan portfolio signals and materialize actionable consultant notifications.
 * Designed to be called from cron or consultant dashboard load.
 */
export async function refreshConsultantNotifications(userId: string, role: UserRole) {
  if (!isConsultantRole(role)) return [];

  const now = new Date();
  const inThirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const drafts: NotificationDraft[] = [];

  const [clients, proposals, highRisk] = await Promise.all([
    prisma.client.findMany({
      where: { status: { not: "archived" } },
      select: {
        id: true,
        companyName: true,
        technologyProfile: {
          select: {
            overallStackScore: true,
            nextRecommendedAssessmentAt: true,
            lastAssessedAt: true,
          },
        },
        clientTechnologies: {
          where: { isActive: true },
          include: {
            technology: {
              select: { name: true, category: { select: { name: true } } },
            },
          },
        },
      },
    }),
    prisma.phaseProposal.findMany({
      where: {
        status: { in: ["sent", "viewed"] },
        sentAt: { lte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: {
        id: true,
        clientId: true,
        proposalNumber: true,
        title: true,
        client: { select: { companyName: true } },
      },
      take: 40,
    }),
    prisma.technologyProfile.findMany({
      where: {
        overallStackScore: { lt: 60 },
        client: { status: { not: "archived" } },
      },
      select: {
        clientId: true,
        overallStackScore: true,
        client: { select: { companyName: true } },
      },
      take: 30,
    }),
  ]);

  for (const proposal of proposals) {
    drafts.push({
      userId,
      clientId: proposal.clientId,
      category: "proposal",
      severity: "attention",
      title: `Proposal awaiting decision — ${proposal.client.companyName}`,
      body: `${proposal.proposalNumber} has been outstanding for more than 7 days.`,
      actionHref: `/clients/${proposal.clientId}/phase-proposals/${proposal.id}`,
      actionLabel: "Open proposal",
      dedupeKey: `proposal-stale:${proposal.id}`,
    });
  }

  for (const profile of highRisk) {
    drafts.push({
      userId,
      clientId: profile.clientId,
      category: "risk",
      severity: "urgent",
      title: `High risk client — ${profile.client.companyName}`,
      body: `StackScore is ${Math.round(Number(profile.overallStackScore))}. Prioritize stabilization planning.`,
      actionHref: `/clients/${profile.clientId}/360`,
      actionLabel: "Open Customer 360",
      dedupeKey: `high-risk:${profile.clientId}`,
    });
  }

  for (const client of clients) {
    const nextReview = client.technologyProfile?.nextRecommendedAssessmentAt;
    if (nextReview && nextReview.getTime() <= inThirtyDays.getTime()) {
      drafts.push({
        userId,
        clientId: client.id,
        category: "qbr",
        severity: nextReview.getTime() < now.getTime() ? "urgent" : "attention",
        title: `Upcoming review — ${client.companyName}`,
        body: `Review window around ${nextReview.toLocaleDateString()}.`,
        actionHref: `/clients/${client.id}/quarterly-reviews`,
        actionLabel: "Open reviews",
        dedupeKey: `review-due:${client.id}:${nextReview.toISOString().slice(0, 10)}`,
      });
    }

    const lastAssessed = client.technologyProfile?.lastAssessedAt;
    if (
      lastAssessed &&
      lastAssessed.getTime() <= now.getTime() - 330 * 24 * 60 * 60 * 1000
    ) {
      drafts.push({
        userId,
        clientId: client.id,
        category: "assessment",
        severity: "attention",
        title: `Assessment anniversary approaching — ${client.companyName}`,
        body: "Annual reassessment window is open. Preserve history and refresh the roadmap.",
        actionHref: `/clients/${client.id}/assessments`,
        actionLabel: "Open assessments",
        dedupeKey: `assessment-anniversary:${client.id}:${lastAssessed.toISOString().slice(0, 7)}`,
      });
    }

    const refreshEvents = buildRefreshEvents(
      client.clientTechnologies.map((tech) => ({
        id: tech.id,
        displayName: tech.displayName,
        technologyName: tech.technology.name,
        categoryName: tech.technology.category.name,
        lifecycleStatus: tech.lifecycleStatus,
        warrantyExpiresAt: tech.warrantyExpiresAt,
        licenseRenewalDate: tech.licenseRenewalDate,
        renewalDate: tech.renewalDate,
        plannedReplacementDate: tech.plannedReplacementDate,
      })),
      now,
    );

    for (const event of refreshEvents.filter((item) => item.urgency !== "planned").slice(0, 3)) {
      const category: OperationalNotificationCategory =
        event.eventType === "warranty_expiration"
          ? "warranty"
          : event.eventType === "license_renewal"
            ? "license"
            : "refresh";
      drafts.push({
        userId,
        clientId: client.id,
        category,
        severity: event.urgency === "overdue" ? "urgent" : "attention",
        title: `${event.eventType.replaceAll("_", " ")} — ${client.companyName}`,
        body: `${event.title} is ${event.urgency} (${event.daysUntilDue} days).`,
        actionHref: `/clients/${client.id}/lifecycle`,
        actionLabel: "Open lifecycle",
        dedupeKey: `refresh:${client.id}:${event.id}`,
      });
    }
  }

  const created = [];
  for (const draft of drafts.slice(0, 100)) {
    created.push(await upsertNotification(draft));
  }
  return created;
}
