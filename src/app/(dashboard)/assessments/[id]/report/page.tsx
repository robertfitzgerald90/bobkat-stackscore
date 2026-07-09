import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildAssessmentReportData } from "@/lib/assessments/report-data";
import { buildAssessmentResultsSummary } from "@/lib/assessments/results-summary";
import { prisma } from "@/lib/db";
import { getRecommendationsTriggeredByAssessment } from "@/lib/recommendations/queries";
import { AssessmentReportPreview } from "@/components/assessments/assessment-report-preview";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

type PageProps = { params: Promise<{ id: string }> };

export default async function AssessmentReportPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

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

  if (!assessment || assessment.status !== "completed") notFound();

  if (isCustomerMode(session.user.role)) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId !== assessment.clientId) notFound();
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

  const reportData = buildAssessmentReportData({
    clientName: assessment.client.companyName,
    assessmentName: assessment.assessmentName,
    assessmentType: assessment.assessmentType,
    assessmentDate: assessment.assessmentDate,
    completedAt: assessment.completedAt?.toISOString() ?? null,
    executiveSummary: assessment.executiveSummary,
    summary,
  });

  return (
    <div className="page-shell min-w-0">
      <AssessmentReportPreview
        assessmentId={assessment.id}
        clientId={assessment.clientId}
        data={reportData}
        isCustomerView={isCustomerMode(session.user.role)}
      />
    </div>
  );
}
