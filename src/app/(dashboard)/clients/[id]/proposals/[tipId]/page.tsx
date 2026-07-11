import { redirect } from "next/navigation";
import { ProposalReviewView } from "@/components/proposals/proposal-review-view";
import { auth } from "@/lib/auth";
import { getPublishedProposalDetail } from "@/lib/proposals/service";

type PageProps = {
  params: Promise<{ id: string; tipId: string }>;
  searchParams: Promise<{ action?: string }>;
};

export default async function ProposalReviewPage({ params, searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    const resolved = await params;
    redirect(`/login?callbackUrl=${encodeURIComponent(`/clients/${resolved.id}/proposals/${resolved.tipId}`)}`);
  }

  const { id, tipId } = await params;
  const query = await searchParams;
  const proposal = await getPublishedProposalDetail(id, tipId, session.user.role);
  if (!proposal) redirect(`/clients/${id}/roadmap`);

  return (
    <ProposalReviewView
      clientId={id}
      tipId={tipId}
      proposal={proposal}
      initialAction={query.action === "approve" ? "approve" : "review"}
    />
  );
}
