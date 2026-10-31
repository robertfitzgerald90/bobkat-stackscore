import { NextResponse } from "next/server";
import { badRequest } from "@/lib/api/helpers";
import {
  enforceSnapshotCreateLimits,
  temporarilyUnavailableResponse,
  tooManyRequestsResponse,
} from "@/lib/auth/rate-limit";
import {
  createTechnologySnapshotLead,
  createTechnologySnapshotLeadV2,
} from "@/lib/technology-snapshot/service";
import {
  createSnapshotLeadSchema,
  createSnapshotLeadV2Schema,
} from "@/lib/technology-snapshot/schemas";
import {
  getClassificationLabel,
  getClassificationSummary,
} from "@/lib/technology-snapshot/scoring";
import { getPostureLabel, getPostureSummary } from "@/lib/technology-snapshot/engine";

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

  // Prefer Snapshot 2.0 contact-capture payload (answers keyed A1…D3).
  const parsedV2 = createSnapshotLeadV2Schema.safeParse(body);
  if (parsedV2.success) {
    try {
      const { lead, findings } = await createTechnologySnapshotLeadV2(parsedV2.data);
      return NextResponse.json(
        {
          id: lead.id,
          catalogVersion: lead.catalogVersion,
          classification: findings.overall.band,
          classificationLabel: getPostureLabel(findings.overall.band),
          summary: getPostureSummary(findings.overall.band),
          // Raw totals are for admin/API consumers — public UI must not present as Official StackScore.
          totalScore: findings.overall.points,
          maxScore: findings.overall.max,
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

  // Legacy snap-1.0 create (pillar-keyed answers) — kept for compatibility.
  const parsedV1 = createSnapshotLeadSchema.safeParse(body);
  if (!parsedV1.success) {
    return badRequest(
      parsedV2.error.issues[0]?.message ??
        parsedV1.error.issues[0]?.message ??
        "Invalid snapshot submission",
    );
  }

  try {
    const { lead, result } = await createTechnologySnapshotLead(parsedV1.data);

    return NextResponse.json(
      {
        id: lead.id,
        catalogVersion: lead.catalogVersion,
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
