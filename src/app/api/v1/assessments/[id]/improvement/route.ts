import { NextResponse } from "next/server";
import { buildImprovementSummary } from "@/lib/assessments/reassessment";
import { getSessionUser, notFound, unauthorized } from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const summary = await buildImprovementSummary(id);

  if (!summary) {
    return notFound("Improvement summary not available for this assessment");
  }

  return NextResponse.json(summary);
}
