import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { deleteProjectTask, updateProjectTask } from "@/lib/projects/delivery-service";
import { updateProjectTaskSchema } from "@/lib/projects/task-schemas";

type RouteContext = { params: Promise<{ id: string; taskId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id, taskId } = await context.params;
  const body = await request.json();
  const parsed = updateProjectTaskSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid task update");
  }

  const task = await updateProjectTask(id, taskId, parsed.data, user.id);
  if (!task) return notFound("Task not found");
  return NextResponse.json(task);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id, taskId } = await context.params;
  const ok = await deleteProjectTask(id, taskId);
  if (!ok) return notFound("Task not found");
  return new NextResponse(null, { status: 204 });
}
