import { NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  addTechnologySnapshotLeadNote,
  getTechnologySnapshotLeadById,
} from "@/lib/technology-snapshot/service";
import { createSnapshotLeadNoteSchema } from "@/lib/technology-snapshot/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
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

  const parsed = createSnapshotLeadNoteSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid note");
  }

  const existing = await getTechnologySnapshotLeadById(id);
  if (!existing) return notFound("Snapshot lead not found");

  const note = await addTechnologySnapshotLeadNote({
    leadId: id,
    authorUserId: user.id,
    note: parsed.data.note,
  });

  return NextResponse.json(note, { status: 201 });
}
