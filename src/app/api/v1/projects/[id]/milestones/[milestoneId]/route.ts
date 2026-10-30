import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  deleteProjectMilestone,
  updateProjectMilestone,
} from "@/lib/projects/delivery-service";
import { updateProjectMilestoneSchema } from "@/lib/projects/task-schemas";

type RouteContext = { params: Promise<{ id: string; milestoneId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id, milestoneId } = await context.params;
  const body = await request.json();
  const parsed = updateProjectMilestoneSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid milestone update");
  }

  const milestone = await updateProjectMilestone(id, milestoneId, parsed.data, user.id);
  if (!milestone) return notFound("Milestone not found");
  return NextResponse.json(milestone);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id, milestoneId } = await context.params;
  const ok = await deleteProjectMilestone(id, milestoneId);
  if (!ok) return notFound("Milestone not found");
  return new NextResponse(null, { status: 204 });
}
