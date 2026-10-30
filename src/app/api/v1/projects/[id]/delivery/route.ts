import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireConsultantOrAdmin, unauthorized, notFound } from "@/lib/api/helpers";
import { getProjectDeliveryBundle } from "@/lib/projects/delivery-service";

type RouteContext = { params: Promise<{ id: string }> };

/** Staff delivery bundle: tasks, milestones, linked recommendations, progress. */
export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const bundle = await getProjectDeliveryBundle(id);
  if (!bundle) return notFound("Project not found");

  return NextResponse.json(bundle);
}
