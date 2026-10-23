import { NextResponse } from "next/server";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { notFound, unauthorized } from "@/lib/api/helpers";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id: clientId } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return denied;
  const detail = await getTechnologyProfileDetail(clientId, user.role);
  if (!detail) return notFound("Client not found");

  return NextResponse.json(detail);
}
