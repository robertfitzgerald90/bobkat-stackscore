import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { sendCommunicationTestEmail } from "@/lib/communications/send-test-email";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const denied = requireAdmin(user);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.templateKey || !body?.recipientEmail) {
    return badRequest("templateKey and recipientEmail are required");
  }

  try {
    const result = await sendCommunicationTestEmail({
      templateKey: String(body.templateKey),
      recipientEmail: String(body.recipientEmail),
      firstName: body.firstName ? String(body.firstName) : undefined,
      organizationName: body.organizationName ? String(body.organizationName) : undefined,
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
