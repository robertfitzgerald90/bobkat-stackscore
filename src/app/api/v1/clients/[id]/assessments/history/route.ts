import { NextResponse } from "next/server";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { unauthorized } from "@/lib/api/helpers";
import { getClientAssessmentHistory } from "@/lib/assessments/reassessment";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id: clientId } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return denied;

  const history = await getClientAssessmentHistory(clientId);

  return NextResponse.json({ history });
}
