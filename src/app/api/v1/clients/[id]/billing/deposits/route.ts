import { NextResponse } from "next/server";
import { badRequest } from "@/lib/api/helpers";
import { requireBillingClientAccess, requireBillingManagement } from "@/lib/billing/api-auth";
import { createDeposit, createDepositInvoice, listDeposits } from "@/lib/billing/deposit-service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id: clientId } = await context.params;
  const session = await requireBillingClientAccess(clientId);
  if ("error" in session) return session.error;

  const deposits = await listDeposits(clientId);
  return NextResponse.json({ deposits });
}

export async function POST(request: Request, context: RouteContext) {
  const { id: clientId } = await context.params;
  const session = await requireBillingManagement(clientId);
  if ("error" in session) return session.error;

  const body = (await request.json()) as {
    action?: "create" | "invoice";
    depositId?: string;
    depositType?: import("@/generated/prisma/client").BillingDepositType;
    label?: string;
    amountCents?: number;
    percentage?: number;
    tipId?: string;
    projectId?: string;
  };

  try {
    if (body.action === "invoice" && body.depositId) {
      const invoice = await createDepositInvoice(body.depositId, clientId, session.user.id);
      return NextResponse.json({ invoice }, { status: 201 });
    }

    if (!body.label || !body.depositType) {
      return badRequest("label and depositType are required");
    }

    const deposit = await createDeposit({
      clientId,
      depositType: body.depositType,
      label: body.label,
      amountCents: body.amountCents,
      percentage: body.percentage,
      tipId: body.tipId,
      projectId: body.projectId,
      userId: session.user.id,
    });
    return NextResponse.json({ deposit }, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Deposit action failed");
  }
}
