import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  createProjectTask,
  listProjectTasks,
} from "@/lib/projects/delivery-service";
import { createProjectTaskSchema } from "@/lib/projects/task-schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const tasks = await listProjectTasks(id);
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = createProjectTaskSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid task");
  }

  const task = await createProjectTask(id, parsed.data, user.id);
  if (!task) return notFound("Project not found");
  return NextResponse.json(task, { status: 201 });
}
