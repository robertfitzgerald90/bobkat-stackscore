import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { renderCommunicationTemplate } from "@/lib/communications/render-template";
import { resolveSampleData } from "@/lib/communications/sample-profiles";
import { getEmailTemplate } from "@/lib/communications/registry";
import { listSampleProfiles } from "@/lib/communications/sample-profiles";
import { PREVIEW_ACTIVATION_URL } from "@/lib/communications/sample-data";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.templateKey) {
    return badRequest("templateKey is required");
  }

  const template = getEmailTemplate(String(body.templateKey));
  if (!template) {
    return badRequest("Unknown template");
  }

  const profiles = body.sampleProfileId
    ? await listSampleProfiles(String(body.templateKey))
    : [];
  const profile = profiles.find((item) => item.id === body.sampleProfileId) ?? null;

  const data = resolveSampleData(
    {
      ...(template.sampleData as Record<string, unknown>),
      activationUrl: PREVIEW_ACTIVATION_URL,
      resetUrl: PREVIEW_ACTIVATION_URL,
      resultsUrl: PREVIEW_ACTIVATION_URL,
      roadmapUrl: PREVIEW_ACTIVATION_URL,
      proposalUrl: PREVIEW_ACTIVATION_URL,
      reviewUrl: PREVIEW_ACTIVATION_URL,
      projectUrl: PREVIEW_ACTIVATION_URL,
      invitationUrl: PREVIEW_ACTIVATION_URL,
    },
    profile,
    (body.sampleData as Record<string, unknown> | undefined) ?? {},
  );

  try {
    const rendered = await renderCommunicationTemplate(String(body.templateKey), data, {
      useSampleDefaults: true,
      versionMode: body.versionMode === "draft" ? "draft" : "published",
    });
    return NextResponse.json({
      preview: {
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to render preview";
    return badRequest(message);
  }
}
