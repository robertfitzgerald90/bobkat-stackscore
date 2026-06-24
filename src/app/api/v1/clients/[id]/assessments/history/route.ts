import { NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/api/helpers";
import { getClientAssessmentHistory } from "@/lib/assessments/reassessment";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: clientId } = await context.params;
  const history = await getClientAssessmentHistory(clientId);

  return NextResponse.json({ history });
}
