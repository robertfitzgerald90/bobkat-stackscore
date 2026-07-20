import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { buildExecutiveSummaryFallback } from "@/lib/reports/tip-executive-report";
import { formatInvestmentSummaryForPdf } from "@/lib/reports/tip-investment-summary";
import { registerPdfFonts } from "@/lib/pdf/shared";
import { COLORS } from "@/lib/pdf/shared/colors";
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
import { PdfTipReportFooter } from "@/lib/pdf/tip/footer";
import { tipPageStyles } from "@/lib/pdf/tip/layout";
import { TIP_PDF_SPACING, TIP_PDF_TYPOGRAPHY } from "@/lib/pdf/tip/tokens";

registerPdfFonts();

function formatTotalInvestment(data: TipReportData): string {
  return formatInvestmentSummaryForPdf(data.investmentSummary).totalInvestment;
}

function formatRecurringServices(data: TipReportData): string {
  const formatted = formatInvestmentSummaryForPdf(data.investmentSummary);
  return [formatted.recurringServices, formatted.combinedRecurring].filter(Boolean).join("\n\n");
}

function formatOneTimeInvestments(data: TipReportData): string {
  return formatInvestmentSummaryForPdf(data.investmentSummary).oneTimeInvestments;
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

  const pageChrome = <PdfTipPageChrome data={data} />;

  return (
    <Document
      title={`${data.clientName} — Technology Improvement Plan`}
      author={BRAND.companyName}
      subject="Technology Improvement Plan"
    >
      {/* Chapter 1 — Cover */}
      <Page size="LETTER" style={tipPageStyles.cover} wrap={false}>
        <PdfTipReportFooter
          generatedDate={data.generatedDate}
          clientName={data.clientName}
          documentVersion={String(data.version)}
        />
        <View style={{ paddingHorizontal: TIP_PDF_SPACING.pagePaddingX, paddingTop: 32 }}>
          <View style={{ height: 3, backgroundColor: COLORS.accent, marginBottom: 24 }} />
          <Text
            style={{
              fontSize: 8,
              color: COLORS.muted,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Prepared by {BRAND.companyName}
          </Text>
          <Text
            style={{
              fontSize: TIP_PDF_TYPOGRAPHY.coverTitle,
              fontFamily: "Helvetica-Bold",
              color: COLORS.navy,
              lineHeight: 1.2,
              marginBottom: 8,
            }}
          >
            Technology Improvement Plan
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: COLORS.muted,
              lineHeight: 1.4,
              maxWidth: 420,
              marginBottom: 20,
            }}
          >
            Executive technology assessment and strategic improvement roadmap — designed for
            leadership decision-making, not technical self-implementation
          </Text>
          <Text
            style={{
              fontSize: TIP_PDF_TYPOGRAPHY.coverClient,
              fontFamily: "Helvetica-Bold",
              color: COLORS.navy,
              lineHeight: 1.2,
              marginBottom: 18,
            }}
          >
            {data.clientName}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {[
              { label: "StackScore", value: String(data.currentScore) },
              { label: "Projected Score", value: String(data.projectedScore) },
              { label: "Business Risk", value: data.overallBusinessRisk },
              { label: "Assessment Date", value: assessmentDate },
              ...(data.maturityTierLabel
                ? [{ label: "Technology Maturity", value: data.maturityTierLabel }]
                : []),
            ].map((item) => (
              <View
                key={item.label}
                style={{
                  minWidth: 120,
                  backgroundColor: COLORS.surface,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 7,
                    color: COLORS.muted,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    marginBottom: 3,
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Helvetica-Bold",
                    color: COLORS.slate,
                    lineHeight: 1.3,
                  }}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* Chapter 2 — Assessment Scope + Executive Summary */}
      <Page size="LETTER" style={tipPageStyles.body} wrap>
        {pageChrome}
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
      </Page>

      {/* Chapter 3 — Business Value Snapshot (+ findings continue on this chapter) */}
      <Page size="LETTER" style={tipPageStyles.body} wrap>
        {pageChrome}
        <PdfBusinessValueSnapshot metrics={data.businessValueSnapshot} />
        <PdfCurrentStateFindings findings={data.categoryFindings} />
      </Page>

      {/* Chapter 4 — Strategic Improvement Roadmap (implementation phases) */}
      <Page size="LETTER" style={tipPageStyles.body} wrap>
        {pageChrome}
        <PdfStrategicImprovementRoadmap initiatives={data.strategicInitiatives} />
      </Page>

      {/* Chapter 5 — Phase Investment Summary */}
      <Page size="LETTER" style={tipPageStyles.body} wrap>
        {pageChrome}
        <PdfPhaseInvestmentSummary
          rows={data.phaseInvestmentRows}
          totalInvestment={formatTotalInvestment(data)}
          recurringServices={formatRecurringServices(data)}
          oneTimeInvestments={formatOneTimeInvestments(data)}
        />
      </Page>

      {/* Chapter 6 — Outcomes + next steps */}
      <Page size="LETTER" style={tipPageStyles.body} wrap>
        {pageChrome}
        <PdfRoadmapToResults />
        <PdfExecutiveNextSteps />
      </Page>
    </Document>
  );
}
