import { NextRequest, NextResponse } from "next/server";
import {
  processResendWebhookEvent,
  verifyResendWebhook,
} from "@/lib/communications/webhooks/resend-handler";

export async function POST(request: NextRequest) {
  const payload = await request.text();

  try {
    const event = verifyResendWebhook({
      payload,
      svixId: request.headers.get("svix-id"),
      svixTimestamp: request.headers.get("svix-timestamp"),
      svixSignature: request.headers.get("svix-signature"),
    });

    const result = await processResendWebhookEvent(
      event,
      request.headers.get("svix-id"),
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook";
    console.warn("[communications/webhook] Rejected Resend webhook", { message });
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
