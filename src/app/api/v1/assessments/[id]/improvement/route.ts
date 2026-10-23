import { NextResponse } from "next/server";
import { buildImprovementSummary } from "@/lib/assessments/reassessment";
import { getSessionUserWithClient, requireAssessmentAccess } from "@/lib/api/access";
import { notFound, unauthorized } from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const access = await requireAssessmentAccess(user, id);
  if ("response" in access) return access.response;
  const summary = await buildImprovementSummary(id);

  if (!summary) {
    return notFound("Improvement summary not available for this assessment");
  }

  return NextResponse.json(summary);
}
