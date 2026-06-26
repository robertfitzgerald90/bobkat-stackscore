import { NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { getTipPlan, updateTipPlan } from "@/lib/technology-improvement-plan";
import type { TipUpdatePayload } from "@/lib/technology-improvement-plan";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; tipId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId, tipId } = await context.params;
  const plan = await getTipPlan(clientId, tipId, user.role);
  if (!plan) return notFound("Technology Improvement Plan not found");
  return NextResponse.json({ plan });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId, tipId } = await context.params;
  const payload = (await request.json()) as TipUpdatePayload;

  try {
    const plan = await updateTipPlan(clientId, tipId, user.role, payload);
    if (!plan) return notFound("Technology Improvement Plan not found");
    return NextResponse.json({ plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update plan";
    return badRequest(message);
  }
}
