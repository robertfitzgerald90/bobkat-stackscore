import { NextRequest, NextResponse } from "next/server";
import { buildAssessmentComparison } from "@/lib/assessments/comparison-build";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const roleCheck = requireConsultantOrAdmin(user);
  if (roleCheck) return roleCheck;

  const { id: clientId } = await context.params;
  const baselineId = request.nextUrl.searchParams.get("baselineId");
  const comparisonId = request.nextUrl.searchParams.get("comparisonId");

  if (!baselineId || !comparisonId) {
    return badRequest("baselineId and comparisonId query parameters are required");
  }

  const comparison = await buildAssessmentComparison(clientId, baselineId, comparisonId);
  if (!comparison) {
    return notFound(
      "Comparison not found. Both assessments must be completed and belong to this client.",
    );
  }

  return NextResponse.json({ data: comparison });
}
