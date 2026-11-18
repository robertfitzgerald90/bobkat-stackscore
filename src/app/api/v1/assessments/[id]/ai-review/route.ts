import { after, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, requireAdmin, unauthorized } from "@/lib/api/helpers";
import { AiReviewError } from "@/lib/ai-assessment/config";
import {
  getReviewData,
  enqueueReview,
  processReview,
  mutateReview,
} from "@/lib/ai-assessment/service";
import { reviewMutationSchema } from "@/lib/ai-assessment/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
type Context = { params: Promise<{ id: string }> };
async function access() {
  const user = await getSessionUser();
  if (!user) return { denied: unauthorized(), user: null };
  const denied = requireAdmin(user);
  return { denied, user };
}
function requestBoundary(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Cross-origin mutations are not allowed." },
      { status: 403 },
    );
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return NextResponse.json(
      { error: "JSON requests are required." },
      { status: 415 },
    );
  return null;
}
function failure(error: unknown) {
  if (error instanceof SyntaxError)
    return NextResponse.json(
      { error: "Invalid request JSON." },
      { status: 400 },
    );
  if (error instanceof AiReviewError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof z.ZodError)
    return NextResponse.json(
      {
        error:
          "Draft validation failed. Check the required text and source references.",
      },
      { status: 422 },
    );
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    ["P2002", "P2034"].includes(String(error.code))
  )
    return NextResponse.json(
      {
        error: "Another review operation is in progress. Reload and try again.",
      },
      { status: 409 },
    );
  return NextResponse.json(
    {
      error:
        "AI review is temporarily unavailable. Check database setup and server configuration.",
    },
    { status: 503 },
  );
}
export async function GET(request: Request, context: Context) {
  const { denied } = await access();
  if (denied) return denied;
  try {
    const { id } = await context.params;
    const reviewId = new URL(request.url).searchParams.get("reviewId");
    if (reviewId && !z.string().uuid().safeParse(reviewId).success)
      return NextResponse.json(
        { error: "Invalid review identifier." },
        { status: 400 },
      );
    return NextResponse.json(await getReviewData(id, reviewId ?? undefined), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request, context: Context) {
  const { denied, user } = await access();
  if (denied) return denied;
  if (!user) return unauthorized();
  const boundary = requestBoundary(request);
  if (boundary) return boundary;
  try {
    const input = await request.json();
    if (
      !z
        .object({
          consent: z.literal(true),
          inputHash: z.string().regex(/^[a-f0-9]{64}$/),
        })
        .strict()
        .safeParse(input).success
    )
      return NextResponse.json(
        { error: "Confirm provider data sharing before generating." },
        { status: 400 },
      );
    const { id } = await context.params;
    const record = await enqueueReview(id, user.id, input.inputHash);
    after(async () => {
      try {
        await processReview(record.id);
      } catch {
        /* Durable queued/generating records expire and can be retried; never log assessment content. */
      }
    });
    return NextResponse.json({ reviewId: record.id }, { status: 202 });
  } catch (error) {
    return failure(error);
  }
}
export async function PATCH(request: Request, context: Context) {
  const { denied, user } = await access();
  if (denied) return denied;
  if (!user) return unauthorized();
  const boundary = requestBoundary(request);
  if (boundary) return boundary;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 100_000)
      return NextResponse.json(
        { error: "Review draft is too large." },
        { status: 413 },
      );
    const mutation = reviewMutationSchema.parse(JSON.parse(raw));
    const { id } = await context.params;
    return NextResponse.json(await mutateReview(id, user.id, mutation));
  } catch (error) {
    return failure(error);
  }
}
