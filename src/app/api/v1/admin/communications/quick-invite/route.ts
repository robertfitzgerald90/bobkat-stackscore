import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  conflict,
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { findDuplicateByEmail } from "@/lib/communications/outreach/duplicate-detection";
import { executeQuickInvite } from "@/lib/communications/outreach/quick-invite";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Invalid request body");

  if (!body.forceResend) {
    const duplicate = await findDuplicateByEmail(normalizePurchaserEmail(String(body.email ?? "")));
    if (duplicate) {
      return NextResponse.json({ duplicate }, { status: 409 });
    }
  }

  try {
    const result = await executeQuickInvite({
      firstName: String(body.firstName ?? ""),
      lastName: String(body.lastName ?? ""),
      company: String(body.company ?? ""),
      email: String(body.email ?? ""),
      phone: body.phone ? String(body.phone) : undefined,
      industry: body.industry ? String(body.industry) : undefined,
      employeeCount: body.employeeCount ? Number(body.employeeCount) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
      campaignId: body.campaignId ? String(body.campaignId) : undefined,
      templateKey: body.templateKey ? String(body.templateKey) : "EMAIL-009",
      forceResend: Boolean(body.forceResend),
      skipDuplicateCheck: Boolean(body.forceResend),
      createdByUserId: user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Quick Invite failed";
    if (message.startsWith("DUPLICATE:")) {
      return conflict("A matching record already exists");
    }
    return badRequest(message);
  }
}
