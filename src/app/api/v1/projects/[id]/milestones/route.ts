import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  createProjectMilestone,
  listProjectMilestones,
} from "@/lib/projects/delivery-service";
import { createProjectMilestoneSchema } from "@/lib/projects/task-schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const milestones = await listProjectMilestones(id);
  return NextResponse.json({ milestones });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = createProjectMilestoneSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid milestone");
  }

  const milestone = await createProjectMilestone(id, parsed.data, user.id);
  if (!milestone) return notFound("Project not found");
  return NextResponse.json(milestone, { status: 201 });
}
