import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { prisma } from "@/lib/db";
import { listQuarterlyBusinessReviews } from "@/lib/qbr";
import { QbrReviewList } from "@/components/qbr/qbr-review-list";

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

  const reviews = await listQuarterlyBusinessReviews(id);

  return (
    <QbrReviewList
      clientId={client.id}
      clientName={client.companyName}
      initialReviews={reviews}
    />
  );
}
