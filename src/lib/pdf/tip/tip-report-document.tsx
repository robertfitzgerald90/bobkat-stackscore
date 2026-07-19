import React from "react";
import { Document, Page } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import {
  buildExecutiveSummaryFallback,
} from "@/lib/reports/tip-executive-report";
import {
  PdfCoverPage,
  PdfReportFooter,
  registerPdfFonts,
} from "@/lib/pdf/shared";
import { pdfPageStyles } from "@/lib/pdf/shared/layout";
import type { TipReportData } from "@/lib/pdf/types";
import {
  PdfAssessmentScope,
  PdfBusinessValueSnapshot,
  PdfCurrentStateFindings,
  PdfExecutiveNextSteps,
  PdfExecutiveSummaryDashboard,
  PdfPhaseInvestmentSummary,
  PdfRoadmapToResults,
  PdfStrategicImprovementRoadmap,
  PdfTipPageChrome,
} from "@/lib/pdf/tip/components";

registerPdfFonts();

function formatTotalInvestment(data: TipReportData): string {
  const parts: string[] = [];
  if (data.oneTimeInvestmentTotal > 0) {
    parts.push(formatCurrency(data.oneTimeInvestmentTotal));
  }
  if (data.monthlyRecurringTotal > 0) {
    parts.push(`${formatCurrency(data.monthlyRecurringTotal)}/month`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Scoped during engagement";
}

function formatRecurringServices(data: TipReportData): string {
  if (data.monthlyRecurringTotal <= 0) {
    return "No new recurring services are identified in this roadmap.";
  }
  return `Estimated ${formatCurrency(data.monthlyRecurringTotal)}/month (${formatCurrency(data.annualRecurringTotal)}/year) in ongoing managed services and operational support introduced by approved phases.`;
}

function formatOneTimeInvestments(data: TipReportData): string {
  if (data.oneTimeInvestmentTotal <= 0) {
    return "No one-time project investments are identified in this roadmap.";
  }
  return `Estimated ${formatCurrency(data.oneTimeInvestmentTotal)} in one-time professional services, equipment, and project delivery across approved phases.`;
}

export function TipReportDocument({ data }: { data: TipReportData }) {
  const executiveText =
    data.executiveSummary ||
    buildExecutiveSummaryFallback(
      data.clientName,
      data.currentScore,
      data.projectedScore,
      data.maturityTierLabel,
    );
  const assessmentDate = data.assessmentDate ?? data.generatedDate;

  return (
    <Document
      title={`${data.clientName} — Technology Improvement Plan`}
      author={BRAND.companyName}
      subject="Technology Improvement Plan"
    >
      <Page size="LETTER" style={pdfPageStyles.cover} wrap={false}>
        <PdfReportFooter
          generatedDate={data.generatedDate}
          clientName={data.clientName}
          documentVersion={String(data.version)}
        />
        <PdfCoverPage
          eyebrow={`Prepared by ${BRAND.companyName}`}
          title="Technology Improvement Plan"
          subtitle="Executive technology assessment and strategic improvement roadmap — designed for leadership decision-making, not technical self-implementation"
          clientName={data.clientName}
          meta={[
            { label: "StackScore", value: String(data.currentScore) },
            { label: "Projected Score", value: String(data.projectedScore) },
            { label: "Business Risk", value: data.overallBusinessRisk },
            { label: "Prepared", value: data.generatedDate },
            ...(assessmentDate
              ? [{ label: "Assessment Date", value: assessmentDate }]
              : []),
            ...(data.maturityTierLabel
              ? [{ label: "Technology Maturity", value: data.maturityTierLabel }]
              : []),
          ]}
          confidentialNotice="Confidential — proprietary executive analysis for authorized recipients only"
        />
      </Page>

      <Page size="LETTER" style={pdfPageStyles.bodyWithHeader} wrap>
        <PdfTipPageChrome data={data} />
        <PdfAssessmentScope />
        <PdfExecutiveSummaryDashboard
          clientName={data.clientName}
          assessmentDate={assessmentDate}
          currentScore={data.currentScore}
          projectedScore={data.projectedScore}
          maturityTierLabel={data.maturityTierLabel ?? "Not assessed"}
          overallBusinessRisk={data.overallBusinessRisk}
          executiveSummary={executiveText}
          topBusinessRisks={data.topBusinessRisks}
          topOpportunities={data.topOpportunities}
        />
        <PdfBusinessValueSnapshot metrics={data.businessValueSnapshot} />
      </Page>

      <Page size="LETTER" style={pdfPageStyles.bodyWithHeader} wrap>
        <PdfTipPageChrome data={data} />
        <PdfCurrentStateFindings findings={data.categoryFindings} />
      </Page>

      <Page size="LETTER" style={pdfPageStyles.bodyWithHeader} wrap>
        <PdfTipPageChrome data={data} />
        <PdfStrategicImprovementRoadmap initiatives={data.strategicInitiatives} />
      </Page>

      <Page size="LETTER" style={pdfPageStyles.bodyWithHeader} wrap>
        <PdfTipPageChrome data={data} />
        <PdfPhaseInvestmentSummary
          rows={data.phaseInvestmentRows}
          totalInvestment={formatTotalInvestment(data)}
          recurringServices={formatRecurringServices(data)}
          oneTimeInvestments={formatOneTimeInvestments(data)}
        />
        <PdfRoadmapToResults />
        <PdfExecutiveNextSteps />
      </Page>
    </Document>
  );
}
