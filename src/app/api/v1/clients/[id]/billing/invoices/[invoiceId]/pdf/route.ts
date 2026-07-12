import { NextResponse } from "next/server";
import { notFound } from "@/lib/api/helpers";
import { requireBillingClientAccess } from "@/lib/billing/api-auth";
import { canClientViewInvoice } from "@/lib/billing/access";
import { getInvoice } from "@/lib/billing/invoice-service";
import { renderInvoicePdf } from "@/lib/pdf/invoice-document";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; invoiceId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id: clientId, invoiceId } = await context.params;
  const session = await requireBillingClientAccess(clientId);
  if ("error" in session) return session.error;

  const invoice = await getInvoice(invoiceId, clientId);
  if (!invoice) return notFound("Invoice not found");
  if (!canClientViewInvoice(session.user.role, invoice)) return notFound("Invoice not found");

  const pdf = await renderInvoicePdf(invoice);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
