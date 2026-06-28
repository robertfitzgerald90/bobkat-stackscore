import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildAssessmentResultsSummary } from "@/lib/assessments/results-summary";
import { getRecommendationsTriggeredByAssessment } from "@/lib/recommendations/queries";
import { generateAssessmentReportPdf } from "@/lib/pdf/generate";
import { formatReportDate, sanitizeFilename } from "@/lib/pdf/types";
import { getSessionUser, notFound, unauthorized } from "@/lib/api/helpers";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await context.params;

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

  const recommendations = await getRecommendationsTriggeredByAssessment(id);

  const criticalFindingsCount = await prisma.assessmentResponse.count({
    where: {
      assessmentId: id,
      selectedAnswerOption: { triggersCriticalFlag: true },
    },
  });

  const summary = buildAssessmentResultsSummary(
    Number(assessment.overallScore),
    assessment.hasCriticalExposure,
    criticalFindingsCount,
    assessment.categoryScores,
    recommendations,
  );

  const reportData = {
    clientName: assessment.client.companyName,
    assessmentName: assessment.assessmentName,
    assessmentType: assessment.assessmentType,
    assessmentDate: formatReportDate(assessment.assessmentDate.toISOString()),
    completedAt: assessment.completedAt?.toISOString() ?? null,
    executiveSummary: assessment.executiveSummary,
    summary,
  };

  const buffer = await generateAssessmentReportPdf(reportData);

  const filename = `${sanitizeFilename(assessment.client.companyName)}-stackscore-report.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
