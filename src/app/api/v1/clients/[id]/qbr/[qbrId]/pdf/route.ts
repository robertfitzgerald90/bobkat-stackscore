import { NextResponse } from "next/server";
import {
  getSessionUserWithClient,
  requireClientWorkspaceAccess,
} from "@/lib/api/access";
import { unauthorized } from "@/lib/api/helpers";
import { recordAdminAuditEvent } from "@/lib/admin/audit-log";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { generateQbrReportPdf } from "@/lib/pdf/generate";
import { buildBusinessReviewPdfFilename } from "@/lib/qbr/pdf-filename";
import { getQuarterlyBusinessReview } from "@/lib/qbr";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; qbrId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUserWithClient();
  if (!user) return unauthorized();

  const { id: clientId, qbrId } = await context.params;
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) return denied;

  const review = await getQuarterlyBusinessReview(clientId, qbrId, user.role);
  if (!review) {
    return NextResponse.json(
      { error: "Business Review not found", code: "NOT_FOUND" },
      { status: 404 },
    );
  }

  try {
    const buffer = await generateQbrReportPdf(review.report);
    const filename = buildBusinessReviewPdfFilename(review.report);

    await recordOrganizationActivity({
      clientId,
      userId: user.id,
      actorUserId: user.id,
      category: "TECHNOLOGY",
      eventType: "business_review_exported",
      title: "Business Review exported",
      description: `PDF export for ${review.report.reviewPeriodLabel}`,
      source: "STACKSCORE",
      sourceRecordType: "QuarterlyBusinessReview",
      sourceRecordId: review.id,
      visibility: "INTERNAL",
      metadata: {
        format: "pdf",
        success: true,
        reviewPeriodLabel: review.report.reviewPeriodLabel,
      },
    });

    if (user.role === "admin" || user.role === "technician") {
      await recordAdminAuditEvent({
        action: "business_review.pdf_exported",
        entityType: "QuarterlyBusinessReview",
        entityId: review.id,
        actor: { id: user.id, name: user.name, email: user.email },
        summary: `Exported Business Review PDF for ${review.report.clientName}`,
        source: "admin.business-review.export-pdf",
        metadata: {
          clientId,
          format: "pdf",
          success: true,
        },
      });
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": review.status === "generated" ? "private, max-age=300" : "no-store",
      },
    });
  } catch (error) {
    console.error("[qbr/pdf] Failed to generate Business Review PDF", {
      clientId,
      qbrId,
      error: error instanceof Error ? error.message : String(error),
    });

    await recordOrganizationActivity({
      clientId,
      userId: user.id,
      actorUserId: user.id,
      category: "TECHNOLOGY",
      eventType: "business_review_export_failed",
      title: "Business Review export failed",
      description: "PDF generation failed; no file was downloaded.",
      source: "STACKSCORE",
      sourceRecordType: "QuarterlyBusinessReview",
      sourceRecordId: qbrId,
      visibility: "INTERNAL",
      metadata: {
        format: "pdf",
        success: false,
      },
    });

    return NextResponse.json(
      {
        error: "Unable to generate the Business Review PDF. No file was downloaded.",
        code: "PDF_GENERATION_FAILED",
      },
      { status: 500 },
    );
  }
}
