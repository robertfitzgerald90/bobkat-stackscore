import { NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { createTipPlan, listTipPlans } from "@/lib/technology-improvement-plan";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId } = await context.params;
  const plans = await listTipPlans(clientId);
  return NextResponse.json({ plans });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId } = await context.params;
  let assessmentId: string | undefined;
  try {
    const body = (await request.json()) as { assessmentId?: string };
    assessmentId = body.assessmentId;
  } catch {
    assessmentId = undefined;
  }

  try {
    const plan = await createTipPlan(clientId, user.id, user.role, assessmentId);
    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create plan";
    if (message.includes("not found")) return notFound(message);
    return badRequest(message);
  }
}
