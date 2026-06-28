import { NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  createQuarterlyBusinessReview,
  listQuarterlyBusinessReviews,
} from "@/lib/qbr";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId } = await context.params;
  const reviews = await listQuarterlyBusinessReviews(clientId);
  return NextResponse.json({ reviews });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId } = await context.params;
  let reviewDate: Date | undefined;
  try {
    const body = (await request.json()) as { reviewDate?: string };
    reviewDate = body.reviewDate ? new Date(body.reviewDate) : undefined;
  } catch {
    reviewDate = undefined;
  }

  try {
    const review = await createQuarterlyBusinessReview(
      clientId,
      user.id,
      reviewDate,
    );
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create review";
    if (message.includes("not found")) return notFound(message);
    return badRequest(message);
  }
}
