import { notFound, redirect } from "next/navigation";
import { TemplateDetailView } from "@/components/communications/template-detail-view";
import { auth } from "@/lib/auth";
import {
  assertCommunicationsAccessRole,
  assertCommunicationsAdminRole,
} from "@/lib/communications/auth";
import { buildPreviewTemplateData } from "@/lib/communications/preview-data";
import { listSampleProfiles } from "@/lib/communications/sample-profiles";
import { getDefaultSharedComponents } from "@/lib/communications/template-content";
import { getTemplateVersionState } from "@/lib/communications/template-versions";
import { getAutomationsForTemplate } from "@/lib/communications/automation-registry";
import { prisma } from "@/lib/db";
import {
  getEmailTemplate,
  isTemplatePreviewable,
  renderCommunicationTemplate,
} from "@/lib/communications";
import type { TemplateValidationIssue } from "@/lib/communications/types";

type PageProps = {
  params: Promise<{ templateKey: string }>;
};

export default async function CommunicationsTemplateDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  const { templateKey } = await params;
  const template = getEmailTemplate(templateKey);
  if (!template) notFound();

  const isAdmin = assertCommunicationsAdminRole(session.user.role);
  const previewable = isTemplatePreviewable(template);
  const [versionState, sampleProfiles] = await Promise.all([
    getTemplateVersionState(templateKey),
    listSampleProfiles(templateKey),
  ]);
  const automations = getAutomationsForTemplate(templateKey);
  const recentSends = await prisma.communicationMessage.findMany({
    where: { templateKey },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      eventKey: true,
      sendType: true,
      recipientEmail: true,
      subject: true,
      status: true,
      sentAt: true,
      failedAt: true,
      createdAt: true,
      isTest: true,
    },
  });

  let preview: { html: string; text: string; subject: string } | null = null;

  if (previewable) {
    const data = buildPreviewTemplateData(templateKey);
    const rendered = await renderCommunicationTemplate(templateKey, data, {
      useSampleDefaults: true,
      versionMode: versionState.draft ? "draft" : "published",
    });
    preview = { html: rendered.html, text: rendered.text, subject: rendered.subject };
  }

  const initialValidation: TemplateValidationIssue[] = [];

  return (
    <TemplateDetailView
      template={{
        key: template.key,
        documentId: template.documentId,
        name: template.name,
        description: template.description,
        category: template.category,
        status: template.status,
        subject: template.subject,
        previewText: template.previewText,
        lastUpdated: template.lastUpdated,
        requiredVariables: template.requiredVariables,
        optionalVariables: template.optionalVariables,
        previewable,
        sharedComponents: getDefaultSharedComponents(templateKey),
      }}
      preview={preview}
      versionState={versionState}
      isAdmin={isAdmin}
      defaultTestRecipient={session.user.email ?? ""}
      sampleProfiles={sampleProfiles}
      initialValidation={initialValidation}
      automations={automations}
      recentSends={recentSends.map((send) => ({
        id: send.id,
        eventKey: send.eventKey,
        sendType: send.sendType,
        recipientEmail: send.recipientEmail,
        subject: send.subject,
        status: send.status,
        occurredAt: (send.sentAt ?? send.failedAt ?? send.createdAt).toISOString(),
        isTest: send.isTest,
      }))}
    />
  );
}
