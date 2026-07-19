import { NextResponse } from "next/server";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api/helpers";
import {
  getClientRoadmapPhaseDetail,
  isValidPhaseStatus,
  updateRoadmapPhaseStatus,
} from "@/lib/client-roadmap";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; phaseId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id: clientId, phaseId } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return denied;

  const phase = await getClientRoadmapPhaseDetail(clientId, phaseId, user.role);
  if (!phase) return notFound("Roadmap phase not found");

  return NextResponse.json({ phase });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id: clientId, phaseId } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return denied;

  let body: { status?: string; note?: string };
  try {
    body = (await request.json()) as { status?: string; note?: string };
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body.status || !isValidPhaseStatus(body.status)) {
    return badRequest("Invalid phase status");
  }

  try {
    const updated = await updateRoadmapPhaseStatus({
      clientId,
      phaseId,
      status: body.status,
      userId: user.id,
      role: user.role,
      note: body.note,
    });

    if (!updated) return notFound("Roadmap phase not found");

    const phase = await getClientRoadmapPhaseDetail(clientId, phaseId, user.role);
    return NextResponse.json({ phase });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update phase";
    if (message.toLowerCase().includes("permission")) {
      return forbidden();
    }
    return badRequest(message);
  }
}
