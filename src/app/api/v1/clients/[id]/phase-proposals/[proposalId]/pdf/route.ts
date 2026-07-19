import { NextResponse } from "next/server";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { notFound, unauthorized } from "@/lib/api/helpers";
import { getPhaseProposalDetail } from "@/lib/phase-proposals";
import { generatePhaseProposalPdf } from "@/lib/pdf/generate";
import { sanitizeFilename } from "@/lib/pdf/types";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; proposalId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id: clientId, proposalId } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return denied;

  const proposal = await getPhaseProposalDetail(clientId, proposalId, user.role);
  if (!proposal) return notFound("Proposal not found");

  const buffer = await generatePhaseProposalPdf(proposal);
  const filename = sanitizeFilename(
    `${proposal.proposalNumber}-v${proposal.version}-${proposal.phaseName}`,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
