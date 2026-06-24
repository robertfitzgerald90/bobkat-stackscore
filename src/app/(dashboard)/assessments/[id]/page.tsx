import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AssessmentWizard } from "@/components/assessments/assessment-wizard";

type PageProps = { params: Promise<{ id: string }> };

export default async function AssessmentPage({ params }: PageProps) {
  const { id } = await params;
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!assessment) notFound();
  if (assessment.status === "completed") {
    redirect(`/assessments/${id}/results`);
  }

  return (
    <AssessmentWizard
      assessmentId={assessment.id}
      assessmentName={assessment.assessmentName}
      clientName={assessment.client.companyName}
    />
  );
}
