import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  conflict,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  linkProjectRecommendation,
  listProjectRecommendationLinks,
  unlinkProjectRecommendation,
} from "@/lib/projects/delivery-service";
import { linkProjectRecommendationSchema } from "@/lib/projects/task-schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const recommendations = await listProjectRecommendationLinks(id);
  return NextResponse.json({ recommendations });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = linkProjectRecommendationSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid recommendation link");
  }

  const result = await linkProjectRecommendation(id, parsed.data.recommendationId);
  if (!result.ok) {
    if (result.error === "Project not found" || result.error === "Recommendation not found") {
      return notFound(result.error);
    }
    return conflict(result.error);
  }

  return NextResponse.json(result.link, { status: 201 });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const recommendationId = searchParams.get("recommendationId");
  if (!recommendationId) {
    return badRequest("recommendationId query parameter is required");
  }

  const result = await unlinkProjectRecommendation(id, recommendationId);
  if (!result.ok) {
    if (result.error === "Link not found") return notFound(result.error);
    return conflict(result.error);
  }

  return new NextResponse(null, { status: 204 });
}
