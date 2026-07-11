import { notFound, redirect } from "next/navigation";
import { TemplateDetailView } from "@/components/communications/template-detail-view";
import { auth } from "@/lib/auth";
import { assertCommunicationsAdminRole } from "@/lib/communications/auth";
import { buildPreviewTemplateData } from "@/lib/communications/preview-data";
import {
  getEmailTemplate,
  isTemplatePreviewable,
  renderCommunicationTemplate,
} from "@/lib/communications";

type PageProps = {
  params: Promise<{ templateKey: string }>;
};

export default async function CommunicationsTemplateDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAdminRole(session.user.role)) {
    redirect("/dashboard");
  }

  const { templateKey } = await params;
  const template = getEmailTemplate(templateKey);
  if (!template) notFound();

  const previewable = isTemplatePreviewable(template);
  let preview: { html: string; text: string } | null = null;

  if (previewable) {
    const data = buildPreviewTemplateData(templateKey);
    const rendered = await renderCommunicationTemplate(templateKey, data, {
      useSampleDefaults: true,
    });
    preview = { html: rendered.html, text: rendered.text };
  }

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
      }}
      preview={preview}
    />
  );
}
