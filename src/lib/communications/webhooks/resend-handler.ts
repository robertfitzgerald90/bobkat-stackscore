import { Webhook } from "svix";
import { RESEND_EVENT_TYPE_MAP } from "@/lib/communications/tracking/status";
import { applyCommunicationProviderEvent } from "@/lib/communications/tracking/record-outbound";

export type ResendWebhookPayload = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    created_at?: string;
    from?: string;
    to?: string[];
    subject?: string;
    click?: { link?: string; timestamp?: string; userAgent?: string };
    bounce?: { message?: string };
    failed?: { reason?: string };
  };
};

export function verifyResendWebhook(input: {
  payload: string;
  svixId: string | null;
  svixTimestamp: string | null;
  svixSignature: string | null;
}): ResendWebhookPayload {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("RESEND_WEBHOOK_SECRET is not configured");
  }
  if (!input.svixId || !input.svixTimestamp || !input.svixSignature) {
    throw new Error("Missing Svix signature headers");
  }

  const wh = new Webhook(secret);
  return wh.verify(input.payload, {
    "svix-id": input.svixId,
    "svix-timestamp": input.svixTimestamp,
    "svix-signature": input.svixSignature,
  }) as ResendWebhookPayload;
}

export async function processResendWebhookEvent(
  payload: ResendWebhookPayload,
  svixId?: string | null,
) {
  const eventType = RESEND_EVENT_TYPE_MAP[payload.type];
  if (!eventType) {
    return { handled: false, reason: "unsupported_event_type" as const };
  }

  const providerMessageId = payload.data?.email_id;
  if (!providerMessageId) {
    return { handled: false, reason: "missing_email_id" as const };
  }

  const occurredAt = new Date(payload.created_at ?? payload.data?.created_at ?? Date.now());
  const providerEventId = svixId ?? `${payload.type}:${providerMessageId}:${occurredAt.toISOString()}`;

  const result = await applyCommunicationProviderEvent({
    providerMessageId,
    eventType,
    providerEventId,
    occurredAt,
    url: payload.data?.click?.link ?? null,
    userAgent: payload.data?.click?.userAgent ?? null,
    metadata: {
      type: payload.type,
      reason:
        payload.data?.bounce?.message ??
        payload.data?.failed?.reason ??
        undefined,
      subject: payload.data?.subject,
    },
  });

  return {
    handled: true,
    matched: result.matched,
    messageId: result.messageId,
  };
}
