import { NextResponse } from "next/server";
import { badRequest } from "@/lib/api/helpers";
import { continueSnapshotToFullAssessment } from "@/lib/communications/outreach/convert-snapshot-to-assessment";

type RouteContext = { params: Promise<{ leadId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { leadId } = await context.params;

  try {
    const result = await continueSnapshotToFullAssessment(leadId);
    return NextResponse.json(result);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to continue to assessment");
  }
}
