import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loadProgressReport } from "@/lib/reports/progress";
import { ProgressReportPreview } from "@/components/reports/progress-report-preview";

type PageProps = { params: Promise<{ id: string }> };

export default async function ProgressReportPage({ params }: PageProps) {
  const { id: clientId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  });
  if (!client) notFound();

  const report = await loadProgressReport(clientId);
  if (!report) notFound();

  return (
    <div className="page-shell min-w-0">
      <ProgressReportPreview clientId={clientId} data={report} />
    </div>
  );
}
