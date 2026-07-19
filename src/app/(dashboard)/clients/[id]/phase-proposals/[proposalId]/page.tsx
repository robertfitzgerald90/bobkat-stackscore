import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PhaseProposalReview } from "@/components/phase-proposals/phase-proposal-review";
import { prisma } from "@/lib/db";
import { getPhaseProposalDetail } from "@/lib/phase-proposals";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

type PageProps = { params: Promise<{ id: string; proposalId: string }> };

export default async function PhaseProposalPage({ params }: PageProps) {
  const { id, proposalId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!client) notFound();

  if (isCustomerMode(session.user.role)) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId !== id) notFound();
  }

  const proposal = await getPhaseProposalDetail(id, proposalId, session.user.role);
  if (!proposal) notFound();

  // Mark viewed for clients when opening a sent proposal
  if (
    session.user.role === "client" &&
    (proposal.status === "sent" || proposal.status === "viewed")
  ) {
    const { updatePhaseProposalStatus } = await import("@/lib/phase-proposals");
    await updatePhaseProposalStatus({
      clientId: id,
      proposalId,
      status: "viewed",
      userId: session.user.id,
      role: session.user.role,
    });
    const refreshed = await getPhaseProposalDetail(id, proposalId, session.user.role);
    if (refreshed) {
      return (
        <div className="mx-auto max-w-4xl">
          <PhaseProposalReview clientId={id} initialProposal={refreshed} />
        </div>
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PhaseProposalReview clientId={id} initialProposal={proposal} />
    </div>
  );
}
