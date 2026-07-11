import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import { importCsvRows, previewCsvImport } from "@/lib/communications/outreach/csv-import";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  if (!body?.content && !body?.rows) {
    return badRequest("CSV content or rows are required");
  }

  if (body.previewOnly) {
    if (!body.content) return badRequest("content is required for preview");
    try {
      const preview = await previewCsvImport(String(body.content));
      return NextResponse.json({ preview });
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : "Invalid CSV");
    }
  }

  const rows = body.rows ?? [];
  if (!Array.isArray(rows) || rows.length === 0) {
    return badRequest("No rows to import");
  }

  const results = await importCsvRows({
    rows,
    campaignId: body.campaignId ? String(body.campaignId) : undefined,
    createdByUserId: user.id,
    skipDuplicates: Boolean(body.skipDuplicates),
  });

  return NextResponse.json({ results });
}
