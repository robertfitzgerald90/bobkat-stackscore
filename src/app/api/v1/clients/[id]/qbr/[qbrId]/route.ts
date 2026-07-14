import { NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  forbidden,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  getQuarterlyBusinessReview,
  updateQuarterlyBusinessReview,
} from "@/lib/qbr";
import { requireVcioFeatureWriteAccess } from "@/lib/vcio/feature-unlocks";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; qbrId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: clientId, qbrId } = await context.params;
  const review = await getQuarterlyBusinessReview(clientId, qbrId, user.role);
  if (!review) return notFound("Quarterly Business Review not found");
  return NextResponse.json({ review });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId, qbrId } = await context.params;
  const vcioDenied = await requireVcioFeatureWriteAccess(clientId, "quarterly_business_reviews");
  if (vcioDenied) return vcioDenied;

  let executiveSummary: string | null | undefined;
  try {
    const body = (await request.json()) as { executiveSummary?: string | null };
    executiveSummary = body.executiveSummary;
  } catch {
    return badRequest("Invalid request body");
  }

  try {
    const review = await updateQuarterlyBusinessReview(clientId, qbrId, {
      executiveSummary,
    });
    if (!review) return notFound("Quarterly Business Review not found");
    return NextResponse.json({ review });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update review";
    if (message.includes("cannot be edited")) return forbidden();
    return badRequest(message);
  }
}
