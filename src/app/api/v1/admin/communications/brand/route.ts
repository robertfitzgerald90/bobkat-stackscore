import { NextRequest, NextResponse } from "next/server";
import {
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { getCommunicationBrandSettings, upsertCommunicationBrandSettings } from "@/lib/communications/brand-settings";
import { requireCommunicationsAdmin } from "@/lib/communications/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const brand = await getCommunicationBrandSettings();
  return NextResponse.json({ brand });
}

export async function PUT(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireCommunicationsAdmin(user);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const brand = await upsertCommunicationBrandSettings(body, user.id);
  return NextResponse.json({ brand });
}
