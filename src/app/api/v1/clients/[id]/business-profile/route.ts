import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  forbidden,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  getBusinessProfile,
  parseBusinessProfileUpdate,
  updateBusinessProfile,
} from "@/lib/business-profile";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const profile = await getBusinessProfile(id, user.role);
  if (!profile) return notFound("Client not found");

  return NextResponse.json(profile);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return badRequest("Invalid request body");
  }

  try {
    const input = parseBusinessProfileUpdate(body as Record<string, unknown>);
    const profile = await updateBusinessProfile(id, user.role, input);
    if (!profile) return notFound("Client not found");
    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return forbidden();
    }
    return badRequest(error instanceof Error ? error.message : "Invalid business profile data");
  }
}
