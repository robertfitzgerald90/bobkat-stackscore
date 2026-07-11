import { NextResponse } from "next/server";
import {
  getSessionUserWithClient,
  requireClientWorkspaceAccess,
} from "@/lib/api/access";
import { unauthorized, badRequest, notFound } from "@/lib/api/helpers";
import { approveTipProposal, requestTipProposalChanges } from "@/lib/proposals/service";

type RouteContext = { params: Promise<{ id: string; tipId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id: clientId, tipId } = await context.params;
  const accessDenied = await requireClientWorkspaceAccess(user, clientId);
  if (accessDenied) return accessDenied;

  const body = (await request.json()) as {
    action?: "approve" | "request_changes";
    signerName?: string;
    signerTitle?: string;
    consentText?: string;
    comments?: string;
  };

  try {
    if (body.action === "approve") {
      if (!body.signerName?.trim() || !body.consentText?.trim()) {
        return badRequest("Signature name and consent are required");
      }
      const proposal = await approveTipProposal({
        clientId,
        tipId,
        approvedByUserId: user.id,
        signature: {
          signerName: body.signerName.trim(),
          signerTitle: body.signerTitle?.trim(),
          signedAt: new Date().toISOString(),
          consentText: body.consentText.trim(),
        },
      });
      return NextResponse.json({ proposal });
    }

    if (body.action === "request_changes") {
      if (!body.comments?.trim()) return badRequest("Comments are required");
      const proposal = await requestTipProposalChanges({
        clientId,
        tipId,
        requestedByUserId: user.id,
        comments: body.comments,
      });
      return NextResponse.json({ proposal });
    }

    return badRequest("Unsupported action");
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to update proposal");
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id: clientId, tipId } = await context.params;
  const accessDenied = await requireClientWorkspaceAccess(user, clientId);
  if (accessDenied) return accessDenied;

  const { getPublishedProposalDetail } = await import("@/lib/proposals/service");
  const proposal = await getPublishedProposalDetail(clientId, tipId, user.role);
  if (!proposal) return notFound("Proposal not found");
  return NextResponse.json({ proposal });
}
