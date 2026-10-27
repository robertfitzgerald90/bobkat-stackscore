import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildAudienceAssessmentReportData } from "@/lib/assessments/customer-facing-report";
import { getRecommendationsTriggeredByAssessment } from "@/lib/recommendations/queries";
import { isClientFacingRecommendationAudience } from "@/lib/recommendations/visibility";
import { generateAssessmentReportPdf } from "@/lib/pdf/generate";
import { sanitizeFilename } from "@/lib/pdf/types";
import { getSessionUserWithClient, requireAssessmentAccess } from "@/lib/api/access";
import { notFound, unauthorized } from "@/lib/api/helpers";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const access = await requireAssessmentAccess(user, id);
  if ("response" in access) return access.response;

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      client: true,
      categoryScores: {
        include: { category: true },
        orderBy: { category: { displayOrder: "asc" } },
      },
    },
  });

  if (!assessment || assessment.status !== "completed") {
    return notFound("Completed assessment not found");
  }

  if (assessment.overallScore === null) {
    return notFound("Completed assessment is missing a valid overall StackScore");
  }

  const overallScore = Number(assessment.overallScore);

  const rawRecommendations = await getRecommendationsTriggeredByAssessment(id);

  const criticalFindingsCount = await prisma.assessmentResponse.count({
    where: {
      assessmentId: id,
      selectedAnswerOption: { triggersCriticalFlag: true },
    },
  });

  // Clients: filtered recs + regenerated narrative. Staff: full set; stored narrative kept.
  // Never writes Assessment.executiveSummary.
  const reportData = buildAudienceAssessmentReportData({
    role: user.role,
    clientName: assessment.client.companyName,
    assessmentName: assessment.assessmentName,
    assessmentType: assessment.assessmentType,
    assessmentDate: assessment.assessmentDate,
    completedAt: assessment.completedAt?.toISOString() ?? null,
    overallScore,
    hasCriticalExposure: assessment.hasCriticalExposure,
    criticalFindingsCount,
    categoryScores: assessment.categoryScores,
    recommendations: rawRecommendations,
    storedExecutiveSummary: assessment.executiveSummary,
  });

  const buffer = await generateAssessmentReportPdf(reportData);

  const audienceSuffix = isClientFacingRecommendationAudience(user.role)
    ? ""
    : "-internal";
  const filename = `${sanitizeFilename(assessment.client.companyName)}-stackscore-report${audienceSuffix}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
