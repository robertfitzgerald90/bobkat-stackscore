import { NextRequest, NextResponse } from "next/server";
import {
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { getCommunicationBrandSettings } from "@/lib/communications/brand-settings";
import { renderCommunicationTemplate } from "@/lib/communications/render-template";
import { getEmailTemplate, listEmailTemplates } from "@/lib/communications/registry";
import { PREVIEW_ACTIVATION_URL } from "@/lib/communications/sample-data";
import type { TemplateContentBlock } from "@/lib/communications/template-content";
import {
  canPublishTemplate,
  validateTemplateForPublish,
} from "@/lib/communications/validation";

type RouteContext = {
  params: Promise<{ templateKey: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { templateKey } = await context.params;
  const template = getEmailTemplate(templateKey);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const brand = await getCommunicationBrandSettings();
  const issues = validateTemplateForPublish({
    templateKey,
    subject: String(body.subject ?? template.subject),
    previewText: String(body.previewText ?? template.previewText),
    content: (body.content as TemplateContentBlock) ?? {},
    brand,
    allSubjects: listEmailTemplates().map((entry) => entry.subject),
  });

  try {
    await renderCommunicationTemplate(
      templateKey,
      {
        ...(template.sampleData as Record<string, unknown>),
        activationUrl: PREVIEW_ACTIVATION_URL,
      },
      {
        useSampleDefaults: true,
        versionMode: "draft",
      },
    );
  } catch (error) {
    issues.push({
      severity: "error",
      code: "render_error",
      message: error instanceof Error ? error.message : "Template failed to render",
    });
  }

  return NextResponse.json({
    issues,
    canPublish: canPublishTemplate(issues),
  });
}
