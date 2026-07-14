import { NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  getSnapshotLeadInvitationState,
  getTechnologySnapshotLeadById,
  sendSnapshotLeadAssessmentInvitation,
} from "@/lib/technology-snapshot/service";
import { sendSnapshotLeadInvitationSchema } from "@/lib/technology-snapshot/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await context.params;
  const existing = await getTechnologySnapshotLeadById(id);
  if (!existing) return notFound("Snapshot lead not found");

  const state = await getSnapshotLeadInvitationState(id);
  return NextResponse.json(state);
}

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

  const parsed = sendSnapshotLeadInvitationSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid invitation request");
  }

  const existing = await getTechnologySnapshotLeadById(id);
  if (!existing) return notFound("Snapshot lead not found");

  try {
    const result = await sendSnapshotLeadAssessmentInvitation({
      leadId: id,
      createdByUserId: user.id,
      forceResend: parsed.data.forceResend,
    });
    return NextResponse.json(result);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to send invitation");
  }
}
