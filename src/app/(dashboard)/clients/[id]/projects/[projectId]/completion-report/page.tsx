import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loadCompletionReport } from "@/lib/reports/completion";
import { CompletionReportPreview } from "@/components/reports/completion-report-preview";

type PageProps = { params: Promise<{ id: string; projectId: string }> };

export default async function CompletionReportPage({ params }: PageProps) {
  const { id: clientId, projectId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  });
  if (!client) notFound();

  const report = await loadCompletionReport(clientId, projectId);
  if (!report) notFound();

  return (
    <div className="page-shell min-w-0">
      <CompletionReportPreview clientId={clientId} data={report} />
    </div>
  );
}
