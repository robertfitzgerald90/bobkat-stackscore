import { NextResponse } from "next/server";
import { getSessionUser, requireConsultantOrAdmin, unauthorized } from "@/lib/api/helpers";
import { getCustomer360Dashboard } from "@/lib/commercial-intelligence";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId } = await context.params;

  const dashboard = await getCustomer360Dashboard(clientId);
  if (!dashboard) {
    return NextResponse.json({ error: "Client not found", code: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ dashboard });
}
