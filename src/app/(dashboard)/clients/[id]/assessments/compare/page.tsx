import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildAssessmentComparison } from "@/lib/assessments/comparison-build";
import { sortCompletedAssessmentsNewestFirst } from "@/lib/assessments/display";
import { BACK_TO_TECHNOLOGY_MATURITY_PROFILE } from "@/lib/technology-maturity/labels";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { AssessmentComparisonForm } from "@/components/assessments/assessment-comparison-form";
import { AssessmentComparisonView } from "@/components/assessments/assessment-comparison-view";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { buttonClassName } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ baselineId?: string; comparisonId?: string }>;
};

export default async function AssessmentComparisonPage({ params, searchParams }: PageProps) {
  const { id: clientId } = await params;
  const { baselineId, comparisonId } = await searchParams;

  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "client") {
    redirect(clientTechnologyProfilePath(clientId));
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      companyName: true,
      assessments: {
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        select: {
          id: true,
          assessmentName: true,
          assessmentType: true,
          completedAt: true,
          overallScore: true,
        },
      },
    },
  });

  if (!client) notFound();

  const completedAssessments = sortCompletedAssessmentsNewestFirst(
    client.assessments.map((assessment) => ({
      id: assessment.id,
      assessmentName: assessment.assessmentName,
      assessmentType: assessment.assessmentType,
      completedAt: assessment.completedAt?.toISOString() ?? null,
      overallScore:
        assessment.overallScore !== null ? Math.round(Number(assessment.overallScore)) : null,
    })),
  );

  if (completedAssessments.length < 2) {
    return (
      <div className="page-shell space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={clientTechnologyProfilePath(clientId)}
            className={buttonClassName({ variant: "ghost", size: "sm", className: "-ml-2" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Technology Maturity Profile
          </Link>
        </div>
        <div className="page-header">
          <p className="text-sm text-muted-foreground">{client.companyName}</p>
          <h2 className="page-title">Compare Assessments</h2>
        </div>
        <TpEmptyState
          title="Need at least two completed assessments"
          message="Complete a second assessment for this client to compare progress over time."
          actionLabel="Back to Technology Maturity Profile"
          actionHref={clientTechnologyProfilePath(clientId)}
        />
      </div>
    );
  }

  if (baselineId && comparisonId) {
    const comparison = await buildAssessmentComparison(clientId, baselineId, comparisonId);
    if (!comparison) notFound();

    return (
      <div className="page-shell">
        <AssessmentComparisonView clientId={clientId} comparison={comparison} />
      </div>
    );
  }

  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={clientTechnologyProfilePath(clientId)}
          className={buttonClassName({ variant: "ghost", size: "sm", className: "-ml-2" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {BACK_TO_TECHNOLOGY_MATURITY_PROFILE}
        </Link>
      </div>
      <div className="page-header">
        <p className="text-sm text-muted-foreground">{client.companyName}</p>
        <h2 className="page-title">Compare Assessments</h2>
        <p className="page-description">
          Analyze score movement, recommendation changes, and answer-level progress between two
          completed assessments.
        </p>
      </div>
      <AssessmentComparisonForm
        clientId={clientId}
        completedAssessments={completedAssessments}
      />
    </div>
  );
}
