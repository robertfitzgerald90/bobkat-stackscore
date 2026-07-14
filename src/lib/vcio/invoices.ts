import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { recordBillingAudit } from "@/lib/billing/audit";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { getStripe } from "@/lib/stripe/client";
import { getVcioPaymentGracePeriodDays } from "@/lib/vcio/constants";

type StripeInvoiceWithFields = Stripe.Invoice & {
  subscription?: string | { id: string } | null;
  payment_intent?: string | Stripe.PaymentIntent | null;
  charge?: string | Stripe.Charge | null;
  attempt_count?: number | null;
  next_payment_attempt?: number | null;
  customer?: string | Stripe.Customer | null;
  status_transitions?: {
    paid_at?: number | null;
    voided_at?: number | null;
  } | null;
  due_date?: number | null;
};

type PaymentMethodSummary = {
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
};

type SafeFailureInfo = {
  code: string | null;
  declineCode: string | null;
  message: string | null;
};

function stripeId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function dateFromStripeTimestamp(timestamp: number | null | undefined): Date | null {
  return typeof timestamp === "number" ? new Date(timestamp * 1000) : null;
}

async function retrieveExpandedInvoice(invoice: Stripe.Invoice): Promise<Stripe.Invoice> {
  try {
    const stripe = getStripe();
    return await stripe.invoices.retrieve(invoice.id, {
      expand: ["payment_intent.payment_method", "payment_intent.latest_charge"],
    });
  } catch (error) {
    console.warn("[vcio/invoices] Unable to retrieve expanded Stripe invoice", {
      invoiceId: invoice.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return invoice;
  }
}

function getPaymentIntent(invoice: StripeInvoiceWithFields): Stripe.PaymentIntent | null {
  if (!invoice.payment_intent || typeof invoice.payment_intent === "string") return null;
  return invoice.payment_intent;
}

function getCharge(invoice: StripeInvoiceWithFields): Stripe.Charge | null {
  const paymentIntent = getPaymentIntent(invoice) as
    | (Stripe.PaymentIntent & { latest_charge?: string | Stripe.Charge | null })
    | null;
  if (paymentIntent?.latest_charge && typeof paymentIntent.latest_charge !== "string") {
    return paymentIntent.latest_charge;
  }
  if (invoice.charge && typeof invoice.charge !== "string") return invoice.charge;
  return null;
}

function getPaymentMethodSummary(invoice: StripeInvoiceWithFields): PaymentMethodSummary {
  const paymentIntent = getPaymentIntent(invoice);
  const method = paymentIntent?.payment_method;
  if (method && typeof method !== "string" && method.card) {
    return {
      brand: method.card.brand ?? null,
      last4: method.card.last4 ?? null,
      expMonth: method.card.exp_month ?? null,
      expYear: method.card.exp_year ?? null,
    };
  }

  const charge = getCharge(invoice);
  const card = charge?.payment_method_details?.card;
  return {
    brand: card?.brand ?? null,
    last4: card?.last4 ?? null,
    expMonth: card?.exp_month ?? null,
    expYear: card?.exp_year ?? null,
  };
}

function getFailureInfo(invoice: StripeInvoiceWithFields): SafeFailureInfo {
  const paymentIntent = getPaymentIntent(invoice);
  const lastPaymentError = paymentIntent?.last_payment_error;
  const invoiceError = invoice.last_finalization_error;
  return {
    code: lastPaymentError?.code ?? invoiceError?.code ?? null,
    declineCode: lastPaymentError?.decline_code ?? null,
    message: lastPaymentError?.message ?? invoiceError?.message ?? null,
  };
}

function resolveAttemptStatus(
  invoice: StripeInvoiceWithFields,
  eventType?: string,
): "succeeded" | "failed" | "requires_action" | "processing" | "retrying" | "refunded" | "voided" {
  if (eventType === "invoice.voided" || invoice.status === "void") return "voided";
  if (eventType === "invoice.payment_action_required") return "requires_action";
  if (eventType === "invoice.payment_failed") {
    return invoice.next_payment_attempt ? "retrying" : "failed";
  }
  if (eventType === "invoice.paid" || invoice.status === "paid") return "succeeded";
  if (invoice.status === "open" || invoice.status === "draft") return "processing";
  return "processing";
}

function getAttemptDate(invoice: StripeInvoiceWithFields, status: string): Date {
  if (status === "succeeded") {
    return dateFromStripeTimestamp(invoice.status_transitions?.paid_at) ?? new Date();
  }
  if (status === "voided") {
    return dateFromStripeTimestamp(invoice.status_transitions?.voided_at) ?? new Date();
  }
  return new Date();
}

function getInvoiceAmountCents(invoice: Stripe.Invoice, status: string): number {
  if (status === "succeeded") return invoice.amount_paid ?? invoice.amount_due ?? 0;
  return invoice.amount_remaining ?? invoice.amount_due ?? invoice.amount_paid ?? 0;
}

export async function syncVcioInvoiceFromStripe(
  invoice: Stripe.Invoice,
  options: { eventId?: string; eventType?: string } = {},
) {
  const typedInvoice = (await retrieveExpandedInvoice(invoice)) as StripeInvoiceWithFields;
  const providerSubscriptionId = stripeId(typedInvoice.subscription);
  if (!providerSubscriptionId) return { outcome: "skipped", reason: "missing_subscription" } as const;

  const subscription = await prisma.subscription.findUnique({
    where: { providerSubscriptionId },
    select: { id: true, clientId: true, serviceType: true, providerCustomerId: true },
  });
  if (!subscription) return { outcome: "skipped", reason: "subscription_not_found" } as const;

  const paidAt = dateFromStripeTimestamp(typedInvoice.status_transitions?.paid_at);
  const paymentIntentId = stripeId(typedInvoice.payment_intent);
  const chargeId = stripeId(getCharge(typedInvoice));
  const paymentMethod = getPaymentMethodSummary(typedInvoice);
  const failure = getFailureInfo(typedInvoice);
  const attemptStatus = resolveAttemptStatus(typedInvoice, options.eventType);
  const attemptCount = typedInvoice.attempt_count ?? 0;
  const nextPaymentAttemptAt = dateFromStripeTimestamp(typedInvoice.next_payment_attempt);
  const attemptDate = getAttemptDate(typedInvoice, attemptStatus);

  const synced = await prisma.subscriptionInvoice.upsert({
    where: { providerInvoiceId: typedInvoice.id },
    create: {
      subscriptionId: subscription.id,
      clientId: subscription.clientId,
      provider: "stripe",
      providerInvoiceId: typedInvoice.id,
      providerPaymentIntentId: paymentIntentId,
      number: typedInvoice.number ?? null,
      amountDueCents: typedInvoice.amount_due ?? 0,
      amountPaidCents: typedInvoice.amount_paid ?? 0,
      currency: typedInvoice.currency ?? "usd",
      status: typedInvoice.status ?? "unknown",
      invoiceDate: dateFromStripeTimestamp(typedInvoice.created),
      dueDate: dateFromStripeTimestamp(typedInvoice.due_date),
      paidAt,
      attemptCount,
      nextPaymentAttemptAt,
      lastPaymentAttemptAt: attemptDate,
      lastPaymentAttemptStatus: attemptStatus,
      failureCode: failure.code,
      failureDeclineCode: failure.declineCode,
      failureMessage: failure.message,
      paymentMethodBrand: paymentMethod.brand,
      paymentMethodLast4: paymentMethod.last4,
      paymentMethodExpMonth: paymentMethod.expMonth,
      paymentMethodExpYear: paymentMethod.expYear,
      hostedInvoiceUrl: typedInvoice.hosted_invoice_url ?? null,
      invoicePdfUrl: typedInvoice.invoice_pdf ?? null,
    },
    update: {
      providerPaymentIntentId: paymentIntentId,
      number: typedInvoice.number ?? null,
      amountDueCents: typedInvoice.amount_due ?? 0,
      amountPaidCents: typedInvoice.amount_paid ?? 0,
      currency: typedInvoice.currency ?? "usd",
      status: typedInvoice.status ?? "unknown",
      invoiceDate: dateFromStripeTimestamp(typedInvoice.created),
      dueDate: dateFromStripeTimestamp(typedInvoice.due_date),
      paidAt,
      attemptCount,
      nextPaymentAttemptAt,
      lastPaymentAttemptAt: attemptDate,
      lastPaymentAttemptStatus: attemptStatus,
      failureCode: failure.code,
      failureDeclineCode: failure.declineCode,
      failureMessage: failure.message,
      paymentMethodBrand: paymentMethod.brand,
      paymentMethodLast4: paymentMethod.last4,
      paymentMethodExpMonth: paymentMethod.expMonth,
      paymentMethodExpYear: paymentMethod.expYear,
      hostedInvoiceUrl: typedInvoice.hosted_invoice_url ?? null,
      invoicePdfUrl: typedInvoice.invoice_pdf ?? null,
    },
  });

  await prisma.subscriptionPaymentAttempt.upsert({
    where: options.eventId
      ? { providerEventId: options.eventId }
      : {
          provider_providerInvoiceId_attemptCount_status: {
            provider: "stripe",
            providerInvoiceId: typedInvoice.id,
            attemptCount,
            status: attemptStatus,
          },
        },
    create: {
      subscriptionId: subscription.id,
      subscriptionInvoiceId: synced.id,
      clientId: subscription.clientId,
      provider: "stripe",
      providerEventId: options.eventId ?? null,
      providerInvoiceId: typedInvoice.id,
      providerPaymentIntentId: paymentIntentId,
      providerChargeId: chargeId,
      serviceType: subscription.serviceType,
      status: attemptStatus,
      attemptDate,
      invoiceNumber: typedInvoice.number ?? null,
      amountCents: getInvoiceAmountCents(typedInvoice, attemptStatus),
      currency: typedInvoice.currency ?? "usd",
      failureCode: failure.code,
      failureDeclineCode: failure.declineCode,
      failureMessage: failure.message,
      attemptCount,
      nextPaymentAttemptAt,
      paymentMethodBrand: paymentMethod.brand,
      paymentMethodLast4: paymentMethod.last4,
      paymentMethodExpMonth: paymentMethod.expMonth,
      paymentMethodExpYear: paymentMethod.expYear,
      hostedInvoiceUrl: typedInvoice.hosted_invoice_url ?? null,
      stripeCustomerId: stripeId(typedInvoice.customer) ?? subscription.providerCustomerId,
    },
    update: {
      subscriptionInvoiceId: synced.id,
      providerPaymentIntentId: paymentIntentId,
      providerChargeId: chargeId,
      status: attemptStatus,
      attemptDate,
      invoiceNumber: typedInvoice.number ?? null,
      amountCents: getInvoiceAmountCents(typedInvoice, attemptStatus),
      currency: typedInvoice.currency ?? "usd",
      failureCode: failure.code,
      failureDeclineCode: failure.declineCode,
      failureMessage: failure.message,
      attemptCount,
      nextPaymentAttemptAt,
      paymentMethodBrand: paymentMethod.brand,
      paymentMethodLast4: paymentMethod.last4,
      paymentMethodExpMonth: paymentMethod.expMonth,
      paymentMethodExpYear: paymentMethod.expYear,
      hostedInvoiceUrl: typedInvoice.hosted_invoice_url ?? null,
      stripeCustomerId: stripeId(typedInvoice.customer) ?? subscription.providerCustomerId,
    },
  });

  if (typedInvoice.status === "paid") {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        lastPaymentAt: paidAt ?? new Date(),
        paymentFailedAt: null,
        paymentActionRequiredAt: null,
        latestInvoiceProviderId: typedInvoice.id,
      },
    });
    await recordBillingAudit({
      clientId: subscription.clientId,
      action: "payment_succeeded",
      metadata: {
        providerInvoiceId: typedInvoice.id,
        subscriptionId: subscription.id,
      },
    });
  }

  await recordOrganizationActivity({
    clientId: subscription.clientId,
    category: "BILLING",
    eventType: "vcio_invoice_synced",
    title: "StackScore vCIO invoice synchronized",
    description: `Invoice ${typedInvoice.number ?? typedInvoice.id} is ${typedInvoice.status ?? "unknown"}.`,
    sourceRecordType: "SubscriptionInvoice",
    sourceRecordId: synced.id,
    visibility: "INTERNAL",
    metadata: {
      providerInvoiceId: typedInvoice.id,
      status: typedInvoice.status,
      attemptStatus,
    },
  });

  return { outcome: "synced", invoice: synced } as const;
}

export async function markVcioInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  options: { eventId?: string } = {},
) {
  const result = await syncVcioInvoiceFromStripe(invoice, {
    eventId: options.eventId,
    eventType: "invoice.payment_failed",
  });
  if (result.outcome !== "synced") return result;

  await prisma.subscription.update({
    where: { id: result.invoice.subscriptionId },
    data: {
      status: "past_due",
      rawStatus: "past_due",
      paymentFailedAt: new Date(),
      latestInvoiceProviderId: result.invoice.providerInvoiceId,
    },
  });

  await recordBillingAudit({
    clientId: result.invoice.clientId,
    action: "payment_failed",
    metadata: {
      providerInvoiceId: result.invoice.providerInvoiceId,
      subscriptionId: result.invoice.subscriptionId,
    },
  });

  await recordOrganizationActivity({
    clientId: result.invoice.clientId,
    category: "BILLING",
    eventType: "vcio_payment_failed",
    title: "StackScore vCIO payment failed",
    description: "The subscription payment needs attention.",
    sourceRecordType: "SubscriptionInvoice",
    sourceRecordId: result.invoice.id,
    visibility: "CLIENT_VISIBLE",
    metadata: {
      providerInvoiceId: result.invoice.providerInvoiceId,
    },
  });

  const client = await prisma.client.findUnique({
    where: { id: result.invoice.clientId },
    select: {
      primaryContactEmail: true,
      users: { select: { id: true }, take: 1 },
    },
  });
  if (client?.primaryContactEmail) {
    const { sendVcioAdminNotification, sendVcioPaymentFailedEmail } = await import(
      "@/lib/vcio/emails"
    );
    await sendVcioPaymentFailedEmail({
      clientId: result.invoice.clientId,
      userId: client.users[0]?.id ?? null,
      to: client.primaryContactEmail,
      gracePeriodDays: getVcioPaymentGracePeriodDays(),
    });
    await sendVcioAdminNotification({
      subject: "StackScore vCIO payment failed",
      eventType: "vcio_payment_failed",
      body: `A StackScore vCIO payment failed for client ${result.invoice.clientId}.`,
    });
  }

  return result;
}

export async function markVcioInvoiceActionRequired(
  invoice: Stripe.Invoice,
  options: { eventId?: string } = {},
) {
  const result = await syncVcioInvoiceFromStripe(invoice, {
    eventId: options.eventId,
    eventType: "invoice.payment_action_required",
  });
  if (result.outcome !== "synced") return result;

  await prisma.subscription.update({
    where: { id: result.invoice.subscriptionId },
    data: {
      paymentActionRequiredAt: new Date(),
      latestInvoiceProviderId: result.invoice.providerInvoiceId,
    },
  });

  return result;
}

export async function markVcioInvoiceVoided(
  invoice: Stripe.Invoice,
  options: { eventId?: string } = {},
) {
  return syncVcioInvoiceFromStripe(invoice, {
    eventId: options.eventId,
    eventType: "invoice.voided",
  });
}

export async function markVcioPaymentAttemptRefundedFromCharge(
  charge: Stripe.Charge,
  options: { eventId?: string } = {},
) {
  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  const existing = await prisma.subscriptionPaymentAttempt.findFirst({
    where: {
      OR: [
        { providerChargeId: charge.id },
        ...(paymentIntentId ? [{ providerPaymentIntentId: paymentIntentId }] : []),
      ],
    },
    include: { subscriptionInvoice: true },
  });

  if (!existing) return { outcome: "skipped", reason: "payment_attempt_not_found" } as const;

  const updated = await prisma.subscriptionPaymentAttempt.upsert({
    where: options.eventId ? { providerEventId: options.eventId } : { id: existing.id },
    create: {
      subscriptionId: existing.subscriptionId,
      subscriptionInvoiceId: existing.subscriptionInvoiceId,
      clientId: existing.clientId,
      provider: "stripe",
      providerEventId: options.eventId ?? null,
      providerInvoiceId: existing.providerInvoiceId,
      providerPaymentIntentId: paymentIntentId ?? existing.providerPaymentIntentId,
      providerChargeId: charge.id,
      serviceType: existing.serviceType,
      status: "refunded",
      attemptDate: new Date(),
      invoiceNumber: existing.invoiceNumber,
      amountCents: charge.amount_refunded ?? existing.amountCents,
      currency: charge.currency ?? existing.currency,
      attemptCount: existing.attemptCount,
      paymentMethodBrand: existing.paymentMethodBrand,
      paymentMethodLast4: existing.paymentMethodLast4,
      paymentMethodExpMonth: existing.paymentMethodExpMonth,
      paymentMethodExpYear: existing.paymentMethodExpYear,
      hostedInvoiceUrl: existing.hostedInvoiceUrl,
      stripeCustomerId: existing.stripeCustomerId,
    },
    update: {
      status: "refunded",
      providerChargeId: charge.id,
      amountCents: charge.amount_refunded ?? existing.amountCents,
    },
  });

  if (existing.subscriptionInvoiceId) {
    await prisma.subscriptionInvoice.update({
      where: { id: existing.subscriptionInvoiceId },
      data: { lastPaymentAttemptStatus: "refunded" },
    });
  }

  return { outcome: "synced", paymentAttempt: updated } as const;
}
