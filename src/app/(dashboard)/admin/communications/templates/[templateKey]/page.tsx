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
      sampleProfiles={sampleProfiles}
      initialValidation={initialValidation}
    />
  );
}
