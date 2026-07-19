import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { AssessmentReportDocument } from "@/lib/pdf/assessment-report";
import { TipReportDocument } from "@/lib/pdf/tip-report";
import type { AssessmentReportData, TipReportData } from "@/lib/pdf/types";

export type PdfReportKind = "assessment" | "technology_improvement_plan";

export async function generateAssessmentReportPdf(data: AssessmentReportData) {
  return renderToBuffer(<AssessmentReportDocument data={data} />);
}

export async function generateTipReportPdf(data: TipReportData) {
  return renderToBuffer(<TipReportDocument data={data} />);
}

export async function generatePhaseProposalPdf(
  data: import("@/lib/phase-proposals/types").PhaseProposalDetail,
) {
  const { PhaseProposalDocument } = await import("@/lib/pdf/phase-proposal-report");
  return renderToBuffer(<PhaseProposalDocument data={data} />);
}

export async function generateProductOverviewPdf(
  data: import("@/lib/pdf/product-overview-report").ProductOverviewPdfData,
) {
  const { ProductOverviewPdfDocument } = await import("@/lib/pdf/product-overview-report");
  return renderToBuffer(<ProductOverviewPdfDocument data={data} />);
}

export async function generateReportPdf(
  kind: PdfReportKind,
  data: AssessmentReportData | TipReportData,
) {
  if (kind === "assessment") {
    return generateAssessmentReportPdf(data as AssessmentReportData);
  }
  return generateTipReportPdf(data as TipReportData);
}
