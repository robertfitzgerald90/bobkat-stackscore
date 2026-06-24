import { NextRequest, NextResponse } from "next/server";
import {
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { getRecommendationDeletionPreview } from "@/lib/records";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const preview = await getRecommendationDeletionPreview(id);
  if (!preview) return notFound("Recommendation not found");

  return NextResponse.json(preview);
}
