import { NextResponse } from "next/server";
import {
  createWebsiteLeadFromIntegration,
  createWebsiteLeadIntegrationSchema,
  requireWebsiteLeadsApiSecret,
} from "@/lib/website-leads";
import { badRequest, conflict } from "@/lib/api/helpers";
import {
  enforceWebsiteLeadsIpLimits,
  temporarilyUnavailableResponse,
  tooManyRequestsResponse,
} from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorizedIntegration() {
  return NextResponse.json(
    { error: "Invalid integration credentials", code: "UNAUTHORIZED" },
    { status: 401 },
  );
}

export async function POST(request: Request) {
  if (!process.env.WEBSITE_LEADS_API_SECRET?.trim()) {
    console.error("[website-leads] WEBSITE_LEADS_API_SECRET is not configured");
    return NextResponse.json(
      { error: "Integration is not configured", code: "NOT_CONFIGURED" },
      { status: 500 },
    );
  }

  if (!requireWebsiteLeadsApiSecret(request)) {
    return unauthorizedIntegration();
  }

  const rate = await enforceWebsiteLeadsIpLimits(request);
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

  const parsed = createWebsiteLeadIntegrationSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid submission");
  }

  try {
    const result = await createWebsiteLeadFromIntegration(parsed.data);

    if (result.duplicate) {
      return conflict("Duplicate submission");
    }

    if (!result.lead) {
      return NextResponse.json(
        { error: "Unable to save lead", code: "CREATE_FAILED" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        id: result.lead.id,
        status: result.lead.status,
        submittedAt: result.lead.submittedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[website-leads] integration create failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Unable to save lead", code: "CREATE_FAILED" },
      { status: 500 },
    );
  }
}
