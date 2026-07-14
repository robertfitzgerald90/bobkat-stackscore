import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import { getEmailTemplate } from "@/lib/communications/registry";
import { renderCommunicationTemplate } from "@/lib/communications/render-template";
import {
  buildAccountActivationSampleData,
  buildVcioWelcomeSampleData,
  PREVIEW_ACTIVATION_URL,
} from "@/lib/communications/sample-data";
import { recordAndSendCommunication } from "@/lib/communications/tracking/record-outbound";
import { prisma } from "@/lib/db";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SendTestEmailInput = {
  templateKey: string;
  recipientEmail: string;
  firstName?: string;
  organizationName?: string;
  assessmentName?: string;
  vcioCustomerType?: string;
  sentByUserId: string;
};

export type SendTestEmailResult = {
  id: string;
  status: "sent" | "failed";
  providerMessageId?: string;
  errorMessage?: string;
  communicationMessageId?: string;
};

function buildSampleOverrides(input: SendTestEmailInput): Record<string, unknown> {
  if (input.templateKey === "EMAIL-001") {
    return buildAccountActivationSampleData({
      firstName: input.firstName,
      organizationName: input.organizationName,
      assessmentName: input.assessmentName,
      activationUrl: PREVIEW_ACTIVATION_URL,
    });
  }

  if (input.templateKey === "EMAIL-010") {
    const base = {
      clientName: input.firstName,
      organizationName: input.organizationName,
    };
    if (input.vcioCustomerType === "assessment_customer") {
      return buildVcioWelcomeSampleData({
        ...base,
        heroTitle: "Welcome Back to StackScore vCIO",
        heroDescription:
          "Your existing assessment has been connected and your advisory roadmap is ready.",
        paragraphs: [
          "We connected your existing technology assessment, recommendations, improvement plan, and current projects.",
          "Complete the quick setup to tell us what has changed since your assessment, then schedule your first strategy session.",
        ],
        summaryItems: [
          "Technology Score: 72",
          "Recommendations are available",
          "Your roadmap is ready for review",
        ],
        primaryCta: {
          label: "Complete Quick Setup",
          href: "https://app.stackscore.example/portal/vcio/onboarding",
        },
      });
    }
    if (input.vcioCustomerType === "managed_services_client") {
      return buildVcioWelcomeSampleData({
        ...base,
        heroTitle: "Your StackScore vCIO Service Is Active",
        heroDescription:
          "Welcome back. Your Bobkat IT relationship is already connected to your vCIO planning workspace.",
        paragraphs: [
          "Your organization is already configured, so there is no lengthy setup process.",
          "Next, review your roadmap, share current priorities, and schedule your first strategy session.",
        ],
        summaryItems: [
          "Review your roadmap",
          "Begin quarterly planning",
          "Schedule your strategy session",
        ],
        primaryCta: {
          label: "Review Roadmap",
          href: "https://app.stackscore.example/portal/roadmap",
        },
      });
    }
    return buildVcioWelcomeSampleData(base);
  }

  return {
    firstName: input.firstName,
    organizationName: input.organizationName,
    assessmentName: input.assessmentName,
  };
}

function missingRequiredFields(templateKey: string, data: Record<string, unknown>) {
  const template = getEmailTemplate(templateKey);
  if (!template) return [];
  return template.requiredVariables.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === "";
  });
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
  const mergedData = {
    ...(template.sampleData as Record<string, unknown>),
    ...sampleOverrides,
  };
  const missing = missingRequiredFields(input.templateKey, mergedData);
  if (missing.length > 0) {
    throw new Error(`Missing required merge fields: ${missing.join(", ")}`);
  }
  const rendered = await renderCommunicationTemplate(input.templateKey, sampleOverrides, {
    isTest: true,
    useSampleDefaults: true,
  });

  try {
    const result = await recordAndSendCommunication({
      to: email,
      subject: `[TEST] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
      previewText: rendered.previewText,
      templateKey: input.templateKey,
      eventKey: "MANUAL_TEST_SEND",
      sendType: "TEST",
      triggeredBy: "admin_test_send",
      recipientName: input.firstName,
      isTest: true,
      createdByUserId: input.sentByUserId,
      metadata: {
        sampleFirstName: input.firstName,
        sampleOrganizationName: input.organizationName,
        sampleVcioCustomerType: input.vcioCustomerType,
      },
    });

    const record = await withCommunicationDbFallback(
      () =>
        prisma.communicationTestSend.create({
          data: {
            templateKey: input.templateKey,
            recipientEmail: email,
            providerMessageId: result.providerMessageId ?? null,
            status: "sent",
            sentByUserId: input.sentByUserId,
            communicationMessageId:
              result.messageId !== "untracked" ? result.messageId : null,
          },
        }),
      {
        id: "local-test-send",
        templateKey: input.templateKey,
        recipientEmail: email,
        providerMessageId: result.providerMessageId ?? null,
        status: "sent" as const,
        errorMessage: null,
        sentByUserId: input.sentByUserId,
        communicationMessageId: null,
        createdAt: new Date(),
      },
    );

    return {
      id: record.id,
      status: "sent",
      providerMessageId: result.providerMessageId,
      communicationMessageId: result.messageId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send test email";

    const record = await withCommunicationDbFallback(
      () =>
        prisma.communicationTestSend.create({
          data: {
            templateKey: input.templateKey,
            recipientEmail: email,
            status: "failed",
            errorMessage: message,
            sentByUserId: input.sentByUserId,
          },
        }),
      {
        id: "local-test-send-failed",
        templateKey: input.templateKey,
        recipientEmail: email,
        providerMessageId: null,
        status: "failed" as const,
        errorMessage: message,
        sentByUserId: input.sentByUserId,
        communicationMessageId: null,
        createdAt: new Date(),
      },
    );

    return {
      id: record.id,
      status: "failed",
      errorMessage: message,
    };
  }
}
