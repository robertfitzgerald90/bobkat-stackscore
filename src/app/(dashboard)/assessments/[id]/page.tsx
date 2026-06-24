import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AssessmentWizard } from "@/components/assessments/assessment-wizard";
import { AssessmentAdminActions } from "@/components/admin/assessment-admin-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function AssessmentPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!assessment) notFound();
  if (assessment.status === "archived") notFound();
  if (assessment.status === "completed") {
    redirect(`/assessments/${id}/results`);
  }

  return (
    <div className="space-y-6">
      <AssessmentWizard
        assessmentId={assessment.id}
        assessmentName={assessment.assessmentName}
        clientName={assessment.client.companyName}
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
