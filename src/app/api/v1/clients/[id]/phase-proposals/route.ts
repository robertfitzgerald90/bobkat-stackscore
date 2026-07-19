import { NextResponse } from "next/server";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { badRequest, unauthorized } from "@/lib/api/helpers";
import { isConsultantRole } from "@/lib/client-roadmap/permissions";
import {
  generatePhaseProposal,
  getPhaseProposalDetail,
  listPhaseProposals,
} from "@/lib/phase-proposals";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id: clientId } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return denied;

  const phaseId = new URL(request.url).searchParams.get("phaseId") ?? undefined;
  const proposals = await listPhaseProposals(clientId, phaseId);
  return NextResponse.json({ proposals });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();
  if (!isConsultantRole(user.role)) {
    return NextResponse.json({ error: "Insufficient permissions", code: "FORBIDDEN" }, { status: 403 });
  }

  const { id: clientId } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return denied;

  let body: { phaseId?: string };
  try {
    body = (await request.json()) as { phaseId?: string };
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body.phaseId) return badRequest("phaseId is required");

  try {
    const created = await generatePhaseProposal({
      clientId,
      phaseId: body.phaseId,
      userId: user.id,
      preparedByName: user.name,
    });
    const proposal = await getPhaseProposalDetail(clientId, created.id, user.role);
    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate proposal";
    return badRequest(message);
  }
}
