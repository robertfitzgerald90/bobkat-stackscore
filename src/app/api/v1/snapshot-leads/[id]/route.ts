import { NextResponse } from "next/server";
import {
  badRequest,
  conflict,
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  buildSnapshotLeadDetailPayload,
  deleteTechnologySnapshotLeadPermanently,
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

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await context.params;
  if (!id?.trim()) {
    return badRequest("Lead ID is required");
  }

  const sourceHeader = request.headers.get("x-stackscore-admin-source");
  const source =
    sourceHeader?.trim() ||
    new URL(request.url).searchParams.get("source") ||
    "admin.snapshot-leads";

  const result = await deleteTechnologySnapshotLeadPermanently({
    leadId: id,
    actor: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    source,
  });

  if (!result.ok) {
    if (result.code === "NOT_FOUND") {
      return notFound(result.message);
    }
    if (result.code === "CONVERTED") {
      return conflict(result.message);
    }
    return conflict(result.message);
  }

  return NextResponse.json({
    success: true,
    deletedLeadId: result.deletedLeadId,
    message: "Snapshot Lead deleted.",
  });
}
