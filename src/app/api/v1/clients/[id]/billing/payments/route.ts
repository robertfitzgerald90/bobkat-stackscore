import { NextResponse } from "next/server";
import { badRequest } from "@/lib/api/helpers";
import { requireBillingClientAccess, requireBillingManagement, isStaff } from "@/lib/billing/api-auth";
import { recordManualPayment, listPayments } from "@/lib/billing/payment-service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id: clientId } = await context.params;
  const session = await requireBillingClientAccess(clientId);
  if ("error" in session) return session.error;

  const payments = await listPayments(clientId);
  return NextResponse.json({ payments });
}

export async function POST(request: Request, context: RouteContext) {
  const { id: clientId } = await context.params;
  const session = await requireBillingManagement(clientId);
  if ("error" in session) return session.error;

  const body = (await request.json()) as {
    amountCents: number;
    method: import("@/generated/prisma/client").BillingPaymentMethod;
    invoiceId?: string;
    transactionReference?: string;
    notes?: string;
  };

  try {
    const payment = await recordManualPayment({
      clientId,
      invoiceId: body.invoiceId,
      amountCents: body.amountCents,
      paymentDate: new Date(),
      method: body.method,
      transactionReference: body.transactionReference,
      notes: body.notes,
      recordedByUserId: session.user.id,
    });
    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to record payment");
  }
}
