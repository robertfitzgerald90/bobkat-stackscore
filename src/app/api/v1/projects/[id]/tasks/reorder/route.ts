import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { reorderProjectTasks } from "@/lib/projects/delivery-service";
import { reorderProjectItemsSchema } from "@/lib/projects/task-schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = reorderProjectItemsSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid reorder payload");
  }

  try {
    const tasks = await reorderProjectTasks(id, parsed.data.orderedIds);
    return NextResponse.json({ tasks });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to reorder tasks");
  }
}
