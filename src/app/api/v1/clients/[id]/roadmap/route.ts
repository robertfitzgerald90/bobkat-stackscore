import { NextResponse } from "next/server";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { unauthorized } from "@/lib/api/helpers";
import { getClientRoadmapDashboard } from "@/lib/client-roadmap";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id: clientId } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return denied;

  const roadmap = await getClientRoadmapDashboard(clientId, user.role);
  return NextResponse.json({ roadmap });
}
