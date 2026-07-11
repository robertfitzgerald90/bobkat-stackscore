import { renderEmailTemplate } from "@/emails/render-email";
import { WorkflowNotificationEmail } from "@/emails/templates/workflow-notification";
import type { WorkflowNotificationEmailData } from "@/emails/templates/workflow-notification";
import { DEFAULT_COMMUNICATION_BRAND } from "@/lib/communications/brand-types";
import type { RenderContext, RenderedEmail } from "@/lib/communications/types";

export async function renderWorkflowNotificationEmail(
  data: WorkflowNotificationEmailData,
  context?: RenderContext,
  defaults?: { subject: string; previewText?: string },
): Promise<RenderedEmail> {
  const brand = context?.brand ?? DEFAULT_COMMUNICATION_BRAND;
  const content = context?.content ?? null;
  const { html, text } = await renderEmailTemplate(
    WorkflowNotificationEmail({
      ...data,
      brand,
      content,
    }),
  );

  return {
    subject: content?.subject ?? defaults?.subject ?? data.heroTitle,
    previewText:
      content?.previewText ??
      defaults?.previewText ??
      data.previewText ??
      data.heroDescription ??
      data.heroTitle,
    html,
    text,
  };
}
