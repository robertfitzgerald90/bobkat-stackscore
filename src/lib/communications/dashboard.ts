import { prisma } from "@/lib/db";
import { isEmailConfigured } from "@/lib/email/config";
import {
  EMAIL_TEMPLATE_REGISTRY,
  getEmailTemplate,
  isTemplatePreviewable,
} from "@/lib/communications/registry";
import type {
  CommunicationDashboardStats,
  CommunicationTestSendRecord,
} from "@/lib/communications/types";

export async function getCommunicationDashboardStats(): Promise<CommunicationDashboardStats> {
  const [testEmailsSent, lastTestSend] = await Promise.all([
    prisma.communicationTestSend.count(),
    prisma.communicationTestSend.findFirst({
      orderBy: { createdAt: "desc" },
      select: {
        templateKey: true,
        recipientEmail: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const activeTemplates = EMAIL_TEMPLATE_REGISTRY.filter((t) => t.status === "active").length;
  const draftTemplates = EMAIL_TEMPLATE_REGISTRY.filter((t) => t.status === "draft").length;
  const previewableTemplates = EMAIL_TEMPLATE_REGISTRY.filter(isTemplatePreviewable).length;
  const configured = isEmailConfigured();

  return {
    activeTemplates,
    draftTemplates,
    previewableTemplates,
    testEmailsSent,
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
  const records = await prisma.communicationTestSend.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      sentBy: { select: { name: true } },
    },
  });

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
