import { NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { generateTipPlan } from "@/lib/technology-improvement-plan";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; tipId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId, tipId } = await context.params;

  try {
    const plan = await generateTipPlan(clientId, tipId, user.id, user.role);
    if (!plan) return notFound("Technology Improvement Plan not found");

    const { triggerRoadmapPublishedWorkflow } = await import(
      "@/lib/communications/workflows/triggers"
    );
    await triggerRoadmapPublishedWorkflow({
      clientId,
      tipId,
      createdByUserId: user.id,
    });

    return NextResponse.json({ plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate plan";
    return badRequest(message);
  }
}
