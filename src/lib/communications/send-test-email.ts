import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { getEmailTemplate } from "@/lib/communications/registry";
import { renderCommunicationTemplate } from "@/lib/communications/render-template";
import {
  buildAccountActivationSampleData,
  PREVIEW_ACTIVATION_URL,
} from "@/lib/communications/sample-data";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SendTestEmailInput = {
  templateKey: string;
  recipientEmail: string;
  firstName?: string;
  organizationName?: string;
  sentByUserId: string;
};

export type SendTestEmailResult = {
  id: string;
  status: "sent" | "failed";
  providerMessageId?: string;
  errorMessage?: string;
};

function buildSampleOverrides(input: SendTestEmailInput): Record<string, unknown> {
  if (input.templateKey === "EMAIL-001") {
    return buildAccountActivationSampleData({
      firstName: input.firstName,
      organizationName: input.organizationName,
      activationUrl: PREVIEW_ACTIVATION_URL,
    });
  }

  return {
    firstName: input.firstName,
    organizationName: input.organizationName,
  };
}

export async function sendCommunicationTestEmail(
  input: SendTestEmailInput,
): Promise<SendTestEmailResult> {
  const email = input.recipientEmail.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("Invalid recipient email address");
  }

  const template = getEmailTemplate(input.templateKey);
  if (!template || template.status !== "active") {
    throw new Error("Template is not available for test sending");
  }

  const sampleOverrides = buildSampleOverrides(input);
  const rendered = await renderCommunicationTemplate(input.templateKey, sampleOverrides, {
    isTest: true,
    useSampleDefaults: true,
  });

  try {
    const result = await sendEmail({
      to: email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    const record = await prisma.communicationTestSend.create({
      data: {
        templateKey: input.templateKey,
        recipientEmail: email,
        providerMessageId: result.id ?? null,
        status: "sent",
        sentByUserId: input.sentByUserId,
      },
    });

    return {
      id: record.id,
      status: "sent",
      providerMessageId: result.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send test email";

    const record = await prisma.communicationTestSend.create({
      data: {
        templateKey: input.templateKey,
        recipientEmail: email,
        status: "failed",
        errorMessage: message,
        sentByUserId: input.sentByUserId,
      },
    });

    return {
      id: record.id,
      status: "failed",
      errorMessage: message,
    };
  }
}
