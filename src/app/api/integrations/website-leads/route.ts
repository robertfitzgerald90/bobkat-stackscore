import { NextResponse } from "next/server";
import {
  checkWebsiteLeadRateLimit,
  createWebsiteLeadFromIntegration,
  createWebsiteLeadIntegrationSchema,
  requireWebsiteLeadsApiSecret,
  resolveRateLimitKey,
} from "@/lib/website-leads";
import { badRequest, conflict } from "@/lib/api/helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorizedIntegration() {
  return NextResponse.json(
    { error: "Invalid integration credentials", code: "UNAUTHORIZED" },
    { status: 401 },
  );
}

function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many requests", code: "RATE_LIMITED" },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
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

  const rateLimitKey = resolveRateLimitKey(request);
  const rateLimit = checkWebsiteLeadRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return tooManyRequests(rateLimit.retryAfterSeconds ?? 60);
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
