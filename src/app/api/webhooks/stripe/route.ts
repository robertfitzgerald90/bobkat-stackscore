import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { logEmailEnvDiagnostics } from "@/lib/email/config";
import {
  sendActivationEmail,
  sendPurchaseFulfillmentEmail,
} from "@/lib/email/purchase-fulfillment";
import { fulfillTechnologyAssessmentPurchase } from "@/lib/stripe/fulfillment";
import { getStripe } from "@/lib/stripe/client";
import { requireStripeWebhookSecret } from "@/lib/stripe/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function resolvePurchaserEmailForEmail(
  session: Stripe.Checkout.Session,
  purchaseId?: string,
): Promise<string> {
  const fromSession = session.customer_details?.email ?? session.customer_email ?? "";
  if (fromSession.trim()) {
    return fromSession.trim();
  }

  if (purchaseId) {
    const purchase = await prisma.assessmentPurchase.findUnique({
      where: { id: purchaseId },
      select: { purchaserEmail: true },
    });
    if (purchase?.purchaserEmail) {
      console.info("[webhooks/stripe] Resolved purchaser email from purchase record", {
        purchaseId,
        purchaserEmail: purchase.purchaserEmail,
      });
      return purchase.purchaserEmail;
    }
  }

  return "";
}

export async function POST(request: Request) {
  logEmailEnvDiagnostics("stripe webhook POST entry");

  let webhookSecret: string;

  try {
    webhookSecret = requireStripeWebhookSecret();
  } catch (error) {
    console.error("[webhooks/stripe] Missing STRIPE_WEBHOOK_SECRET", error);
    return NextResponse.json(
      { error: "Webhook secret is not configured", code: "WEBHOOK_NOT_CONFIGURED" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature", code: "MISSING_SIGNATURE" },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[webhooks/stripe] Signature verification failed", error);
    return NextResponse.json(
      { error: "Invalid webhook signature", code: "INVALID_SIGNATURE" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.info("[webhooks/stripe] checkout.session.completed received", {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    });

    let fulfillmentResult;
    try {
      console.info("[webhooks/stripe] >>> BEFORE fulfillTechnologyAssessmentPurchase()");
      fulfillmentResult = await fulfillTechnologyAssessmentPurchase(session);
      console.info("[webhooks/stripe] <<< AFTER fulfillTechnologyAssessmentPurchase()", {
        sessionId: session.id,
        outcome: fulfillmentResult.outcome,
        purchaseId: fulfillmentResult.purchaseId,
      });
    } catch (error) {
      console.error("[webhooks/stripe] <<< CAUGHT ERROR in fulfillment", {
        sessionId: session.id,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      return NextResponse.json(
        { error: "Fulfillment failed", code: "FULFILLMENT_FAILED" },
        { status: 500 },
      );
    }

    const result = fulfillmentResult;

    console.info("[webhooks/stripe] Fulfillment finished — email branch decision", {
      sessionId: session.id,
      outcome: result.outcome,
      purchaseId: result.purchaseId,
      assessmentId: result.assessmentId,
      requiresActivation: result.requiresActivation,
      hasActivationToken: Boolean(result.activationToken),
      reason: result.reason,
      willCallSendEmail: result.outcome === "fulfilled",
    });

    if (result.outcome === "fulfilled") {
      const purchaserEmail = await resolvePurchaserEmailForEmail(session, result.purchaseId);

      const emailInput = {
        purchaserEmail,
        requiresActivation: result.requiresActivation ?? false,
        activationToken: result.activationToken,
      };

      console.info("[webhooks/stripe] >>> BEFORE sendPurchaseFulfillmentEmail / sendActivationEmail()", {
        sessionId: session.id,
        ...emailInput,
        hasActivationToken: Boolean(emailInput.activationToken),
        sendActivationEmailSameAsSendPurchaseFulfillmentEmail:
          sendActivationEmail === sendPurchaseFulfillmentEmail,
      });

      try {
        await sendPurchaseFulfillmentEmail(emailInput);
        console.info("[webhooks/stripe] <<< AFTER sendPurchaseFulfillmentEmail — completed without throw", {
          sessionId: session.id,
          purchaserEmail,
        });
      } catch (emailError) {
        console.error("[webhooks/stripe] <<< CAUGHT ERROR in sendPurchaseFulfillmentEmail / sendActivationEmail", {
          sessionId: session.id,
          purchaserEmail,
          message: emailError instanceof Error ? emailError.message : String(emailError),
          stack: emailError instanceof Error ? emailError.stack : undefined,
          error: emailError,
        });
        // Fulfillment succeeded; return 200 so Stripe does not retry into already_fulfilled skip path.
      }
    } else if (result.outcome === "already_fulfilled") {
      console.warn(
        "[webhooks/stripe] sendEmail() NOT called — outcome=already_fulfilled (sendPurchaseFulfillmentEmail skipped)",
        {
          sessionId: session.id,
          purchaseId: result.purchaseId,
          hint: "If first delivery created DB rows but email failed, Stripe retries will never send email.",
        },
      );
    } else {
      console.info("[webhooks/stripe] sendEmail() NOT called — fulfillment outcome does not send email", {
        sessionId: session.id,
        outcome: result.outcome,
        reason: result.reason,
      });
    }
  } else {
    console.info("[webhooks/stripe] Received event", { type: event.type, id: event.id });
  }

  return NextResponse.json({ received: true });
}
