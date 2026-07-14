import { getCommunicationAutomation } from "@/lib/communications/automation-registry";
import { getEmailTemplate } from "@/lib/communications/registry";
import { renderCommunicationTemplate } from "@/lib/communications/render-template";
import { recordAndSendCommunication } from "@/lib/communications/tracking/record-outbound";
import { prisma } from "@/lib/db";

type DispatchCommunicationInput = {
  event: string;
  organizationId?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  recipientEmail?: string | null;
  recipientName?: string | null;
  context?: Record<string, unknown>;
  idempotencyKey?: string | null;
  triggeredBy?: string | null;
  sendType?: "AUTOMATED" | "MANUAL" | "TEST";
  isTest?: boolean;
  createdByUserId?: string | null;
};

function interpolateIdempotencyKey(
  pattern: string,
  input: DispatchCommunicationInput,
  context: Record<string, unknown>,
) {
  return pattern
    .replace("{organizationId}", input.organizationId ?? "")
    .replace("{clientId}", input.organizationId ?? "")
    .replace("{relatedEntityId}", input.relatedEntityId ?? "")
    .replace("{subscriptionId}", String(context.subscriptionId ?? input.relatedEntityId ?? ""))
    .replace("{activationSequence}", String(context.activationSequence ?? "1"))
    .replace("{assessmentId}", String(context.assessmentId ?? input.relatedEntityId ?? ""))
    .replace("{roadmapId}", String(context.roadmapId ?? input.relatedEntityId ?? ""))
    .replace("{proposalId}", String(context.proposalId ?? input.relatedEntityId ?? ""))
    .replace("{projectId}", String(context.projectId ?? input.relatedEntityId ?? ""))
    .replace("{invoiceId}", String(context.invoiceId ?? input.relatedEntityId ?? ""))
    .replace("{attemptCount}", String(context.attemptCount ?? "1"))
    .replace("{currentPeriodEnd}", String(context.currentPeriodEnd ?? ""))
    .replace("{endedAt}", String(context.endedAt ?? ""))
    .replace("{reactivationSequence}", String(context.reactivationSequence ?? "1"));
}

function getMissingRequiredFields(required: readonly string[], data: Record<string, unknown>) {
  return required.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === "";
  });
}

async function resolveRecipient(input: DispatchCommunicationInput) {
  if (input.recipientEmail) {
    return { email: input.recipientEmail, name: input.recipientName ?? null };
  }
  if (!input.organizationId) return null;
  const client = await prisma.client.findUnique({
    where: { id: input.organizationId },
    select: { primaryContactEmail: true, primaryContactName: true },
  });
  if (!client?.primaryContactEmail) return null;
  return { email: client.primaryContactEmail, name: client.primaryContactName };
}

export async function dispatchCommunication(input: DispatchCommunicationInput) {
  const automation = getCommunicationAutomation(input.event);
  if (!automation) {
    return { status: "skipped" as const, reason: "missing_automation" as const };
  }
  if (!automation.enabled || automation.status === "disabled") {
    return { status: "skipped" as const, reason: "automation_disabled" as const };
  }

  const template = getEmailTemplate(automation.templateKey);
  if (!template || template.status !== "active") {
    return { status: "failed" as const, reason: "template_unavailable" as const };
  }

  const context = input.context ?? {};
  const recipient = await resolveRecipient(input);
  if (!recipient?.email) {
    return { status: "failed" as const, reason: "missing_recipient" as const };
  }

  const data = {
    ...(template.sampleData as Record<string, unknown>),
    ...context,
  };
  const missing = getMissingRequiredFields(template.requiredVariables, data);
  if (missing.length > 0) {
    return { status: "failed" as const, reason: "missing_merge_fields" as const, missing };
  }

  const idempotencyKey =
    input.isTest || input.sendType === "TEST"
      ? null
      : input.idempotencyKey ?? interpolateIdempotencyKey(automation.idempotencyKey, input, context);

  const rendered = await renderCommunicationTemplate(template.key, data, {
    isTest: input.isTest,
    useSampleDefaults: true,
  });

  const result = await recordAndSendCommunication({
    to: recipient.email,
    subject: input.isTest || input.sendType === "TEST" ? `[TEST] ${rendered.subject}` : rendered.subject,
    html: rendered.html,
    text: rendered.text,
    previewText: rendered.previewText,
    templateKey: template.key,
    eventKey: automation.event,
    sendType: input.sendType ?? (input.isTest ? "TEST" : "AUTOMATED"),
    idempotencyKey,
    triggeredBy: input.triggeredBy ?? automation.triggerSource,
    relatedEntityType: input.relatedEntityType ?? null,
    relatedEntityId: input.relatedEntityId ?? null,
    recipientName: recipient.name,
    isTest: input.isTest ?? false,
    clientId: input.organizationId ?? null,
    createdByUserId: input.createdByUserId ?? null,
    metadata: {
      automationEvent: automation.event,
      triggerSource: automation.triggerSource,
      idempotencyKey,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
    },
  });

  return { status: "sent" as const, result, idempotencyKey };
}
