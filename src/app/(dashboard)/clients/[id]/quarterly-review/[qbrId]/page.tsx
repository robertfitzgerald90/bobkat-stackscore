import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { prisma } from "@/lib/db";
import { getQuarterlyBusinessReview } from "@/lib/qbr";
import { QbrReviewWorkflow } from "@/components/qbr/qbr-review-workflow";
import { QbrReportView } from "@/components/qbr/qbr-report-view";

type PageProps = { params: Promise<{ id: string; qbrId: string }> };

export default async function QuarterlyReviewDetailPage({ params }: PageProps) {
  const { id: clientId, qbrId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  });
  if (!client) notFound();

  const review = await getQuarterlyBusinessReview(clientId, qbrId, session.user.role);
  if (!review) notFound();

  if (session.user.role === "client") {
    return (
      <div className="page-shell">
        <QbrReportView clientId={clientId} data={review.report} showActions />
      </div>
    );
  }

  return <QbrReviewWorkflow clientId={clientId} initialReview={review} />;
}
