import { NextResponse } from "next/server";
import { badRequest } from "@/lib/api/helpers";
import {
  enforceSnapshotContinueLimits,
  temporarilyUnavailableResponse,
  tooManyRequestsResponse,
} from "@/lib/auth/rate-limit";
import { continueSnapshotToFullAssessment } from "@/lib/communications/outreach/convert-snapshot-to-assessment";

type RouteContext = { params: Promise<{ leadId: string }> };

/**
 * Public continuation endpoint.
 * Always returns a generic success message — never activation tokens or resource IDs (SEC-001-C01 / M08).
 */
export async function POST(request: Request, context: RouteContext) {
  const { leadId } = await context.params;

  const rate = await enforceSnapshotContinueLimits({ request, leadId });
  if (!rate.allowed) {
    if (rate.backendError) {
      return temporarilyUnavailableResponse(rate.retryAfterSeconds);
    }
    return tooManyRequestsResponse(rate.retryAfterSeconds);
  }

  try {
    const result = await continueSnapshotToFullAssessment(leadId);
    return NextResponse.json({
      ok: result.ok,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Technology Snapshot not found") {
      return badRequest("Technology Snapshot not found");
    }
    if (
      error instanceof Error &&
      error.message.startsWith("Unable to send continuation email")
    ) {
      return badRequest(error.message);
    }
    return badRequest("Unable to continue to assessment. Please try again shortly.");
  }
}
