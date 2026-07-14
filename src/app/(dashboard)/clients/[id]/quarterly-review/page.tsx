import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { prisma } from "@/lib/db";
import { listQuarterlyBusinessReviews } from "@/lib/qbr";
import { QbrReviewList } from "@/components/qbr/qbr-review-list";
import { getVcioFeatureAccess } from "@/lib/vcio/feature-unlocks";

type PageProps = { params: Promise<{ id: string }> };

export default async function QuarterlyReviewListPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "client") redirect(clientTechnologyProfilePath(id));

  const client = await prisma.client.findUnique({
    where: { id },
    select: { id: true, companyName: true },
  });
  if (!client) notFound();

  const [reviews, qbrAccess] = await Promise.all([
    listQuarterlyBusinessReviews(id),
    getVcioFeatureAccess(id, "quarterly_business_reviews"),
  ]);

  return (
    <QbrReviewList
      clientId={client.id}
      clientName={client.companyName}
      initialReviews={reviews}
      canCreate={qbrAccess.canEdit}
      readOnlyReason={qbrAccess.reason}
    />
  );
}
