import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { recordBillingAudit } from "@/lib/billing/audit";
import { recordStripePayment } from "@/lib/billing/payment-service";
import {
  isStripeWebhookProcessed,
  markStripeWebhookProcessed,
} from "@/lib/billing/stripe-checkout";
import { getStripe } from "@/lib/stripe/client";
import {
  isStackScoreVcioProduct,
  STACKSCORE_VCIO_SERVICE_TYPE,
} from "@/lib/stripe/products";
import {
  fulfillVcioCheckoutSession,
  syncVcioSubscriptionFromStripe,
} from "@/lib/vcio/subscriptions";
import {
  markVcioInvoiceActionRequired,
  markVcioInvoicePaymentFailed,
  markVcioInvoiceVoided,
  markVcioPaymentAttemptRefundedFromCharge,
  syncVcioInvoiceFromStripe,
} from "@/lib/vcio/invoices";

export type InvoiceWebhookResult =
  | {
      handled: true;
      outcome:
        | "paid"
        | "failed"
        | "refunded"
        | "disputed"
        | "skipped"
        | "subscription_synced"
        | "invoice_synced"
        | "action_required"
        | "voided";
    }
  | { handled: false };

export async function handleBillingStripeEvent(event: Stripe.Event): Promise<InvoiceWebhookResult> {
  if (await isStripeWebhookProcessed(event.id)) {
    return { handled: true, outcome: "skipped" };
  }

  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutCompleted(event);
    case "checkout.session.async_payment_succeeded":
      return handleCheckoutAsyncSucceeded(event);
    case "checkout.session.async_payment_failed":
      return handleCheckoutFailed(event);
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      return handleSubscriptionEvent(event);
    case "invoice.created":
    case "invoice.finalized":
    case "invoice.paid":
      return handleInvoiceSynced(event);
    case "invoice.payment_failed":
      return handleInvoicePaymentFailed(event);
    case "invoice.payment_action_required":
      return handleInvoicePaymentActionRequired(event);
    case "invoice.voided":
      return handleInvoiceVoided(event);
    case "payment_intent.payment_failed":
      return handlePaymentIntentFailed(event);
    case "charge.refunded":
      return handleChargeRefunded(event);
    case "charge.dispute.created":
      return handleDisputeCreated(event);
    default:
      return { handled: false };
  }
}

async function handleCheckoutCompleted(event: Stripe.Event): Promise<InvoiceWebhookResult> {
  const session = event.data.object as Stripe.Checkout.Session;
  if (isStackScoreVcioProduct(session.metadata?.productType)) {
    await fulfillVcioCheckoutSession(session);
    await markStripeWebhookProcessed(event.id, event.type, event);
    return { handled: true, outcome: "subscription_synced" };
  }

  if (session.metadata?.productType !== "stackscore_invoice") {
    return { handled: false };
  }

  const invoiceId = session.metadata.invoiceId;
  const clientId = session.metadata.clientId;
  if (!invoiceId || !clientId) {
    await markStripeWebhookProcessed(event.id, event.type, event);
    return { handled: true, outcome: "skipped" };
  }

  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    await markStripeWebhookProcessed(event.id, event.type, event);
    return { handled: true, outcome: "skipped" };
  }

  const amountCents = session.amount_total ?? 0;
  await recordStripePayment({
    clientId,
    invoiceId,
    amountCents,
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
  });

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id,
    },
  });

  const deposit = await prisma.billingDeposit.findFirst({
    where: { clientId, invoices: { some: { id: invoiceId } } },
  });
  if (deposit && ["invoice_sent", "partially_paid", "requested"].includes(deposit.status)) {
    await prisma.billingDeposit.update({
      where: { id: deposit.id },
      data: { status: "paid", paidAt: new Date() },
    });
  }

  await markStripeWebhookProcessed(event.id, event.type, event);
  return { handled: true, outcome: "paid" };
}

async function handleCheckoutAsyncSucceeded(event: Stripe.Event): Promise<InvoiceWebhookResult> {
  const session = event.data.object as Stripe.Checkout.Session;
  if (isStackScoreVcioProduct(session.metadata?.productType)) {
    await fulfillVcioCheckoutSession(session);
    await markStripeWebhookProcessed(event.id, event.type, event);
    return { handled: true, outcome: "subscription_synced" };
  }
  return { handled: false };
}

async function handleCheckoutFailed(event: Stripe.Event): Promise<InvoiceWebhookResult> {
  const session = event.data.object as Stripe.Checkout.Session;
  if (isStackScoreVcioProduct(session.metadata?.productType)) {
    await markStripeWebhookProcessed(event.id, event.type, event);
    return { handled: true, outcome: "failed" };
  }

  if (session.metadata?.productType !== "stackscore_invoice") {
    return { handled: false };
  }

  const invoiceId = session.metadata.invoiceId;
  const clientId = session.metadata.clientId;

  if (clientId && invoiceId) {
    await recordBillingAudit({
      clientId,
      invoiceId,
      action: "payment_failed",
      metadata: { stripeSessionId: session.id },
    });
  }

  await markStripeWebhookProcessed(event.id, event.type, event);
  return { handled: true, outcome: "failed" };
}

function isVcioSubscription(subscription: Stripe.Subscription): boolean {
  const priceId = subscription.items.data[0]?.price.id;
  return (
    isStackScoreVcioProduct(subscription.metadata?.productType) ||
    subscription.metadata?.serviceType === STACKSCORE_VCIO_SERVICE_TYPE ||
    (Boolean(process.env.STRIPE_VCIO_PRICE_ID) && priceId === process.env.STRIPE_VCIO_PRICE_ID)
  );
}

async function retrieveExpandedSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price.product", "latest_invoice"],
  });
}

async function handleSubscriptionEvent(event: Stripe.Event): Promise<InvoiceWebhookResult> {
  const subscription = event.data.object as Stripe.Subscription;
  const expanded = await retrieveExpandedSubscription(subscription.id);
  if (!isVcioSubscription(expanded)) {
    return { handled: false };
  }

  await syncVcioSubscriptionFromStripe(expanded, {
    stripeEventCreatedAt: new Date(event.created * 1000),
  });
  await markStripeWebhookProcessed(event.id, event.type, event);
  return { handled: true, outcome: "subscription_synced" };
}

async function syncSubscriptionForInvoice(invoice: Stripe.Invoice) {
  const invoiceWithSubscription = invoice as Stripe.Invoice & {
    subscription?: string | { id: string } | null;
  };
  const subscriptionId =
    typeof invoiceWithSubscription.subscription === "string"
      ? invoiceWithSubscription.subscription
      : invoiceWithSubscription.subscription?.id;

  if (!subscriptionId) return;
  const local = await prisma.subscription.findUnique({
    where: { providerSubscriptionId: subscriptionId },
    select: { id: true },
  });
  if (local) return;

  const expanded = await retrieveExpandedSubscription(subscriptionId);
  if (isVcioSubscription(expanded)) {
    await syncVcioSubscriptionFromStripe(expanded);
  }
}

async function handleInvoiceSynced(event: Stripe.Event): Promise<InvoiceWebhookResult> {
  const invoice = event.data.object as Stripe.Invoice;
  await syncSubscriptionForInvoice(invoice);
  const result = await syncVcioInvoiceFromStripe(invoice, {
    eventId: event.id,
    eventType: event.type,
  });
  if (result.outcome !== "synced") return { handled: false };

  await markStripeWebhookProcessed(event.id, event.type, event);
  return { handled: true, outcome: "invoice_synced" };
}

async function handleInvoicePaymentFailed(event: Stripe.Event): Promise<InvoiceWebhookResult> {
  const invoice = event.data.object as Stripe.Invoice;
  await syncSubscriptionForInvoice(invoice);
  const result = await markVcioInvoicePaymentFailed(invoice, { eventId: event.id });
  if (result.outcome !== "synced") return { handled: false };

  await markStripeWebhookProcessed(event.id, event.type, event);
  return { handled: true, outcome: "failed" };
}

async function handleInvoicePaymentActionRequired(event: Stripe.Event): Promise<InvoiceWebhookResult> {
  const invoice = event.data.object as Stripe.Invoice;
  await syncSubscriptionForInvoice(invoice);
  const result = await markVcioInvoiceActionRequired(invoice, { eventId: event.id });
  if (result.outcome !== "synced") return { handled: false };

  await markStripeWebhookProcessed(event.id, event.type, event);
  return { handled: true, outcome: "action_required" };
}

async function handleInvoiceVoided(event: Stripe.Event): Promise<InvoiceWebhookResult> {
  const invoice = event.data.object as Stripe.Invoice;
  await syncSubscriptionForInvoice(invoice);
  const result = await markVcioInvoiceVoided(invoice, { eventId: event.id });
  if (result.outcome !== "synced") return { handled: false };

  await markStripeWebhookProcessed(event.id, event.type, event);
  return { handled: true, outcome: "voided" };
}

async function handlePaymentIntentFailed(event: Stripe.Event): Promise<InvoiceWebhookResult> {
  const intent = event.data.object as Stripe.PaymentIntent;
  const invoice = await prisma.invoice.findFirst({
    where: { stripePaymentIntentId: intent.id },
  });
  if (!invoice) return { handled: false };

  await prisma.billingPayment.create({
    data: {
      clientId: invoice.clientId,
      amountCents: intent.amount,
      paymentDate: new Date(),
      method: "card",
      status: "failed",
      processor: "stripe",
      stripePaymentIntentId: intent.id,
      transactionReference: intent.id,
    },
  });

  await recordBillingAudit({
    clientId: invoice.clientId,
    invoiceId: invoice.id,
    action: "payment_failed",
    metadata: { paymentIntentId: intent.id },
  });

  await markStripeWebhookProcessed(event.id, event.type, event);
  return { handled: true, outcome: "failed" };
}

async function handleChargeRefunded(event: Stripe.Event): Promise<InvoiceWebhookResult> {
  const charge = event.data.object as Stripe.Charge;
  const vcioResult = await markVcioPaymentAttemptRefundedFromCharge(charge, { eventId: event.id });
  if (vcioResult.outcome === "synced") {
    await markStripeWebhookProcessed(event.id, event.type, event);
    return { handled: true, outcome: "refunded" };
  }

  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;

  const payment = paymentIntentId
    ? await prisma.billingPayment.findFirst({ where: { stripePaymentIntentId: paymentIntentId } })
    : null;

  if (payment) {
    await prisma.billingPayment.update({
      where: { id: payment.id },
      data: {
        status: charge.amount_refunded >= charge.amount ? "refunded" : "partially_refunded",
        refundStatus: "refunded",
      },
    });

    const invoiceApp = await prisma.paymentApplication.findFirst({
      where: { paymentId: payment.id },
      include: { invoice: true },
    });

    if (invoiceApp?.invoice) {
      await prisma.invoice.update({
        where: { id: invoiceApp.invoice.id },
        data: { status: "refunded" },
      });
    }

    await recordBillingAudit({
      clientId: payment.clientId,
      paymentId: payment.id,
      action: "refund_recorded",
      metadata: { chargeId: charge.id, amountRefunded: charge.amount_refunded },
    });
  }

  await markStripeWebhookProcessed(event.id, event.type, event);
  return { handled: true, outcome: "refunded" };
}

async function handleDisputeCreated(event: Stripe.Event): Promise<InvoiceWebhookResult> {
  const dispute = event.data.object as Stripe.Dispute;
  const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;
  if (!chargeId) {
    await markStripeWebhookProcessed(event.id, event.type, event);
    return { handled: true, outcome: "skipped" };
  }

  const payment = await prisma.billingPayment.findFirst({ where: { stripeChargeId: chargeId } });
  if (payment) {
    await prisma.billingPayment.update({
      where: { id: payment.id },
      data: { status: "disputed" },
    });
    await recordBillingAudit({
      clientId: payment.clientId,
      paymentId: payment.id,
      action: "payment_failed",
      metadata: { disputeId: dispute.id, reason: dispute.reason },
    });
  }

  await markStripeWebhookProcessed(event.id, event.type, event);
  return { handled: true, outcome: "disputed" };
}
