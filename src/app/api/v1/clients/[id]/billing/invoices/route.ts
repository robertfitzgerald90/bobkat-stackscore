import { NextResponse } from "next/server";
import { badRequest } from "@/lib/api/helpers";
import { requireBillingClientAccess, requireBillingManagement, isStaff } from "@/lib/billing/api-auth";
import type { InvoiceDocumentType, InvoiceLineCategory } from "@/generated/prisma/client";
import {
  createInvoice,
  createInvoiceFromProject,
  createInvoiceFromTip,
  listInvoices,
} from "@/lib/billing/invoice-service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

type ManualLineItemPayload = {
  itemName?: string;
  description: string;
  clientNote?: string;
  quantity?: number;
  unit?: string;
  unitPriceCents: number;
  sortOrder?: number;
  category?: InvoiceLineCategory;
  catalogSourceType?: string;
  catalogSourceId?: string;
};

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
    documentType?: InvoiceDocumentType;
    title?: string;
    clientDescription?: string;
    tipId?: string;
    projectId?: string;
    lineItems?: ManualLineItemPayload[];
    clientNotes?: string;
    internalNotes?: string;
    dueDate?: string;
    expirationDate?: string;
    discountCents?: number;
    taxCents?: number;
    shippingCents?: number;
    contingencyCents?: number;
    budgetaryOptions?: Record<string, unknown>;
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

    if (!body.title?.trim()) {
      return badRequest("Invoice title is required");
    }

    for (const line of body.lineItems) {
      if (!line.description?.trim()) {
        return badRequest("Each line item requires a description");
      }
      if (line.quantity !== undefined && line.quantity < 0) {
        return badRequest("Line item quantities cannot be negative");
      }
      if (line.unitPriceCents < 0) {
        return badRequest("Line item unit prices cannot be negative");
      }
    }

    const documentType = body.documentType ?? "standard";

    const invoice = await createInvoice({
      clientId,
      createdByUserId: session.user.id,
      documentType,
      title: body.title.trim(),
      clientDescription: body.clientDescription?.trim(),
      clientNotes: body.clientNotes,
      internalNotes: body.internalNotes,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      expirationDate: body.expirationDate ? new Date(body.expirationDate) : undefined,
      discountCents: body.discountCents,
      taxCents: body.taxCents,
      shippingCents: body.shippingCents,
      contingencyCents: body.contingencyCents,
      budgetaryOptions: body.budgetaryOptions,
      lineItems: body.lineItems.map((line, index) => ({
        itemName: line.itemName,
        description: line.description,
        clientNote: line.clientNote,
        quantity: line.quantity ?? 1,
        unit: line.unit,
        unitPriceCents: line.unitPriceCents,
        sortOrder: line.sortOrder ?? index,
        category: line.category,
        catalogSourceType: line.catalogSourceType,
        catalogSourceId: line.catalogSourceId,
      })),
    });
    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to create invoice");
  }
}
