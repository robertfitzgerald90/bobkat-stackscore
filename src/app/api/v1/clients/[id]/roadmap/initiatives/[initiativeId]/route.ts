import { NextResponse } from "next/server";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api/helpers";
import {
  isValidRecommendationStatus,
  updateRoadmapInitiativeStatus,
} from "@/lib/client-roadmap";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; initiativeId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id: clientId, initiativeId } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return denied;

  let body: { status?: string };
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body.status || !isValidRecommendationStatus(body.status)) {
    return badRequest("Invalid initiative status");
  }

  try {
    const recommendation = await updateRoadmapInitiativeStatus({
      clientId,
      initiativeId,
      status: body.status,
      role: user.role,
    });

    if (!recommendation) return notFound("Roadmap initiative not found");

    return NextResponse.json({ recommendation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update initiative";
    if (message.toLowerCase().includes("consultant")) {
      return forbidden();
    }
    return badRequest(message);
  }
}
