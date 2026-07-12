import { NextResponse } from "next/server";
import { badRequest } from "@/lib/api/helpers";
import { requireBillingClientAccess, requireBillingManagement, isStaff } from "@/lib/billing/api-auth";
import {
  createInvoice,
  createInvoiceFromProject,
  createInvoiceFromTip,
  listInvoices,
} from "@/lib/billing/invoice-service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id: clientId } = await context.params;
  const session = await requireBillingClientAccess(clientId);
  if ("error" in session) return session.error;

  const invoices = await listInvoices(clientId, { staffView: isStaff(session.user) });
  return NextResponse.json({ invoices });
}

export async function POST(request: Request, context: RouteContext) {
  const { id: clientId } = await context.params;
  const session = await requireBillingManagement(clientId);
  if ("error" in session) return session.error;

  const body = (await request.json()) as {
    source?: "manual" | "tip" | "project";
    tipId?: string;
    projectId?: string;
    lineItems?: Array<{ description: string; unitPriceCents: number; quantity?: number }>;
    clientNotes?: string;
    internalNotes?: string;
  };

  try {
    if (body.source === "tip" && body.tipId) {
      const invoice = await createInvoiceFromTip(
        clientId,
        body.tipId,
        session.user.id,
        session.user.role,
      );
      return NextResponse.json({ invoice }, { status: 201 });
    }

    if (body.source === "project" && body.projectId) {
      const invoice = await createInvoiceFromProject(clientId, body.projectId, session.user.id);
      return NextResponse.json({ invoice }, { status: 201 });
    }

    if (!body.lineItems?.length) {
      return badRequest("lineItems are required for manual invoices");
    }

    const invoice = await createInvoice({
      clientId,
      createdByUserId: session.user.id,
      clientNotes: body.clientNotes,
      internalNotes: body.internalNotes,
      lineItems: body.lineItems,
    });
    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to create invoice");
  }
}
