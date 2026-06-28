import { NextResponse } from "next/server";
import {
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { generateQuarterlyBusinessReview } from "@/lib/qbr";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; qbrId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId, qbrId } = await context.params;
  const review = await generateQuarterlyBusinessReview(
    clientId,
    qbrId,
    user.id,
    user.role,
  );
  if (!review) return notFound("Quarterly Business Review not found");
  return NextResponse.json({ review });
}
