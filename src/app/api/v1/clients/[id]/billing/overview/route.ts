import { NextResponse } from "next/server";
import { requireBillingClientAccess, requireBillingManagement } from "@/lib/billing/api-auth";
import { getBillingOverview } from "@/lib/billing/overview-service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id: clientId } = await context.params;
  const session = await requireBillingClientAccess(clientId);
  if ("error" in session) return session.error;

  const overview = await getBillingOverview(clientId);
  return NextResponse.json({ overview });
}
