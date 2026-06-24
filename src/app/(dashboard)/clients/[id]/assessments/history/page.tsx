import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getClientAssessmentHistory } from "@/lib/assessments/reassessment";
import { AssessmentHistoryView } from "@/components/assessments/assessment-history-view";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientAssessmentHistoryPage({ params }: PageProps) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    select: { id: true, companyName: true },
  });

  if (!client) notFound();

  const history = await getClientAssessmentHistory(client.id);

  return (
    <AssessmentHistoryView
      clientId={client.id}
      clientName={client.companyName}
      history={history}
    />
  );
}
