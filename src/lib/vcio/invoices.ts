import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { recordBillingAudit } from "@/lib/billing/audit";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { getVcioPaymentGracePeriodDays } from "@/lib/vcio/constants";

type StripeInvoiceWithFields = Stripe.Invoice & {
  subscription?: string | { id: string } | null;
  payment_intent?: string | { id: string } | null;
  status_transitions?: {
    paid_at?: number | null;
  } | null;
  due_date?: number | null;
};

function stripeId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function dateFromStripeTimestamp(timestamp: number | null | undefined): Date | null {
  return typeof timestamp === "number" ? new Date(timestamp * 1000) : null;
}

export async function syncVcioInvoiceFromStripe(invoice: Stripe.Invoice) {
  const typedInvoice = invoice as StripeInvoiceWithFields;
  const providerSubscriptionId = stripeId(typedInvoice.subscription);
  if (!providerSubscriptionId) return { outcome: "skipped", reason: "missing_subscription" } as const;

  const subscription = await prisma.subscription.findUnique({
    where: { providerSubscriptionId },
    select: { id: true, clientId: true },
  });
  if (!subscription) return { outcome: "skipped", reason: "subscription_not_found" } as const;

  const paidAt = dateFromStripeTimestamp(typedInvoice.status_transitions?.paid_at);
  const synced = await prisma.subscriptionInvoice.upsert({
    where: { providerInvoiceId: invoice.id },
    create: {
      subscriptionId: subscription.id,
      clientId: subscription.clientId,
      provider: "stripe",
      providerInvoiceId: invoice.id,
      providerPaymentIntentId: stripeId(typedInvoice.payment_intent),
      number: invoice.number ?? null,
      amountDueCents: invoice.amount_due ?? 0,
      amountPaidCents: invoice.amount_paid ?? 0,
      currency: invoice.currency ?? "usd",
      status: invoice.status ?? "unknown",
      invoiceDate: dateFromStripeTimestamp(invoice.created),
      dueDate: dateFromStripeTimestamp(typedInvoice.due_date),
      paidAt,
      hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
      invoicePdfUrl: invoice.invoice_pdf ?? null,
    },
    update: {
      providerPaymentIntentId: stripeId(typedInvoice.payment_intent),
      number: invoice.number ?? null,
      amountDueCents: invoice.amount_due ?? 0,
      amountPaidCents: invoice.amount_paid ?? 0,
      currency: invoice.currency ?? "usd",
      status: invoice.status ?? "unknown",
      invoiceDate: dateFromStripeTimestamp(invoice.created),
      dueDate: dateFromStripeTimestamp(typedInvoice.due_date),
      paidAt,
      hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
      invoicePdfUrl: invoice.invoice_pdf ?? null,
    },
  });

  if (invoice.status === "paid") {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        lastPaymentAt: paidAt ?? new Date(),
        paymentFailedAt: null,
        paymentActionRequiredAt: null,
        latestInvoiceProviderId: invoice.id,
      },
    });
    await recordBillingAudit({
      clientId: subscription.clientId,
      action: "payment_succeeded",
      metadata: {
        providerInvoiceId: invoice.id,
        subscriptionId: subscription.id,
      },
    });
  }

  await recordOrganizationActivity({
    clientId: subscription.clientId,
    category: "BILLING",
    eventType: "vcio_invoice_synced",
    title: "StackScore vCIO invoice synchronized",
    description: `Invoice ${invoice.number ?? invoice.id} is ${invoice.status ?? "unknown"}.`,
    sourceRecordType: "SubscriptionInvoice",
    sourceRecordId: synced.id,
    visibility: "INTERNAL",
    metadata: {
      providerInvoiceId: invoice.id,
      status: invoice.status,
    },
  });

  return { outcome: "synced", invoice: synced } as const;
}

export async function markVcioInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const result = await syncVcioInvoiceFromStripe(invoice);
  if (result.outcome !== "synced") return result;

  await prisma.subscription.update({
    where: { id: result.invoice.subscriptionId },
    data: {
      status: "past_due",
      rawStatus: "past_due",
      paymentFailedAt: new Date(),
      latestInvoiceProviderId: invoice.id,
    },
  });

  await recordBillingAudit({
    clientId: result.invoice.clientId,
    action: "payment_failed",
    metadata: {
      providerInvoiceId: invoice.id,
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
      providerInvoiceId: invoice.id,
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

export async function markVcioInvoiceActionRequired(invoice: Stripe.Invoice) {
  const result = await syncVcioInvoiceFromStripe(invoice);
  if (result.outcome !== "synced") return result;

  await prisma.subscription.update({
    where: { id: result.invoice.subscriptionId },
    data: {
      paymentActionRequiredAt: new Date(),
      latestInvoiceProviderId: invoice.id,
    },
  });

  return result;
}
