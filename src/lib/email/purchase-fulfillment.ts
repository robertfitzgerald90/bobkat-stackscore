import { sendEmail } from "@/lib/email/send";
import { getEmailConfig, isEmailConfigured, logEmailEnvDiagnostics } from "@/lib/email/config";
import {
  buildActivationEmail,
  buildActivationUrls,
  buildAssessmentReadyEmail,
} from "@/lib/email/templates/assessment-purchase";
import { purchaseTrace, purchaseTraceError, purchaseTraceStop } from "@/lib/purchase-trace";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";

export type PurchaseFulfillmentEmailInput = {
  purchaserEmail: string;
  requiresActivation: boolean;
  activationToken?: string;
};

/** Sends activation or assessment-ready email after successful purchase fulfillment. */
export async function sendPurchaseFulfillmentEmail(
  input: PurchaseFulfillmentEmailInput,
): Promise<void> {
  purchaseTrace("E01", "ENTER sendPurchaseFulfillmentEmail() [alias: sendActivationEmail]", {
    rawPurchaserEmail: input.purchaserEmail,
    requiresActivation: input.requiresActivation,
    hasActivationToken: Boolean(input.activationToken),
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

      purchaseTrace("E07", "BEFORE sendEmail() — activation template", { to: email });
      const content = buildActivationEmail({ activationUrl: urls.activationUrl });
      const result = await sendEmail({ to: email, ...content });
      purchaseTrace("E08", "AFTER sendEmail() — activation template", {
        to: email,
        provider: result.provider,
        messageId: result.id ?? null,
      });
      return;
    }

    purchaseTrace("E09", "Branch: requiresActivation === false (assessment-ready template)", {
      to: email,
    });

    purchaseTrace("E10", "BEFORE sendEmail() — assessment-ready template", { to: email });
    const content = buildAssessmentReadyEmail({
      loginUrl: urls.loginUrl,
      startUrl: urls.startUrl,
    });
    const result = await sendEmail({ to: email, ...content });
    purchaseTrace("E11", "AFTER sendEmail() — assessment-ready template", {
      to: email,
      provider: result.provider,
      messageId: result.id ?? null,
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
