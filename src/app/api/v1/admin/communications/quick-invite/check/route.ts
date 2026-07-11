import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { findDuplicateByEmail } from "@/lib/communications/outreach/duplicate-detection";
import { previewQuickInvite } from "@/lib/communications/outreach/quick-invite";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.email) return badRequest("email is required for duplicate check");

  const duplicate = await findDuplicateByEmail(normalizePurchaserEmail(String(body.email)));
  return NextResponse.json({ duplicate });
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const firstName = searchParams.get("firstName") ?? undefined;
  const company = searchParams.get("company") ?? undefined;

  const preview = await previewQuickInvite({ firstName, company });
  return NextResponse.json({ preview });
}
