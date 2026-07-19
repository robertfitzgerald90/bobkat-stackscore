import { NextResponse } from "next/server";
import { getSessionUserWithClient } from "@/lib/api/access";
import { forbidden, unauthorized } from "@/lib/api/helpers";
import { isConsultantRole } from "@/lib/client-roadmap/permissions";
import { getCommercialInsightsDashboard } from "@/lib/commercial-intelligence";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();
  if (!isConsultantRole(user.role)) return forbidden();

  const dashboard = await getCommercialInsightsDashboard();
  return NextResponse.json({ dashboard });
}
