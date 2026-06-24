import { NextRequest, NextResponse } from "next/server";
import {
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { archiveRecommendation } from "@/lib/records";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;

  try {
    const recommendation = await archiveRecommendation(id, user.id);
    return NextResponse.json(recommendation);
  } catch {
    return notFound("Recommendation not found");
  }
}
