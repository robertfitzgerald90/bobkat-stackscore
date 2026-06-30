import { NextResponse } from "next/server";
import { completeAssessment } from "@/lib/assessments";
import { calculateProjectionImpacts } from "@/lib/recommendations";
import { calculateProjectedScore } from "@/lib/scoring";
import {
  conflict,
  getSessionUser,
  notFound,
  unauthorized,
} from "@/lib/api/helpers";

import type { AssessmentRecommendation } from "@/generated/prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;

  try {
    const result = await completeAssessment(id, user.id);
    if (!result) return notFound("Assessment not found");

    const openRecommendations: AssessmentRecommendation[] = result.recommendations ?? [];
    const projectionImpact = calculateProjectionImpacts(
      openRecommendations.map((rec: AssessmentRecommendation) => ({
        templateCode: rec.recommendationTemplateId ?? rec.id,
        consolidationGroupId: rec.consolidationGroupId,
        title: rec.title,
        description: rec.description,
        businessImpact: rec.businessImpact,
        suggestedService: rec.suggestedService ?? "",
        priority: rec.priority,
        estimatedImpactPoints: rec.estimatedImpactPoints,
        categoryName: "",
        isConsolidated: !!rec.consolidationGroupId,
      })),
    );

    const projectedScore = calculateProjectedScore(
      Number(result.overallScore ?? 0),
      [projectionImpact],
    );

    return NextResponse.json({
      id: result.id,
      status: result.status,
      completedAt: result.completedAt,
      overallScore: Number(result.overallScore),
      overallRating: getRatingLabel(Number(result.overallScore)),
      hasCriticalExposure: result.hasCriticalExposure,
      categoryScores: result.categoryScores,
      recommendationCount: openRecommendations.length,
      projectedScore,
      executiveSummary: result.executiveSummary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Completion failed";
    if (message.includes("answered")) {
      return conflict(message);
    }
    return NextResponse.json({ error: message, code: "COMPLETION_FAILED" }, { status: 400 });
  }
}

function getRatingLabel(score: number) {
  if (score >= 90) return "exceptional";
  if (score >= 80) return "strong";
  if (score >= 70) return "stable";
  if (score >= 60) return "at_risk";
  return "critical";
}
