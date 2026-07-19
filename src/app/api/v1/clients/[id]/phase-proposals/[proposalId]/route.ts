import { NextResponse } from "next/server";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api/helpers";
import {
  getPhaseProposalDetail,
  isValidPhaseProposalStatus,
  updatePhaseProposalStatus,
} from "@/lib/phase-proposals";

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

  // Mark viewed when a client opens a sent proposal
  if (
    user.role === "client" &&
    (proposal.status === "sent" || proposal.status === "viewed")
  ) {
    await updatePhaseProposalStatus({
      clientId,
      proposalId,
      status: "viewed",
      userId: user.id,
      role: user.role,
    });
    const refreshed = await getPhaseProposalDetail(clientId, proposalId, user.role);
    return NextResponse.json({ proposal: refreshed });
  }

  return NextResponse.json({ proposal });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id: clientId, proposalId } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return denied;

  let body: { status?: string; clientComments?: string };
  try {
    body = (await request.json()) as { status?: string; clientComments?: string };
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body.status || !isValidPhaseProposalStatus(body.status)) {
    return badRequest("Invalid proposal status");
  }

  try {
    const updated = await updatePhaseProposalStatus({
      clientId,
      proposalId,
      status: body.status,
      userId: user.id,
      role: user.role,
      clientComments: body.clientComments,
    });
    if (!updated) return notFound("Proposal not found");

    const proposal = await getPhaseProposalDetail(clientId, proposalId, user.role);
    return NextResponse.json({ proposal });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update proposal";
    if (message.toLowerCase().includes("permission")) return forbidden();
    return badRequest(message);
  }
}
