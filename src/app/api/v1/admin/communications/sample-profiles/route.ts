import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { createSampleProfile, listSampleProfiles } from "@/lib/communications/sample-profiles";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const templateKey = request.nextUrl.searchParams.get("templateKey") ?? undefined;
  const profiles = await listSampleProfiles(templateKey);
  return NextResponse.json({ profiles });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.sampleData) {
    return badRequest("name and sampleData are required");
  }

  const profile = await createSampleProfile({
    name: String(body.name),
    templateKey: body.templateKey ? String(body.templateKey) : undefined,
    sampleData: body.sampleData as Record<string, unknown>,
    userId: user.id,
  });

  return NextResponse.json({ profile });
}
