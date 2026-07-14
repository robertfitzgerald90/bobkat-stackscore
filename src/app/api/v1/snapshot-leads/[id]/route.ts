import { NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  buildSnapshotLeadDetailPayload,
  getTechnologySnapshotLeadById,
  updateTechnologySnapshotLeadStatus,
} from "@/lib/technology-snapshot/service";
import { updateSnapshotLeadStatusSchema } from "@/lib/technology-snapshot/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await context.params;
  const lead = await getTechnologySnapshotLeadById(id);
  if (!lead) return notFound("Snapshot lead not found");

  return NextResponse.json(buildSnapshotLeadDetailPayload(lead));
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = updateSnapshotLeadStatusSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid status update");
  }

  const existing = await getTechnologySnapshotLeadById(id);
  if (!existing) return notFound("Snapshot lead not found");

  const updated = await updateTechnologySnapshotLeadStatus(id, parsed.data.status);

  return NextResponse.json(updated);
}
