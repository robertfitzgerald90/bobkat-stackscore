import { getRecentOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import { getCommunicationAnalyticsSummary } from "@/lib/communications/tracking/analytics";
import { getTemplateVersionSummary } from "@/lib/communications/template-versions";
import { prisma } from "@/lib/db";
import { isEmailConfigured } from "@/lib/email/config";
import {
  EMAIL_TEMPLATE_REGISTRY,
  getEmailTemplate,
  isTemplatePreviewable,
} from "@/lib/communications/registry";
import type {
  CommunicationDashboardStats,
  CommunicationHealthItem,
  CommunicationTestSendRecord,
  TemplateActivityItem,
} from "@/lib/communications/types";

export async function getCommunicationDashboardStats(): Promise<CommunicationDashboardStats> {
  const [testEmailsSent, lastTestSend, versionSummary, analytics] = await Promise.all([
    withCommunicationDbFallback(() => prisma.communicationTestSend.count(), 0),
    withCommunicationDbFallback(
      () =>
        prisma.communicationTestSend.findFirst({
          orderBy: { createdAt: "desc" },
          select: {
            templateKey: true,
            recipientEmail: true,
            status: true,
            createdAt: true,
          },
        }),
      null,
    ),
    getTemplateVersionSummary(),
    getCommunicationAnalyticsSummary({ isTest: false }),
  ]);

  const activeTemplates = EMAIL_TEMPLATE_REGISTRY.filter((t) => t.status === "active").length;
  const draftTemplates = EMAIL_TEMPLATE_REGISTRY.filter((t) => t.status === "draft").length;
  const archivedTemplates = EMAIL_TEMPLATE_REGISTRY.filter((t) => t.status === "archived").length;
  const previewableTemplates = EMAIL_TEMPLATE_REGISTRY.filter(isTemplatePreviewable).length;
  const configured = isEmailConfigured();

  return {
    activeTemplates,
    draftTemplates,
    archivedTemplates,
    previewableTemplates,
    publishedVersions: versionSummary.publishedCount,
    draftVersions: versionSummary.draftCount,
    templatesNeedingReview: versionSummary.templatesNeedingReview,
    testEmailsSent,
    messagesSent: analytics.messagesSent,
    deliveryRate: analytics.deliveryRate,
    openRate: analytics.openRate,
    clickRate: analytics.clickRate,
    failedDeliveries: analytics.failedCount + analytics.bouncedCount,
    lastTestEmail: lastTestSend
      ? {
          templateKey: lastTestSend.templateKey,
          recipientEmail: lastTestSend.recipientEmail,
          status: lastTestSend.status,
          createdAt: lastTestSend.createdAt.toISOString(),
        }
      : null,
    providerConfigured: configured,
    providerLabel: configured ? "Resend configured" : "Console fallback (no API key)",
  };
}

export async function getRecentTestSends(limit = 8): Promise<CommunicationTestSendRecord[]> {
  const records = await withCommunicationDbFallback(
    () =>
      prisma.communicationTestSend.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          sentBy: { select: { name: true } },
        },
      }),
    [],
  );

  return records.map((record) => ({
    id: record.id,
    templateKey: record.templateKey,
    templateName: getEmailTemplate(record.templateKey)?.name ?? record.templateKey,
    recipientEmail: record.recipientEmail,
    status: record.status,
    errorMessage: record.errorMessage,
    sentByName: record.sentBy.name,
    createdAt: record.createdAt.toISOString(),
  }));
}

export async function getRecentTemplateActivity(limit = 6): Promise<TemplateActivityItem[]> {
  return withCommunicationDbFallback(async () => {
    const versions = await prisma.communicationTemplateVersion.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        publishedBy: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });

    return versions.map((version) => ({
      id: version.id,
      templateKey: version.templateKey,
      templateName: getEmailTemplate(version.templateKey)?.name ?? version.templateKey,
      versionNumber: version.versionNumber,
      status: version.status,
      changeNotes: version.changeNotes,
      actorName: version.publishedBy?.name ?? version.createdBy.name,
      occurredAt: (version.publishedAt ?? version.updatedAt).toISOString(),
    }));
  }, []);
}

export async function getCommunicationHealth(): Promise<CommunicationHealthItem[]> {
  const [brandConfigured, versionSummary, providerConfigured] = await Promise.all([
    withCommunicationDbFallback(
      () => prisma.communicationBrandSettings.findUnique({ where: { id: "default" } }),
      null,
    ),
    getTemplateVersionSummary(),
    Promise.resolve(isEmailConfigured()),
  ]);

  const items: CommunicationHealthItem[] = [
    {
      id: "provider",
      label: "Email provider",
      status: providerConfigured ? "healthy" : "attention",
      detail: providerConfigured ? "Resend is configured" : "Using console fallback",
    },
    {
      id: "brand",
      label: "Brand settings",
      status: brandConfigured ? "healthy" : "attention",
      detail: brandConfigured
        ? "Brand settings saved in Communications"
        : "Using application defaults",
    },
    {
      id: "drafts",
      label: "Unpublished drafts",
      status: versionSummary.draftCount > 0 ? "attention" : "healthy",
      detail:
        versionSummary.draftCount > 0
          ? `${versionSummary.draftCount} draft version(s) pending publish`
          : "No pending draft versions",
    },
    {
      id: "review",
      label: "Templates needing review",
      status: versionSummary.templatesNeedingReview > 0 ? "attention" : "healthy",
      detail:
        versionSummary.templatesNeedingReview > 0
          ? `${versionSummary.templatesNeedingReview} template(s) have unpublished changes`
          : "All active templates are published",
    },
  ];

  return items;
}

export { getRecentOrganizationActivity };
