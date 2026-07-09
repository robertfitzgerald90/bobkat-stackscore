import { sendEmail } from "@/lib/email/send";
import { getEmailConfig, isEmailConfigured, logEmailEnvDiagnostics } from "@/lib/email/config";
import {
  buildActivationEmail,
  buildActivationUrls,
  buildAssessmentReadyEmail,
} from "@/lib/email/templates/assessment-purchase";
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
  logEmailEnvDiagnostics("sendPurchaseFulfillmentEmail entry");

  const emailConfig = getEmailConfig();

  console.info("[email/purchase-fulfillment] >>> ENTER sendPurchaseFulfillmentEmail (alias: sendActivationEmail)", {
    purchaserEmail: input.purchaserEmail,
    requiresActivation: input.requiresActivation,
    hasActivationToken: Boolean(input.activationToken),
    resendApiKeyPresent: isEmailConfigured(),
    emailFrom: emailConfig.from,
  });

  const email = normalizePurchaserEmail(input.purchaserEmail);
  if (!email) {
    console.warn("[email/purchase-fulfillment] <<< EXIT sendPurchaseFulfillmentEmail — empty email (sendEmail NOT called)", {
      rawPurchaserEmail: input.purchaserEmail,
    });
    return;
  }

  const urls = input.activationToken
    ? buildActivationUrls(input.activationToken)
    : buildActivationUrls("");

  try {
    if (input.requiresActivation) {
      if (!input.activationToken) {
        console.error("[email/purchase-fulfillment] Missing activation token — sendEmail NOT called", {
          to: email,
        });
        throw new Error("Activation email requires activationToken");
      }

      console.info("[email/purchase-fulfillment] >>> BEFORE sendEmail() — activation template", { to: email });
      const content = buildActivationEmail({ activationUrl: urls.activationUrl });
      const result = await sendEmail({ to: email, ...content });
      console.info("[email/purchase-fulfillment] <<< AFTER sendEmail() — activation template", {
        to: email,
        provider: result.provider,
        messageId: result.id ?? null,
      });
      return;
    }

    console.info("[email/purchase-fulfillment] >>> BEFORE sendEmail() — assessment-ready template", { to: email });
    const content = buildAssessmentReadyEmail({
      loginUrl: urls.loginUrl,
      startUrl: urls.startUrl,
    });
    const result = await sendEmail({ to: email, ...content });
    console.info("[email/purchase-fulfillment] <<< AFTER sendEmail() — assessment-ready template", {
      to: email,
      provider: result.provider,
      messageId: result.id ?? null,
    });
  } catch (error) {
    console.error("[email/purchase-fulfillment] <<< CAUGHT ERROR in sendPurchaseFulfillmentEmail", {
      to: email,
      requiresActivation: input.requiresActivation,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    throw error;
  }
}

/** Alias for sendPurchaseFulfillmentEmail — same function, used in activation flow. */
export const sendActivationEmail = sendPurchaseFulfillmentEmail;
