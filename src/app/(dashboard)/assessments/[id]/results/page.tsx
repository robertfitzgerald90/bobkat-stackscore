import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { buildAssessmentResultsSummary } from "@/lib/assessments/results-summary";
import { getAssessmentPillarSnapshots } from "@/lib/assessments/pillar-snapshots";
import { getRecommendationsTriggeredByAssessment } from "@/lib/recommendations/queries";
import { AssessmentResults } from "@/components/assessments/assessment-results";
import { AssessmentConsultantReview } from "@/components/assessments/assessment-consultant-review";
import { AssessmentAdminActions } from "@/components/admin/assessment-admin-actions";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { isCustomerMode, isConsultantMode } from "@/lib/navigation/portal-mode";

type PageProps = { params: Promise<{ id: string }> };

export default async function AssessmentResultsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  if (session?.user && isCustomerMode(session.user.role)) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId) {
      redirect(clientTechnologyProfilePath(clientUser.clientId));
    }
    redirect("/dashboard");
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      client: true,
      assessor: { select: { role: true } },
      categoryScores: {
        include: { category: true },
        orderBy: { category: { displayOrder: "asc" } },
      },
    },
  });

  if (!assessment || assessment.status !== "completed") notFound();

  const [recommendations, pillarSnapshots] = await Promise.all([
    getRecommendationsTriggeredByAssessment(id),
    getAssessmentPillarSnapshots(id),
  ]);

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
    recommendations,
  );

  const customerSelfAssessment = assessment.assessor.role === "client";
  const showConsultantReview =
    session?.user?.role && isConsultantMode(session.user.role);

  return (
    <div className="min-w-0 space-y-6">
      {showConsultantReview ? (
        <AssessmentConsultantReview
          assessmentId={assessment.id}
          userRole={session!.user!.role}
          customerSelfAssessment={customerSelfAssessment}
        />
      ) : null}
      <AssessmentResults
        assessmentId={assessment.id}
        clientId={assessment.clientId}
        clientName={assessment.client.companyName}
        assessmentName={assessment.assessmentName}
        completedAt={assessment.completedAt?.toISOString() ?? null}
        executiveSummary={assessment.executiveSummary}
        summary={summary}
        pillarSnapshots={pillarSnapshots}
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
