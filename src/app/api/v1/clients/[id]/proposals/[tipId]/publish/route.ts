import { NextResponse } from "next/server";
import {
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
  badRequest,
} from "@/lib/api/helpers";
import { publishTipProposal } from "@/lib/proposals/service";
import type { RecipientSelection } from "@/lib/communications/recipients/types";

type RouteContext = { params: Promise<{ id: string; tipId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId, tipId } = await context.params;
  const body = (await request.json()) as { recipientSelection?: RecipientSelection };

  try {
    const proposal = await publishTipProposal({
      clientId,
      tipId,
      publishedByUserId: user.id,
      recipientSelection: body.recipientSelection ?? { primaryContact: true, executiveContacts: true },
    });
    return NextResponse.json({ proposal });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to publish proposal");
  }
}
