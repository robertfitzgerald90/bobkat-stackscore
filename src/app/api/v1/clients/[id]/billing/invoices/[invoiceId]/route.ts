import { NextResponse } from "next/server";
import { badRequest, notFound } from "@/lib/api/helpers";
import { prisma } from "@/lib/db";
import { requireBillingClientAccess, requireBillingManagement, isStaff } from "@/lib/billing/api-auth";
import { canClientViewInvoice } from "@/lib/billing/access";
import { stripInternalLineItems } from "@/lib/billing/access";
import { recordBillingAudit } from "@/lib/billing/audit";
import {
  duplicateInvoice,
  getInvoice,
  updateDraftInvoice,
  voidInvoice,
} from "@/lib/billing/invoice-service";
import { sendInvoiceEmail } from "@/lib/billing/send-invoice-email";
import { recordManualPayment } from "@/lib/billing/payment-service";
import { createInvoiceCheckoutSession } from "@/lib/billing/stripe-checkout";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; invoiceId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id: clientId, invoiceId } = await context.params;
  const session = await requireBillingClientAccess(clientId);
  if ("error" in session) return session.error;

  const invoice = await getInvoice(invoiceId, clientId);
  if (!invoice) return notFound("Invoice not found");
  if (!canClientViewInvoice(session.user.role, invoice)) return notFound("Invoice not found");

  const staff = isStaff(session.user);
  if (!staff && invoice.status === "sent") {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "viewed" },
    });
    await recordBillingAudit({
      clientId,
      invoiceId,
      action: "invoice_viewed",
      actorUserId: session.user.id,
    });
    invoice.status = "viewed";
  }

  return NextResponse.json({
    invoice: {
      ...invoice,
      internalNotes: staff ? invoice.internalNotes : null,
      lineItems: stripInternalLineItems(invoice.lineItems, staff),
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id: clientId, invoiceId } = await context.params;
  const session = await requireBillingManagement(clientId);
  if ("error" in session) return session.error;

  const body = (await request.json()) as {
    action?: "void" | "duplicate" | "send" | "ready" | "record_payment" | "checkout";
    voidReason?: string;
    ccEmails?: string[];
    isReminder?: boolean;
    payment?: { amountCents: number; method: string; transactionReference?: string; notes?: string };
    patch?: Record<string, unknown>;
  };

  try {
    if (body.action === "void") {
      const invoice = await voidInvoice(invoiceId, clientId, session.user.id, body.voidReason);
      return NextResponse.json({ invoice });
    }
    if (body.action === "duplicate") {
      const invoice = await duplicateInvoice(invoiceId, clientId, session.user.id);
      return NextResponse.json({ invoice }, { status: 201 });
    }
    if (body.action === "send") {
      const result = await sendInvoiceEmail({
        invoiceId,
        clientId,
        actorUserId: session.user.id,
        ccEmails: body.ccEmails,
        isReminder: body.isReminder,
      });
      return NextResponse.json(result);
    }
    if (body.action === "ready") {
      const invoice = await updateDraftInvoice(invoiceId, clientId, session.user.id, {
        status: "ready_to_send",
      });
      return NextResponse.json({ invoice });
    }
    if (body.action === "checkout") {
      const sessionResult = await createInvoiceCheckoutSession(invoiceId);
      return NextResponse.json({ url: sessionResult.url, sessionId: sessionResult.id });
    }
    if (body.action === "record_payment" && body.payment) {
      const payment = await recordManualPayment({
        clientId,
        invoiceId,
        amountCents: body.payment.amountCents,
        paymentDate: new Date(),
        method: body.payment.method as import("@/generated/prisma/client").BillingPaymentMethod,
        transactionReference: body.payment.transactionReference,
        notes: body.payment.notes,
        recordedByUserId: session.user.id,
      });
      return NextResponse.json({ payment });
    }

    const invoice = await updateDraftInvoice(
      invoiceId,
      clientId,
      session.user.id,
      (body.patch ?? {}) as Parameters<typeof updateDraftInvoice>[3],
    );
    return NextResponse.json({ invoice });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Invoice action failed");
  }
}
