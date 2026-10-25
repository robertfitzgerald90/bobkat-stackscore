import { NextResponse } from "next/server";
import { badRequest } from "@/lib/api/helpers";
import {
  enforceSnapshotCreateLimits,
  temporarilyUnavailableResponse,
  tooManyRequestsResponse,
} from "@/lib/auth/rate-limit";
import { createTechnologySnapshotLead } from "@/lib/technology-snapshot/service";
import { createSnapshotLeadSchema } from "@/lib/technology-snapshot/schemas";
import {
  getClassificationLabel,
  getClassificationSummary,
} from "@/lib/technology-snapshot/scoring";

export async function POST(request: Request) {
  const rate = await enforceSnapshotCreateLimits(request);
  if (!rate.allowed) {
    if (rate.backendError) {
      return temporarilyUnavailableResponse(rate.retryAfterSeconds);
    }
    return tooManyRequestsResponse(rate.retryAfterSeconds);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = createSnapshotLeadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid snapshot submission");
  }

  try {
    const { lead, result } = await createTechnologySnapshotLead(parsed.data);

    return NextResponse.json(
      {
        id: lead.id,
        totalScore: result.totalScore,
        classification: result.classification,
        classificationLabel: getClassificationLabel(result.classification),
        summary: getClassificationSummary(result.classification),
        observations: result.observations,
        lowestPillars: result.lowestPillars,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to save snapshot submission", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
