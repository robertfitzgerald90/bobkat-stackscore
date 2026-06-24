import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { buildAssessmentResultsSummary } from "@/lib/assessments/results-summary";
import { AssessmentResults } from "@/components/assessments/assessment-results";
import { AssessmentAdminActions } from "@/components/admin/assessment-admin-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function AssessmentResultsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      client: true,
      categoryScores: {
        include: { category: true },
        orderBy: { category: { displayOrder: "asc" } },
      },
      recommendations: {
        orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }],
        include: {
          category: true,
          project: { select: { id: true } },
        },
      },
    },
  });

  if (!assessment || assessment.status !== "completed") notFound();

  const hasImprovementSummary = assessment.sourceAssessmentId !== null;

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
    assessment.recommendations,
  );

  return (
    <div className="space-y-6">
      <AssessmentResults
        assessmentId={assessment.id}
        clientId={assessment.clientId}
        clientName={assessment.client.companyName}
        assessmentName={assessment.assessmentName}
        completedAt={assessment.completedAt?.toISOString() ?? null}
        executiveSummary={assessment.executiveSummary}
        summary={summary}
        hasImprovementSummary={hasImprovementSummary}
      />
      {isAdmin ? (
        <AssessmentAdminActions
          assessmentId={assessment.id}
          assessmentName={assessment.assessmentName}
          status={assessment.status}
          redirectTo={`/clients/${assessment.clientId}`}
        />
      ) : null}
    </div>
  );
}
