import { NextResponse } from "next/server";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { unauthorized } from "@/lib/api/helpers";
import { getTechnologyLifecycleDashboard } from "@/lib/technology-lifecycle";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id: clientId } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return denied;

  const dashboard = await getTechnologyLifecycleDashboard(clientId, user.role);
  if (!dashboard) {
    return NextResponse.json({ error: "Client not found", code: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ dashboard });
}
