import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { sendCommunicationTestEmail } from "@/lib/communications/send-test-email";
import { listSampleProfiles, resolveSampleData } from "@/lib/communications/sample-profiles";
import { getEmailTemplate } from "@/lib/communications/registry";
import { PREVIEW_ACTIVATION_URL } from "@/lib/communications/sample-data";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.templateKey || !body?.recipientEmail) {
    return badRequest("templateKey and recipientEmail are required");
  }

  const template = getEmailTemplate(String(body.templateKey));
  if (!template) {
    return badRequest("Unknown template");
  }

  const profiles = body.sampleProfileId
    ? await listSampleProfiles(String(body.templateKey))
    : [];
  const profile = profiles.find((item) => item.id === body.sampleProfileId) ?? null;

  const sampleOverrides = {
    firstName: body.firstName ? String(body.firstName) : undefined,
    organizationName: body.organizationName ? String(body.organizationName) : undefined,
    assessmentName: body.assessmentName ? String(body.assessmentName) : undefined,
  };

  const data = resolveSampleData(
    {
      ...(template.sampleData as Record<string, unknown>),
      activationUrl: PREVIEW_ACTIVATION_URL,
    },
    profile,
    sampleOverrides,
  );

  try {
    const result = await sendCommunicationTestEmail({
      templateKey: String(body.templateKey),
      recipientEmail: String(body.recipientEmail),
      firstName: data.firstName ? String(data.firstName) : undefined,
      organizationName: data.organizationName ? String(data.organizationName) : undefined,
      assessmentName: data.assessmentName ? String(data.assessmentName) : undefined,
      sentByUserId: user.id,
    });

    if (result.status === "failed") {
      return NextResponse.json(result, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send test email";
    return badRequest(message);
  }
}
