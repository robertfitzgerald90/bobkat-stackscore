import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { logEmailEnvDiagnostics } from "@/lib/email/config";
import { sendPurchaseFulfillmentEmail } from "@/lib/email/purchase-fulfillment";
import { purchaseTrace, purchaseTraceError, purchaseTraceStop } from "@/lib/purchase-trace";
import {
  isStripeWebhookProcessed,
  markStripeWebhookProcessed,
} from "@/lib/billing/stripe-checkout";
import { handleBillingStripeEvent } from "@/lib/billing/stripe-webhook";
import { fulfillTechnologyAssessmentPurchase } from "@/lib/stripe/fulfillment";
import { getStripe } from "@/lib/stripe/client";
import { requireStripeWebhookSecret } from "@/lib/stripe/config";
import { isTechnologyAssessmentProduct } from "@/lib/stripe/products";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function resolvePurchaserEmailForEmail(
  session: Stripe.Checkout.Session,
  purchaseId?: string,
): Promise<string> {
  const fromSession = session.customer_details?.email ?? session.customer_email ?? "";
  if (fromSession.trim()) {
    purchaseTrace("W10a", "Purchaser email from Stripe session", {
      sessionId: session.id,
      purchaserEmail: fromSession.trim(),
    });
    return fromSession.trim();
  }

  if (purchaseId) {
    const purchase = await prisma.assessmentPurchase.findUnique({
      where: { id: purchaseId },
      select: { purchaserEmail: true },
    });
    if (purchase?.purchaserEmail) {
      purchaseTrace("W10b", "Purchaser email from AssessmentPurchase record", {
        sessionId: session.id,
        purchaseId,
        purchaserEmail: purchase.purchaserEmail,
      });
      return purchase.purchaserEmail;
    }
  }

  purchaseTrace("W10c", "Purchaser email unresolved — empty string", {
    sessionId: session.id,
    purchaseId: purchaseId ?? null,
  });
  return "";
}

async function handleAssessmentCheckoutCompleted(session: Stripe.Checkout.Session) {
  purchaseTrace("W06", "checkout.session.completed session loaded", {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    metadata: session.metadata ?? null,
  });

  let fulfillmentResult;
  try {
    purchaseTrace("W07", "BEFORE fulfillTechnologyAssessmentPurchase()", {
      sessionId: session.id,
    });
    fulfillmentResult = await fulfillTechnologyAssessmentPurchase(session);
    purchaseTrace("W08", "AFTER fulfillTechnologyAssessmentPurchase()", {
      sessionId: session.id,
      outcome: fulfillmentResult.outcome,
      purchaseId: fulfillmentResult.purchaseId ?? null,
      assessmentId: fulfillmentResult.assessmentId ?? null,
      requiresActivation: fulfillmentResult.requiresActivation ?? null,
      hasActivationToken: Boolean(fulfillmentResult.activationToken),
      reason: fulfillmentResult.reason ?? null,
    });
  } catch (error) {
    purchaseTraceError("W08", "route.ts → fulfillTechnologyAssessmentPurchase() throw", error, {
      sessionId: session.id,
    });
    return NextResponse.json(
      { error: "Fulfillment failed", code: "FULFILLMENT_FAILED" },
      { status: 500 },
    );
  }

  const result = fulfillmentResult;

  if (result.outcome !== "fulfilled") {
    purchaseTraceStop(
      "W09",
      "route.ts → if (result.outcome !== fulfilled)",
      `outcome=${result.outcome} — sendPurchaseFulfillmentEmail() NOT called`,
      {
        sessionId: session.id,
        outcome: result.outcome,
        reason: result.reason ?? null,
        purchaseId: result.purchaseId ?? null,
      },
    );
    return NextResponse.json({ received: true });
  }

  purchaseTrace("W09", "PASS outcome === fulfilled — entering email path", {
    sessionId: session.id,
    purchaseId: result.purchaseId ?? null,
  });

  const purchaserEmail = await resolvePurchaserEmailForEmail(session, result.purchaseId);

  const emailInput = {
    purchaserEmail,
    requiresActivation: result.requiresActivation ?? false,
    activationToken: result.activationToken,
    assessmentId: result.assessmentId,
  };

  purchaseTrace("W10", "BEFORE sendPurchaseFulfillmentEmail() [sendActivationEmail alias]", {
    sessionId: session.id,
    purchaserEmail: emailInput.purchaserEmail,
    requiresActivation: emailInput.requiresActivation,
    hasActivationToken: Boolean(emailInput.activationToken),
  });

  try {
    await sendPurchaseFulfillmentEmail(emailInput);
    purchaseTrace("W11", "AFTER sendPurchaseFulfillmentEmail() — completed without throw", {
      sessionId: session.id,
      purchaserEmail: emailInput.purchaserEmail,
    });
  } catch (emailError) {
    purchaseTraceError(
      "W11",
      "route.ts → sendPurchaseFulfillmentEmail() catch",
      emailError,
      {
        sessionId: session.id,
        purchaserEmail: emailInput.purchaserEmail,
      },
    );
  }

  return NextResponse.json({ received: true });
}

export async function POST(request: Request) {
  purchaseTrace("W01", "ENTER POST /api/webhooks/stripe", {
    url: request.url,
    method: request.method,
  });

  logEmailEnvDiagnostics("stripe webhook POST entry");

  let webhookSecret: string;

  try {
    webhookSecret = requireStripeWebhookSecret();
    purchaseTrace("W02", "PASS STRIPE_WEBHOOK_SECRET configured", {});
  } catch (error) {
    purchaseTraceError("W02", "route.ts → requireStripeWebhookSecret() throw", error, {});
    return NextResponse.json(
      { error: "Webhook secret is not configured", code: "WEBHOOK_NOT_CONFIGURED" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    purchaseTraceStop(
      "W03",
      "route.ts → if (!signature) return 400",
      "Missing stripe-signature header — fulfillment and email NOT reached",
      {},
    );
    return NextResponse.json(
      { error: "Missing Stripe signature", code: "MISSING_SIGNATURE" },
      { status: 400 },
    );
  }

  purchaseTrace("W03", "PASS stripe-signature header present", {});

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    purchaseTrace("W04", "PASS constructEvent — signature verified", {
      eventId: event.id,
      eventType: event.type,
    });
  } catch (error) {
    purchaseTraceError("W04", "route.ts → constructEvent() throw", error, {});
    return NextResponse.json(
      { error: "Invalid webhook signature", code: "INVALID_SIGNATURE" },
      { status: 400 },
    );
  }

  if (await isStripeWebhookProcessed(event.id)) {
    purchaseTrace("W05a", "Stripe event already processed — skipping", {
      eventId: event.id,
      eventType: event.type,
    });
    return NextResponse.json({ received: true });
  }

  const billingResult = await handleBillingStripeEvent(event);
  if (billingResult.handled) {
    purchaseTrace("W05b", "Billing webhook handled", {
      eventId: event.id,
      eventType: event.type,
      outcome: billingResult.outcome,
    });
    return NextResponse.json({ received: true });
  }

  const isAssessmentCheckoutEvent =
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded";

  if (!isAssessmentCheckoutEvent) {
    purchaseTraceStop(
      "W05",
      "route.ts → unhandled event type",
      `event.type=${event.type} — fulfillment and email NOT reached`,
      { eventId: event.id, eventType: event.type },
    );
    return NextResponse.json({ received: true });
  }

  purchaseTrace("W05", "PASS assessment checkout event path", {
    eventId: event.id,
    eventType: event.type,
  });

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.metadata?.productType === "stackscore_invoice") {
    await markStripeWebhookProcessed(event.id, event.type, { skipped: "stackscore_invoice" });
    return NextResponse.json({ received: true });
  }

  const productType = session.metadata?.productType ?? session.metadata?.product;
  if (!isTechnologyAssessmentProduct(productType)) {
    purchaseTraceStop(
      "W05c",
      "route.ts → non-assessment checkout session",
      `productType=${productType ?? "missing"} — assessment fulfillment skipped`,
      { eventId: event.id, sessionId: session.id },
    );
    await markStripeWebhookProcessed(event.id, event.type, {
      skipped: "non_assessment_product",
    });
    return NextResponse.json({ received: true });
  }

  const response = await handleAssessmentCheckoutCompleted(session);
  // Only mark processed on successful handling so Stripe retries can recover from 5xx.
  if (response.status < 400) {
    await markStripeWebhookProcessed(event.id, event.type, {
      sessionId: session.id,
      productType,
    });
  }

  purchaseTrace("W12", "EXIT POST /api/webhooks/stripe — returning response", {
    sessionId: session.id,
    status: response.status,
  });

  return response;
}
