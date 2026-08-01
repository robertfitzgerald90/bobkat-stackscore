import type { QbrReportData } from "@/lib/qbr/types";
import { sanitizeFilename } from "@/lib/pdf/types";

function cleanFilenameSegment(value: string, fallback: string): string {
  const cleaned = sanitizeFilename(value).replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

/** Build a client-facing PDF filename without internal IDs. */
export function buildBusinessReviewPdfFilename(
  data: Pick<QbrReportData, "clientName" | "reviewPeriodLabel">,
): string {
  const org = cleanFilenameSegment(data.clientName, "Organization");
  const period = cleanFilenameSegment(data.reviewPeriodLabel, "Review-Period");
  return `${org}-Business-Review-${period}.pdf`;
}
