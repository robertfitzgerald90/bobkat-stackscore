import type { BillingPaymentMethod, BillingPaymentProcessor } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { recordBillingAudit } from "@/lib/billing/audit";
import { refreshInvoicePaymentState } from "@/lib/billing/invoice-service";

export type RecordManualPaymentInput = {
  clientId: string;
  invoiceId?: string;
  amountCents: number;
  paymentDate: Date;
  method: BillingPaymentMethod;
  transactionReference?: string;
  notes?: string;
  recordedByUserId: string;
};

export async function recordManualPayment(input: RecordManualPaymentInput) {
  const payment = await prisma.billingPayment.create({
    data: {
      clientId: input.clientId,
      amountCents: input.amountCents,
      paymentDate: input.paymentDate,
      method: input.method,
      status: "succeeded",
      processor: "manual",
      transactionReference: input.transactionReference,
      notes: input.notes,
      recordedByUserId: input.recordedByUserId,
      unappliedAmountCents: input.invoiceId ? 0 : input.amountCents,
    },
  });

  if (input.invoiceId) {
    await applyPaymentToInvoice(payment.id, input.invoiceId, input.amountCents);
  }

  await recordBillingAudit({
    clientId: input.clientId,
    paymentId: payment.id,
    invoiceId: input.invoiceId,
    action: "payment_recorded",
    actorUserId: input.recordedByUserId,
    metadata: { method: input.method, amountCents: input.amountCents },
  });

  return payment;
}

export async function applyPaymentToInvoice(
  paymentId: string,
  invoiceId: string,
  appliedCents: number,
) {
  const [payment, invoice] = await Promise.all([
    prisma.billingPayment.findUnique({ where: { id: paymentId } }),
    prisma.invoice.findUnique({ where: { id: invoiceId } }),
  ]);

  if (!payment || !invoice) throw new Error("Payment or invoice not found");
  if (payment.clientId !== invoice.clientId) throw new Error("Client mismatch");

  const applyAmount = Math.min(appliedCents, invoice.balanceDueCents, payment.unappliedAmountCents || payment.amountCents);

  await prisma.paymentApplication.upsert({
    where: { paymentId_invoiceId: { paymentId, invoiceId } },
    create: { paymentId, invoiceId, appliedCents: applyAmount },
    update: { appliedCents: { increment: applyAmount } },
  });

  await prisma.billingPayment.update({
    where: { id: paymentId },
    data: {
      unappliedAmountCents: Math.max(0, (payment.unappliedAmountCents ?? 0) - applyAmount),
    },
  });

  await refreshInvoicePaymentState(invoiceId);

  await recordBillingAudit({
    clientId: invoice.clientId,
    invoiceId,
    paymentId,
    action: "payment_succeeded",
    metadata: { appliedCents: applyAmount },
  });
}

export async function recordStripePayment(input: {
  clientId: string;
  invoiceId: string;
  amountCents: number;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  processor?: BillingPaymentProcessor;
}) {
  const existing = await prisma.billingPayment.findUnique({
    where: { stripeSessionId: input.stripeSessionId },
  });
  if (existing) return existing;

  const payment = await prisma.billingPayment.create({
    data: {
      clientId: input.clientId,
      amountCents: input.amountCents,
      paymentDate: new Date(),
      method: "card",
      status: "succeeded",
      processor: input.processor ?? "stripe",
      stripeSessionId: input.stripeSessionId,
      stripePaymentIntentId: input.stripePaymentIntentId,
      unappliedAmountCents: 0,
    },
  });

  await applyPaymentToInvoice(payment.id, input.invoiceId, input.amountCents);

  return payment;
}

export async function listPayments(clientId: string) {
  return prisma.billingPayment.findMany({
    where: { clientId },
    orderBy: { paymentDate: "desc" },
    include: {
      applications: {
        include: { invoice: { select: { id: true, invoiceNumber: true } } },
      },
    },
  });
}
