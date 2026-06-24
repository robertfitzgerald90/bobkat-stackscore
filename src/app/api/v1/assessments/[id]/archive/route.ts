import { NextRequest, NextResponse } from "next/server";
import {
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { archiveAssessment } from "@/lib/records";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;

  try {
    const assessment = await archiveAssessment(id, user.id);
    return NextResponse.json(assessment);
  } catch {
    return notFound("Assessment not found");
  }
}
