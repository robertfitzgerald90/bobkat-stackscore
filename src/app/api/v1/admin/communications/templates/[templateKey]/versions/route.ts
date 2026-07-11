import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { requireCommunicationsAdmin } from "@/lib/communications/auth";
import { getCommunicationBrandSettings } from "@/lib/communications/brand-settings";
import { getEmailTemplate, listEmailTemplates } from "@/lib/communications/registry";
import {
  discardTemplateDraft,
  publishTemplateDraft,
  saveTemplateDraft,
} from "@/lib/communications/template-versions";
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

  const { templateKey } = await context.params;
  const template = getEmailTemplate(templateKey);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.action) {
    return badRequest("action is required");
  }

  if (body.action === "publish" || body.action === "save") {
    const denied = requireCommunicationsAdmin(user);
    if (denied) return denied;
  } else {
    const denied = requireConsultantOrAdmin(user);
    if (denied) return denied;
  }

  if (body.action === "save") {
    const draft = await saveTemplateDraft({
      templateKey,
      subject: String(body.subject ?? template.subject),
      previewText: String(body.previewText ?? template.previewText),
      content: (body.content as TemplateContentBlock) ?? {},
      changeNotes: body.changeNotes ? String(body.changeNotes) : undefined,
      userId: user.id,
    });
    return NextResponse.json({ draft });
  }

  if (body.action === "publish") {
    const brand = await getCommunicationBrandSettings();
    const issues = validateTemplateForPublish({
      templateKey,
      subject: String(body.subject ?? template.subject),
      previewText: String(body.previewText ?? template.previewText),
      content: (body.content as TemplateContentBlock) ?? {},
      brand,
      allSubjects: listEmailTemplates().map((entry) => entry.subject),
    });

    if (!canPublishTemplate(issues)) {
      return NextResponse.json(
        { error: "Template failed validation", issues, canPublish: false },
        { status: 400 },
      );
    }

    await saveTemplateDraft({
      templateKey,
      subject: String(body.subject ?? template.subject),
      previewText: String(body.previewText ?? template.previewText),
      content: (body.content as TemplateContentBlock) ?? {},
      changeNotes: body.changeNotes ? String(body.changeNotes) : "Published from Communications",
      userId: user.id,
    });

    const published = await publishTemplateDraft(templateKey, user.id);
    return NextResponse.json({ published, issues, canPublish: true });
  }

  return badRequest("Unsupported action");
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireCommunicationsAdmin(user);
  if (denied) return denied;

  const { templateKey } = await context.params;
  await discardTemplateDraft(templateKey);
  return NextResponse.json({ success: true });
}
