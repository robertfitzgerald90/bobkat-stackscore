import { NextResponse } from "next/server";
import {
  getSessionUserWithClient,
  requireClientWorkspaceAccess,
} from "@/lib/api/access";
import { badRequest, notFound, unauthorized } from "@/lib/api/helpers";
import { prisma } from "@/lib/db";
import { plannerTaskPatchSchema } from "@/lib/planner/model";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string; taskId: string }> };
async function access(context: Context) {
  const user = await getSessionUserWithClient();
  if (!user) return { response: unauthorized() };
  const { id, taskId } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, id);
  if (denied) return { response: denied };
  return { id, taskId };
}
export async function PATCH(request: Request, context: Context) {
  const result = await access(context);
  if (result.response) return result.response;
  const parsed = plannerTaskPatchSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid task");
  const updated = await prisma.plannerTask.updateMany({
    where: { id: result.taskId!, clientId: result.id! },
    data: parsed.data,
  });
  if (!updated.count) return notFound("Task not found");
  return NextResponse.json({ saved: true });
}
export async function DELETE(_request: Request, context: Context) {
  const result = await access(context);
  if (result.response) return result.response;
  const deleted = await prisma.plannerTask.deleteMany({
    where: { id: result.taskId!, clientId: result.id! },
  });
  if (!deleted.count) return notFound("Task not found");
  return new NextResponse(null, { status: 204 });
}
