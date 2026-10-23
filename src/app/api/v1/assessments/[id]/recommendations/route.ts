import { NextResponse } from "next/server";
import { getRecommendationsTriggeredByAssessment } from "@/lib/recommendations/queries";
import { presentRecommendationsForRole } from "@/lib/recommendations/visibility";
import { getSessionUserWithClient, requireAssessmentAccess } from "@/lib/api/access";
import { unauthorized } from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const access = await requireAssessmentAccess(user, id);
  if ("response" in access) return access.response;

  const recommendations = presentRecommendationsForRole(
    await getRecommendationsTriggeredByAssessment(id),
    user.role,
  );

  return NextResponse.json({ data: recommendations });
}
