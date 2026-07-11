import { getCommunicationBrandSettings } from "@/lib/communications/brand-settings";
import { getEmailTemplate, isTemplatePreviewable } from "@/lib/communications/registry";
import { mergeTemplateData } from "@/lib/communications/sample-data";
import { getEffectiveTemplateContent } from "@/lib/communications/template-versions";
import type { RenderedEmail } from "@/lib/communications/types";

type RenderOptions = {
  isTest?: boolean;
  useSampleDefaults?: boolean;
  versionMode?: "published" | "draft";
};

export async function renderCommunicationTemplate(
  templateKey: string,
  dataOverrides: Record<string, unknown> = {},
  options: RenderOptions = {},
): Promise<RenderedEmail> {
  const template = getEmailTemplate(templateKey);
  if (!template) {
    throw new Error(`Unknown template: ${templateKey}`);
  }

  if (!isTemplatePreviewable(template)) {
    throw new Error(`Template ${templateKey} is not available for rendering.`);
  }

  const useSampleDefaults = options.useSampleDefaults ?? options.isTest ?? false;
  const data = useSampleDefaults
    ? mergeTemplateData(template.sampleData as Record<string, unknown>, dataOverrides)
    : mergeTemplateData({} as Record<string, unknown>, dataOverrides);

  for (const variable of template.requiredVariables) {
    if (!data[variable]) {
      throw new Error(`Missing required variable: ${variable}`);
    }
  }

  const [brand, content] = await Promise.all([
    getCommunicationBrandSettings(),
    getEffectiveTemplateContent(templateKey, options.versionMode ?? "published"),
  ]);

  const rendered = await template.render(data, { brand, content });
  if (options.isTest) {
    return {
      ...rendered,
      subject: `[TEST] ${rendered.subject}`,
    };
  }

  return rendered;
}
