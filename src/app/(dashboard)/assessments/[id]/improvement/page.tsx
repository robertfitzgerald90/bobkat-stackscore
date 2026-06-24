import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { buildImprovementSummary } from "@/lib/assessments/reassessment";
import { ImprovementSummaryView } from "@/components/assessments/improvement-summary-view";

type PageProps = { params: Promise<{ id: string }> };

export default async function AssessmentImprovementPage({ params }: PageProps) {
  const { id } = await params;

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!assessment || assessment.status !== "completed") notFound();

  const summary = await buildImprovementSummary(id);
  if (!summary) notFound();

  return (
    <ImprovementSummaryView
      clientId={assessment.clientId}
      clientName={assessment.client.companyName}
      summary={summary}
    />
  );
}
