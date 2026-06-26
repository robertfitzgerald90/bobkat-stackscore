import { NextResponse } from "next/server";
import {
  getSessionUser,
  notFound,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { generateTipReportPdf } from "@/lib/pdf/generate";
import { sanitizeFilename } from "@/lib/pdf/types";
import { getTipPlan } from "@/lib/technology-improvement-plan";
import { buildTipReportData } from "@/lib/technology-improvement-plan/report-data";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; tipId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId, tipId } = await context.params;
  const plan = await getTipPlan(clientId, tipId, user.role);
  if (!plan) return notFound("Technology Improvement Plan not found");

  const includeInternal = user.role === "admin";
  const reportData = buildTipReportData(plan, includeInternal);
  const buffer = await generateTipReportPdf(reportData);
  const filename = `${sanitizeFilename(plan.clientName)}-technology-improvement-plan-v${plan.version}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": plan.status === "generated" ? "private, max-age=3600" : "no-store",
    },
  });
}
