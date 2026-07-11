import { getEmailConfig, isEmailConfigured, logEmailEnvDiagnostics } from "@/lib/email/config";
import {
  buildActivationEmail,
  buildActivationUrls,
  buildAssessmentReadyEmail,
} from "@/lib/email/templates/assessment-purchase";
import { recordAndSendCommunication } from "@/lib/communications/tracking/record-outbound";
import { purchaseTrace, purchaseTraceError, purchaseTraceStop } from "@/lib/purchase-trace";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";
import { prisma } from "@/lib/db";

export type PurchaseFulfillmentEmailInput = {
  purchaserEmail: string;
  requiresActivation: boolean;
  activationToken?: string;
  assessmentId?: string;
};

async function resolveFulfillmentContext(assessmentId?: string) {
  if (!assessmentId) return { clientId: null, userId: null, assessmentId: null as string | null };
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      id: true,
      clientId: true,
      client: {
        select: {
          users: { select: { id: true, email: true }, take: 1 },
        },
      },
    },
  });
  if (!assessment) {
    return { clientId: null, userId: null, assessmentId: null as string | null };
  }
  return {
    clientId: assessment.clientId,
    userId: assessment.client.users[0]?.id ?? null,
    assessmentId: assessment.id,
  };
}

/** Sends activation or assessment-ready email after successful purchase fulfillment. */
export async function sendPurchaseFulfillmentEmail(
  input: PurchaseFulfillmentEmailInput,
): Promise<void> {
  purchaseTrace("E01", "ENTER sendPurchaseFulfillmentEmail() [alias: sendActivationEmail]", {
    rawPurchaserEmail: input.purchaserEmail,
    requiresActivation: input.requiresActivation,
    hasActivationToken: Boolean(input.activationToken),
    assessmentId: input.assessmentId ?? null,
  });

  logEmailEnvDiagnostics("sendPurchaseFulfillmentEmail entry");

  const emailConfig = getEmailConfig();

  purchaseTrace("E02", "sendPurchaseFulfillmentEmail config", {
    resendApiKeyPresent: isEmailConfigured(),
    emailFrom: emailConfig.from,
  });

  const email = normalizePurchaserEmail(input.purchaserEmail);

  purchaseTrace("E03", "sendPurchaseFulfillmentEmail email normalized", {
    rawPurchaserEmail: input.purchaserEmail,
    normalizedEmail: email || null,
  });

  if (!email) {
    purchaseTraceStop(
      "E04",
      "purchase-fulfillment.ts → if (!email) return",
      "Normalized purchaser email is empty — sendEmail() NOT called",
      { rawPurchaserEmail: input.purchaserEmail },
    );
    return;
  }

  const context = await resolveFulfillmentContext(input.assessmentId);

  const urls = input.activationToken
    ? buildActivationUrls(input.activationToken)
    : buildActivationUrls("");

  try {
    if (input.requiresActivation) {
      purchaseTrace("E05", "Branch: requiresActivation === true", { to: email });

      if (!input.activationToken) {
        purchaseTraceStop(
          "E06",
          "purchase-fulfillment.ts → if (!input.activationToken) throw",
          "Activation required but token missing — sendEmail() NOT called",
          { to: email },
        );
        throw new Error("Activation email requires activationToken");
      }

      purchaseTrace("E07", "BEFORE recordAndSendCommunication() — activation template", { to: email });
      const content = await buildActivationEmail({ activationUrl: urls.activationUrl });
      const result = await recordAndSendCommunication({
        to: email,
        subject: content.subject,
        html: content.html,
        text: content.text,
        templateKey: "EMAIL-001",
        clientId: context.clientId,
        userId: context.userId,
        assessmentId: context.assessmentId,
        metadata: {
          workflow: "assessment_purchase_activation",
          assessmentId: context.assessmentId,
        },
      });
      purchaseTrace("E08", "AFTER recordAndSendCommunication() — activation template", {
        to: email,
        provider: result.provider,
        messageId: result.messageId,
        providerMessageId: result.providerMessageId ?? null,
      });
      return;
    }

    purchaseTrace("E09", "Branch: requiresActivation === false (assessment-ready template)", {
      to: email,
    });

    purchaseTrace("E10", "BEFORE recordAndSendCommunication() — assessment-ready template", { to: email });
    const content = buildAssessmentReadyEmail({
      loginUrl: urls.loginUrl,
      startUrl: urls.startUrl,
    });
    const result = await recordAndSendCommunication({
      to: email,
      subject: content.subject,
      html: content.html,
      text: content.text,
      templateKey: "LEGACY-ASSESSMENT-READY",
      clientId: context.clientId,
      userId: context.userId,
      assessmentId: context.assessmentId,
      metadata: { workflow: "assessment_ready" },
    });
    purchaseTrace("E11", "AFTER recordAndSendCommunication() — assessment-ready template", {
      to: email,
      provider: result.provider,
      messageId: result.messageId,
      providerMessageId: result.providerMessageId ?? null,
    });
  } catch (error) {
    purchaseTraceError("E12", "purchase-fulfillment.ts catch", error, {
      to: email,
      requiresActivation: input.requiresActivation,
    });
    throw error;
  }
}

/** Alias for sendPurchaseFulfillmentEmail — same function reference. */
export const sendActivationEmail = sendPurchaseFulfillmentEmail;
