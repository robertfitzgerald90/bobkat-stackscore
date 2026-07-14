import { NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  convertSnapshotLeadToClient,
  getTechnologySnapshotLeadById,
} from "@/lib/technology-snapshot/service";
import { convertSnapshotLeadSchema } from "@/lib/technology-snapshot/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await context.params;

  let body: unknown = {};
  try {
    if (request.headers.get("content-length") !== "0") {
      body = await request.json();
    }
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = convertSnapshotLeadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid conversion request");
  }

  const existing = await getTechnologySnapshotLeadById(id);
  if (!existing) return notFound("Snapshot lead not found");

  try {
    const result = await convertSnapshotLeadToClient({
      leadId: id,
      createdByUserId: user.id,
      clientId: parsed.data.clientId,
    });
    return NextResponse.json(result);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to convert lead");
  }
}
