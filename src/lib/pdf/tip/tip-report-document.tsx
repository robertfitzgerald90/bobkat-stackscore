import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { getRating, RATING_LABELS } from "@/lib/scoring";
import {
  buildApprovalIntro,
  buildTipExecutiveFallback,
} from "@/lib/reports/tip-presentation";
import {
  COLORS,
  PdfCoverPage,
  PdfFlowSection,
  PdfJourneyClosingHero,
  PdfReportFooter,
  PdfSectionTitle,
  registerPdfFonts,
} from "@/lib/pdf/shared";
import { pdfPageStyles } from "@/lib/pdf/shared/layout";
import { formatGeneratedDate, type TipReportData } from "@/lib/pdf/types";
import { tipPdfStyles } from "@/lib/pdf/tip/styles";
import {
  PdfMaturityComparison,
  PdfNextSteps,
  PdfOverallInvestment,
  PdfPhaseSection,
  PdfPillarGrid,
  PdfRoadmapOverview,
  PdfTipPageChrome,
  tipBodyStyles,
} from "@/lib/pdf/tip/components";

registerPdfFonts();

export function TipReportDocument({ data }: { data: TipReportData }) {
  const currentRating = getRating(data.currentScore);
  const projectedRating = getRating(data.projectedScore);
  const executiveText =
    data.executiveSummary ||
    buildTipExecutiveFallback(data.clientName, data.currentScore, data.projectedScore);
  const phases = data.technologyRoadmap.phases;

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
          subtitle="A phased executive roadmap for measurable technology improvement — designed for board-ready presentation and independent phase approval"
          clientName={data.clientName}
          meta={[
            { label: "Technology Score", value: String(data.currentScore) },
            { label: "Projected Score", value: String(data.projectedScore) },
            { label: "Report Version", value: `v${data.version}` },
            { label: "Prepared Date", value: data.generatedDate },
            ...(data.assessmentName
              ? [{ label: "Assessment Date", value: data.assessmentName }]
              : []),
            ...(data.maturityTierLabel
              ? [{ label: "Current Maturity", value: data.maturityTierLabel }]
              : []),
          ]}
          confidentialNotice="Confidential — proprietary analysis for authorized recipients only"
        />
      </Page>

      <Page size="LETTER" style={pdfPageStyles.bodyWithHeader} wrap>
        <PdfTipPageChrome data={data} />

        <PdfFlowSection
          title="Executive Summary"
          subtitle="Strategic context for a phased technology roadmap"
        >
          <Text style={tipBodyStyles.bodyText}>{executiveText}</Text>
        </PdfFlowSection>

        <PdfFlowSection
          title="Current Technology Maturity"
          subtitle="Baseline score, projected improvement, and domain-level visibility"
        >
          <PdfMaturityComparison data={data} />
          <PdfPillarGrid categories={data.categorySummaries} />
        </PdfFlowSection>
      </Page>

      <Page size="LETTER" style={pdfPageStyles.bodyWithHeader} wrap>
        <PdfTipPageChrome data={data} />

        <PdfFlowSection
          title="Technology Roadmap Overview"
          subtitle="A sequenced journey from assessment through strategic enhancement"
        >
          <PdfRoadmapOverview data={data} />
        </PdfFlowSection>
      </Page>

      <Page size="LETTER" style={pdfPageStyles.bodyWithHeader} wrap>
        <PdfTipPageChrome data={data} />

        <PdfSectionTitle
          title="Implementation Phases"
          subtitle="Each phase is designed for independent approval, executive clarity, and natural pagination"
        />

        {phases.map((phase, index) => (
          <PdfPhaseSection key={phase.id} data={data} phase={phase} phaseNumber={index + 1} />
        ))}
      </Page>

      <Page size="LETTER" style={pdfPageStyles.bodyWithHeader} wrap>
        <PdfTipPageChrome data={data} />

        <PdfFlowSection
          title="Overall Investment Summary"
          subtitle="Executive KPI view — one-time and recurring investments presented separately"
        >
          <PdfOverallInvestment data={data} />
        </PdfFlowSection>

        <PdfFlowSection
          title="Next Steps"
          subtitle="A practical path from approval through measured improvement"
        >
          <PdfNextSteps />
        </PdfFlowSection>

        <PdfFlowSection
          title="Approval"
          subtitle="Phases may be approved independently as priorities and budget allow"
          breakBefore
        >
          <Text style={tipBodyStyles.bodyText}>{buildApprovalIntro(data.clientName)}</Text>
          {phases.map((phase) => (
            <View key={phase.id} style={tipPdfStyles.approvalRow} minPresenceAhead={80}>
              <View style={tipPdfStyles.approvalCheckbox} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: COLORS.navy, marginBottom: 3 }}>
                  {phase.subtitle} — {phase.name}
                </Text>
                <Text style={{ fontSize: 9, color: COLORS.muted, marginBottom: 8 }}>
                  Timeline {phase.timeline} · One-time {formatCurrency(phase.oneTimeInvestment)}
                  {phase.monthlyRecurringInvestment > 0
                    ? ` · Monthly ${formatCurrency(phase.monthlyRecurringInvestment)}`
                    : ""}
                </Text>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.slate,
                    width: 160,
                    marginBottom: 4,
                  }}
                />
                <Text style={tipPdfStyles.signatureLabel}>Phase signature / date</Text>
              </View>
            </View>
          ))}
          <View style={tipPdfStyles.signatureLine} />
          <Text style={tipPdfStyles.signatureLabel}>Authorized Signature</Text>
          <View style={tipPdfStyles.signatureLine} />
          <Text style={tipPdfStyles.signatureLabel}>Date</Text>
        </PdfFlowSection>
      </Page>

      <Page size="LETTER" style={pdfPageStyles.bodyWithHeader} wrap>
        <PdfTipPageChrome data={data} />
        <PdfJourneyClosingHero
          title="Your Technology Journey"
          subtitle={`${BRAND.companyName} partners with organizations through Assess → Improve → Maintain to deliver measurable, lasting technology outcomes.`}
          activePhaseLabel={data.journeyPhaseLabel}
        />
        <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
          <View style={tipPdfStyles.pillarCard}>
            <Text style={{ fontSize: 9, color: COLORS.muted, marginBottom: 4 }}>Starting StackScore</Text>
            <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: COLORS.navy }}>
              {data.currentScore}
            </Text>
            <Text style={{ fontSize: 10, color: COLORS.navy, marginTop: 4 }}>{RATING_LABELS[currentRating]}</Text>
          </View>
          <View style={tipPdfStyles.pillarCardPlanned}>
            <Text style={{ fontSize: 9, color: COLORS.muted, marginBottom: 4 }}>Target StackScore</Text>
            <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: COLORS.navy }}>
              {data.projectedScore}
            </Text>
            <Text style={{ fontSize: 10, color: COLORS.navy, marginTop: 4 }}>{RATING_LABELS[projectedRating]}</Text>
          </View>
        </View>
        <Text
          style={[
            tipBodyStyles.bodyText,
            { color: COLORS.muted, marginTop: 16, textAlign: "center" },
          ]}
        >
          Generated by {BRAND.productName} on {formatGeneratedDate()} · {BRAND.companyName} ·{" "}
          {BRAND.website}
        </Text>
      </Page>
    </Document>
  );
}
