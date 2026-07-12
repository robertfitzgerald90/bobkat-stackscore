import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { getPriorityTimeline } from "@/lib/recommendations/display";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { getRating, RATING_LABELS } from "@/lib/scoring";
import {
  buildTipExecutiveFallback,
  getRoadmapPhaseObjectives,
  getRoadmapPhaseTimeline,
  TIP_MATURITY_TARGET,
} from "@/lib/reports/tip-presentation";
import {
  COLORS,
  PDF_RATING_BAR as RATING_BAR,
  PdfConfidentialFooter,
  PdfJourneyClosingHero,
  PdfPriorityBadge,
  PdfReportHeader,
  PdfSectionTitle,
  getPdfLogoPath,
  registerPdfFonts,
} from "@/lib/pdf/shared";
import {
  formatGeneratedDate,
  type TipCategorySummary,
  type TipReportData,
} from "@/lib/pdf/types";

registerPdfFonts();

const styles = StyleSheet.create({
  coverPage: {
    paddingTop: 0,
    paddingBottom: 80,
    paddingHorizontal: 0,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
  page: {
    paddingTop: 88,
    paddingBottom: 80,
    paddingHorizontal: 54,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
  coverHero: {
    backgroundColor: COLORS.navy,
    paddingTop: 56,
    paddingBottom: 48,
    paddingHorizontal: 54,
  },
  coverProduct: {
    fontSize: 11,
    color: "rgba(255,255,255,0.72)",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  coverTitle: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    lineHeight: 1.15,
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.88)",
    lineHeight: 1.6,
    maxWidth: 420,
  },
  coverBody: {
    paddingHorizontal: 54,
    paddingTop: 36,
    flexGrow: 1,
  },
  coverBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 28,
  },
  coverBrandLogo: { width: 56, height: 56, objectFit: "contain" },
  coverPreparedBy: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 3,
  },
  coverFinePrint: { fontSize: 9, color: COLORS.muted, lineHeight: 1.5 },
  coverClientName: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 24,
    lineHeight: 1.25,
  },
  coverMetaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 20, marginBottom: 24 },
  coverMetaBlock: { minWidth: 130 },
  coverMetaLabel: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 4,
  },
  coverMetaValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate,
    lineHeight: 1.4,
  },
  coverConfidential: {
    marginTop: 28,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  coverConfidentialText: {
    fontSize: 8,
    color: COLORS.muted,
    lineHeight: 1.6,
    letterSpacing: 0.2,
  },
  sectionBlock: { marginBottom: 22 },
  bodyText: { fontSize: 10, lineHeight: 1.7, color: COLORS.slate, marginBottom: 8 },
  maturityHero: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  maturityHeroHeading: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 12,
  },
  maturityCompareRow: { flexDirection: "row", gap: 10, alignItems: "stretch" },
  maturityCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    padding: 14,
  },
  maturityCardProjected: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.navy,
    borderRadius: 8,
    backgroundColor: COLORS.navyLight,
    padding: 14,
  },
  maturityCardLabel: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  maturityCardScore: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1,
    marginBottom: 4,
  },
  maturityCardRating: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 10,
  },
  maturityBarTrack: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  maturityBarFill: { height: 8, borderRadius: 4 },
  maturityDelta: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  maturityDeltaValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.success,
    marginBottom: 2,
  },
  maturityDeltaLabel: {
    fontSize: 6,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  journeyStrip: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  journeyStripTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  journeyTrack: {
    height: 10,
    backgroundColor: COLORS.white,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 6,
  },
  journeyFill: { height: 10, backgroundColor: COLORS.navy, borderRadius: 5 },
  journeyMeta: { fontSize: 8, color: COLORS.muted, lineHeight: 1.5 },
  outcomeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  outcomeCard: {
    width: "48%",
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    padding: 14,
    minHeight: 88,
  },
  outcomeIndex: {
    fontSize: 6,
    color: "rgba(255,255,255,0.55)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  outcomeTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  outcomeText: { fontSize: 8, color: "rgba(255,255,255,0.82)", lineHeight: 1.55 },
  pillarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pillarCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    padding: 12,
    marginBottom: 2,
  },
  pillarCardPlanned: {
    width: "48%",
    borderWidth: 1,
    borderColor: COLORS.navy,
    borderRadius: 8,
    backgroundColor: COLORS.navyLight,
    padding: 12,
    marginBottom: 2,
  },
  pillarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
  },
  pillarName: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.35,
  },
  pillarScore: { fontSize: 14, fontFamily: "Helvetica-Bold", color: COLORS.navy },
  pillarRating: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  pillarTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  pillarFill: { height: 6, borderRadius: 3 },
  pillarFoot: { fontSize: 7, color: COLORS.muted, lineHeight: 1.45 },
  pillarBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(8,47,91,0.25)",
    backgroundColor: "rgba(8,47,91,0.08)",
  },
  pillarBadgeText: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  recommendationCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderTopWidth: 3,
    borderTopColor: COLORS.navy,
    overflow: "hidden",
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    paddingBottom: 10,
  },
  recommendationTitle: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.4,
  },
  recMetaRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  recMetaBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recMetaLabel: {
    fontSize: 6,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  recMetaValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.4,
  },
  recBody: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: "#F1F5F9",
    padding: 12,
    paddingHorizontal: 14,
  },
  recFieldLabel: {
    fontSize: 6,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  recFieldValue: { fontSize: 9, lineHeight: 1.6, color: COLORS.slate },
  roadmapPhaseRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  roadmapRail: { width: 28, alignItems: "center" },
  roadmapDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  roadmapDotActive: {
    borderColor: COLORS.navy,
    backgroundColor: COLORS.navy,
  },
  roadmapDotText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: COLORS.muted },
  roadmapDotTextActive: { fontSize: 8, fontFamily: "Helvetica-Bold", color: COLORS.white },
  roadmapLine: {
    width: 2,
    flexGrow: 1,
    minHeight: 16,
    backgroundColor: COLORS.border,
    marginTop: 4,
  },
  roadmapCard: {
    flex: 1,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    padding: 14,
  },
  roadmapCardActive: {
    flex: 1,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.navy,
    borderRadius: 8,
    backgroundColor: COLORS.navyLight,
    padding: 14,
  },
  roadmapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  roadmapLabel: { flex: 1, fontSize: 10, fontFamily: "Helvetica-Bold", color: COLORS.navy },
  roadmapTimeline: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 3,
  },
  roadmapScoreBlock: { alignItems: "flex-end" },
  roadmapScore: { fontSize: 16, fontFamily: "Helvetica-Bold", color: COLORS.navy },
  roadmapDelta: { fontSize: 7, fontFamily: "Helvetica-Bold", color: COLORS.success, marginTop: 2 },
  roadmapInitiative: { fontSize: 8, color: COLORS.slate, lineHeight: 1.55, marginBottom: 3 },
  roadmapObjectives: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.navy,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  tableRowAlt: { backgroundColor: COLORS.surface },
  tableCellCategory: { width: "24%", fontSize: 9, fontFamily: "Helvetica-Bold", color: COLORS.navy },
  tableCellDesc: { width: "52%", fontSize: 8, color: COLORS.muted, paddingRight: 8, lineHeight: 1.5 },
  tableCellAmount: {
    width: "24%",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate,
    textAlign: "right",
  },
  totalPanel: {
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 7,
    color: "rgba(255,255,255,0.72)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  totalValue: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    lineHeight: 1,
  },
  totalCaption: { fontSize: 8, color: "rgba(255,255,255,0.85)", marginTop: 8, lineHeight: 1.5 },
  signatureBlock: {
    marginTop: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate,
    width: 220,
    marginTop: 28,
    marginBottom: 6,
  },
  closingScoreRow: { flexDirection: "row", gap: 10, marginTop: 14 },
});

function PdfMaturityHero({ data }: { data: TipReportData }) {
  const currentRating = getRating(data.currentScore);
  const projectedRating = getRating(data.projectedScore);
  const currentWidth = `${Math.max(0, Math.min(100, data.currentScore))}%`;
  const projectedWidth = `${Math.max(0, Math.min(100, data.projectedScore))}%`;
  const journeyWidth = `${Math.max(0, Math.min(100, data.journeyProgressPercent))}%`;

  return (
    <View wrap={false} style={styles.maturityHero}>
      <Text style={styles.maturityHeroHeading}>Technology Maturity — Current vs Projected</Text>
      <View style={styles.maturityCompareRow}>
        <View style={styles.maturityCard}>
          <Text style={styles.maturityCardLabel}>Today</Text>
          <Text style={styles.maturityCardScore}>{data.currentScore}</Text>
          <Text style={styles.maturityCardRating}>{RATING_LABELS[currentRating]}</Text>
          <View style={styles.maturityBarTrack}>
            <View
              style={[
                styles.maturityBarFill,
                { width: currentWidth, backgroundColor: RATING_BAR[currentRating] },
              ]}
            />
          </View>
        </View>
        <View style={styles.maturityDelta}>
          <Text style={styles.maturityDeltaValue}>+{data.scoreImprovement}</Text>
          <Text style={styles.maturityDeltaLabel}>StackScore points</Text>
        </View>
        <View style={styles.maturityCardProjected}>
          <Text style={styles.maturityCardLabel}>Projected</Text>
          <Text style={styles.maturityCardScore}>{data.projectedScore}</Text>
          <Text style={styles.maturityCardRating}>{RATING_LABELS[projectedRating]}</Text>
          <View style={styles.maturityBarTrack}>
            <View
              style={[
                styles.maturityBarFill,
                { width: projectedWidth, backgroundColor: RATING_BAR[projectedRating] },
              ]}
            />
          </View>
        </View>
      </View>
      <View style={styles.journeyStrip}>
        <Text style={styles.journeyStripTitle}>
          Technology Journey — {data.journeyPhaseLabel} Phase
        </Text>
        <View style={styles.journeyTrack}>
          <View style={[styles.journeyFill, { width: journeyWidth }]} />
        </View>
        <Text style={styles.journeyMeta}>
          Journey progress: {data.journeyProgressPercent}% · Projected improvement: +
          {data.scoreImprovement} points · Maturity target: {TIP_MATURITY_TARGET}+
        </Text>
      </View>
    </View>
  );
}

function PdfPillarScorecard({ category }: { category: TipCategorySummary }) {
  const rating = getRating(category.score);
  const fillWidth = `${Math.max(0, Math.min(100, category.score))}%`;

  return (
    <View wrap={false} style={category.hasRecommendations ? styles.pillarCardPlanned : styles.pillarCard}>
      <View style={styles.pillarHeader}>
        <Text style={styles.pillarName}>{category.name}</Text>
        <Text style={styles.pillarScore}>{category.score}</Text>
      </View>
      <Text style={styles.pillarRating}>{category.ratingLabel}</Text>
      <View style={styles.pillarTrack}>
        <View
          style={[styles.pillarFill, { width: fillWidth, backgroundColor: RATING_BAR[rating] }]}
        />
      </View>
      <Text style={styles.pillarFoot}>
        {category.hasRecommendations
          ? "Improvement initiative planned in this domain"
          : "Baseline maturity — no active initiatives in this plan"}
      </Text>
      {category.hasRecommendations ? (
        <View style={styles.pillarBadge}>
          <Text style={styles.pillarBadgeText}>Improvement planned</Text>
        </View>
      ) : null}
    </View>
  );
}

function InvestmentTable({ data }: { data: TipReportData }) {
  return (
    <View wrap={false}>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: "24%" }]}>Category</Text>
          <Text style={[styles.tableHeaderCell, { width: "52%" }]}>Description</Text>
          <Text style={[styles.tableHeaderCell, { width: "24%", textAlign: "right" }]}>
            Amount
          </Text>
        </View>
        {data.investmentLineItems.map((row, index) => (
          <View
            key={row.category}
            style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
          >
            <Text style={styles.tableCellCategory}>{row.category}</Text>
            <Text style={styles.tableCellDesc}>{row.description}</Text>
            <Text style={styles.tableCellAmount}>{formatCurrency(row.amount)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.totalPanel}>
        <Text style={styles.totalLabel}>Total Client Investment</Text>
        <Text style={styles.totalValue}>{formatCurrency(data.clientInvestmentTotal)}</Text>
        <Text style={styles.totalCaption}>
          All professional services, technology, and implementation costs required to execute this
          improvement plan.
        </Text>
      </View>
    </View>
  );
}

export function TipReportDocument({ data }: { data: TipReportData }) {
  const currentRating = getRating(data.currentScore);
  const projectedRating = getRating(data.projectedScore);
  const executiveText =
    data.executiveSummary ||
    buildTipExecutiveFallback(data.clientName, data.currentScore, data.projectedScore);

  return (
    <Document
      title={`${data.clientName} — Technology Improvement Plan`}
      author={BRAND.companyName}
      subject="Technology Improvement Plan"
    >
      <Page size="LETTER" style={styles.coverPage} wrap={false}>
        <PdfConfidentialFooter clientName={data.clientName} generatedDate={data.generatedDate} />

        <View style={styles.coverHero}>
          <Text style={styles.coverProduct}>Generated by {BRAND.productName}</Text>
          <Text style={styles.coverTitle}>Technology Improvement Plan</Text>
          <Text style={styles.coverSubtitle}>
            A strategic roadmap to strengthen technology resilience, reduce risk, and deliver
            measurable business outcomes
          </Text>
        </View>

        <View style={styles.coverBody}>
          <View style={styles.coverBrandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={getPdfLogoPath()} style={styles.coverBrandLogo} />
            <View>
              <Text style={styles.coverPreparedBy}>Prepared by {BRAND.companyName}</Text>
              <Text style={styles.coverFinePrint}>
                Professional IT advisory · Technology maturity & improvement planning
              </Text>
            </View>
          </View>

          <Text style={styles.coverClientName}>{data.clientName}</Text>

          <View style={styles.coverMetaGrid}>
            <View style={styles.coverMetaBlock}>
              <Text style={styles.coverMetaLabel}>Document Version</Text>
              <Text style={styles.coverMetaValue}>v{data.version}</Text>
            </View>
            <View style={styles.coverMetaBlock}>
              <Text style={styles.coverMetaLabel}>Prepared Date</Text>
              <Text style={styles.coverMetaValue}>{data.generatedDate}</Text>
            </View>
            {data.assessmentName ? (
              <View style={styles.coverMetaBlock}>
                <Text style={styles.coverMetaLabel}>Based On Assessment</Text>
                <Text style={styles.coverMetaValue}>{data.assessmentName}</Text>
              </View>
            ) : null}
            {data.maturityTierLabel ? (
              <View style={styles.coverMetaBlock}>
                <Text style={styles.coverMetaLabel}>Current Maturity</Text>
                <Text style={styles.coverMetaValue}>{data.maturityTierLabel}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.coverConfidential}>
            <Text style={styles.coverConfidentialText}>
              CONFIDENTIAL — This document contains proprietary analysis prepared exclusively for{" "}
              {data.clientName}. It may not be reproduced or distributed without written consent
              from {BRAND.companyName}.
            </Text>
          </View>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfReportHeader
          clientName={data.clientName}
          generatedDate={data.generatedDate}
          documentLabel="Technology Improvement Plan"
        />
        <PdfConfidentialFooter clientName={data.clientName} generatedDate={data.generatedDate} />

        <View style={styles.sectionBlock}>
          <PdfSectionTitle
            title="Executive Summary"
            subtitle="Business context, profile trajectory, and expected outcomes"
          />
          <Text style={styles.bodyText}>{executiveText}</Text>
          <PdfMaturityHero data={data} />
        </View>

        {data.businessOutcomes.length > 0 ? (
          <View style={styles.sectionBlock}>
            <PdfSectionTitle
              title="Expected Business Outcomes"
              subtitle="Primary value drivers from prioritized initiatives"
            />
            <View style={styles.outcomeGrid}>
              {data.businessOutcomes.map((outcome, index) => (
                <View key={outcome.title} wrap={false} style={styles.outcomeCard}>
                  <Text style={styles.outcomeIndex}>Outcome {index + 1}</Text>
                  <Text style={styles.outcomeTitle}>{outcome.title}</Text>
                  <Text style={styles.outcomeText}>{outcome.description}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {data.categorySummaries.length > 0 ? (
          <View style={styles.sectionBlock}>
            <PdfSectionTitle
              title="Technology Pillars"
              subtitle="Executive scorecard by domain — highlighted pillars include planned improvements"
            />
            <View style={styles.pillarGrid}>
              {data.categorySummaries.map((category) => (
                <PdfPillarScorecard key={category.name} category={category} />
              ))}
            </View>
          </View>
        ) : null}
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfReportHeader
          clientName={data.clientName}
          generatedDate={data.generatedDate}
          documentLabel="Technology Improvement Plan"
        />
        <PdfConfidentialFooter clientName={data.clientName} generatedDate={data.generatedDate} />

        <View style={styles.sectionBlock}>
          <PdfSectionTitle
            title="Prioritized Recommendations"
            subtitle="Initiatives ordered by business impact and implementation priority"
          />
          {data.recommendations.map((rec) => (
            <View key={rec.id} wrap={false} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <PdfPriorityBadge priority={rec.priority} />
              </View>
              <View style={styles.recMetaRow}>
                <View style={styles.recMetaBox}>
                  <Text style={styles.recMetaLabel}>Expected Outcome</Text>
                  <Text style={styles.recMetaValue}>+{rec.estimatedImpactPoints} StackScore pts</Text>
                </View>
                <View style={styles.recMetaBox}>
                  <Text style={styles.recMetaLabel}>Implementation Window</Text>
                  <Text style={styles.recMetaValue}>{getPriorityTimeline(rec.priority)}</Text>
                </View>
                <View style={styles.recMetaBox}>
                  <Text style={styles.recMetaLabel}>Category</Text>
                  <Text style={styles.recMetaValue}>{rec.categoryName}</Text>
                </View>
              </View>
              <View style={styles.recBody}>
                <Text style={styles.recFieldLabel}>Business Impact</Text>
                <Text style={styles.recFieldValue}>{rec.businessImpact}</Text>
                {rec.suggestedService ? (
                  <>
                    <Text style={[styles.recFieldLabel, { marginTop: 8 }]}>Recommended Service</Text>
                    <Text style={styles.recFieldValue}>{rec.suggestedService}</Text>
                  </>
                ) : null}
                {rec.executiveNote ? (
                  <>
                    <Text style={[styles.recFieldLabel, { marginTop: 8 }]}>Executive Note</Text>
                    <Text style={styles.recFieldValue}>{rec.executiveNote}</Text>
                  </>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfReportHeader
          clientName={data.clientName}
          generatedDate={data.generatedDate}
          documentLabel="Technology Improvement Plan"
        />
        <PdfConfidentialFooter clientName={data.clientName} generatedDate={data.generatedDate} />

        <View style={styles.sectionBlock}>
          <PdfSectionTitle
            title="Phased Implementation Roadmap"
            subtitle="Sequential delivery plan with projected profile progression and business objectives"
          />
          {data.roadmapPhases.map((phase, index) => {
            const objectives = getRoadmapPhaseObjectives(phase);
            const timeline = getRoadmapPhaseTimeline(phase);
            const isActive = index === 0;

            return (
              <View key={phase.id} wrap={false} style={styles.roadmapPhaseRow}>
                <View style={styles.roadmapRail}>
                  <View style={[styles.roadmapDot, isActive ? styles.roadmapDotActive : {}]}>
                    <Text style={isActive ? styles.roadmapDotTextActive : styles.roadmapDotText}>
                      {index + 1}
                    </Text>
                  </View>
                  {index < data.roadmapPhases.length - 1 ? <View style={styles.roadmapLine} /> : null}
                </View>
                <View style={isActive ? styles.roadmapCardActive : styles.roadmapCard}>
                  <View style={styles.roadmapHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.roadmapLabel}>{phase.label}</Text>
                      <Text style={styles.roadmapTimeline}>{timeline}</Text>
                    </View>
                    <View style={styles.roadmapScoreBlock}>
                      <Text style={styles.roadmapScore}>{phase.projectedScore}</Text>
                      <Text style={styles.roadmapDelta}>+{phase.scoreDelta} points</Text>
                    </View>
                  </View>
                  {phase.recommendations.map((rec) => (
                    <Text key={rec.id} style={styles.roadmapInitiative}>
                      • {rec.title}
                    </Text>
                  ))}
                  {objectives.length > 0 ? (
                    <View style={styles.roadmapObjectives}>
                      <Text style={styles.recFieldLabel}>Business objectives</Text>
                      {objectives.map((objective) => (
                        <Text key={objective.slice(0, 48)} style={styles.roadmapInitiative}>
                          — {objective}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap={false}>
        <PdfReportHeader
          clientName={data.clientName}
          generatedDate={data.generatedDate}
          documentLabel="Technology Improvement Plan"
        />
        <PdfConfidentialFooter clientName={data.clientName} generatedDate={data.generatedDate} />

        <View style={styles.sectionBlock}>
          <PdfSectionTitle
            title="Investment Summary"
            subtitle="Professional services and technology investment required to execute this plan"
          />
          <InvestmentTable data={data} />
        </View>

        <View wrap={false} style={styles.signatureBlock}>
          <PdfSectionTitle
            title="Approval"
            subtitle="Authorization to proceed with the initiatives outlined in this plan"
          />
          <Text style={styles.bodyText}>
            By signing below, {data.clientName} acknowledges review of this Technology Improvement
            Plan and approves the proposed initiatives and investment summarized above.
          </Text>
          <Text style={styles.signatureLine} />
          <Text style={[styles.recFieldValue, { marginBottom: 14 }]}>Authorized Signature</Text>
          <Text style={styles.signatureLine} />
          <Text style={styles.recFieldValue}>Date</Text>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap={false}>
        <PdfReportHeader
          clientName={data.clientName}
          generatedDate={data.generatedDate}
          documentLabel="Technology Improvement Plan"
        />
        <PdfConfidentialFooter clientName={data.clientName} generatedDate={data.generatedDate} />

        <PdfJourneyClosingHero
          title="Your Technology Journey"
          subtitle={`${BRAND.companyName} partners with organizations through Assess → Improve → Maintain to deliver measurable, lasting technology outcomes.`}
          activePhaseLabel={data.journeyPhaseLabel}
        />

        <View wrap={false} style={styles.closingScoreRow}>
          <View style={styles.maturityCard}>
            <Text style={styles.maturityCardLabel}>Starting StackScore</Text>
            <Text style={styles.maturityCardScore}>{data.currentScore}</Text>
            <Text style={styles.maturityCardRating}>{RATING_LABELS[currentRating]}</Text>
            <View style={styles.maturityBarTrack}>
              <View
                style={[
                  styles.maturityBarFill,
                  {
                    width: `${Math.max(0, Math.min(100, data.currentScore))}%`,
                    backgroundColor: RATING_BAR[currentRating],
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.maturityCardProjected}>
            <Text style={styles.maturityCardLabel}>Target StackScore</Text>
            <Text style={styles.maturityCardScore}>{data.projectedScore}</Text>
            <Text style={styles.maturityCardRating}>{RATING_LABELS[projectedRating]}</Text>
            <View style={styles.maturityBarTrack}>
              <View
                style={[
                  styles.maturityBarFill,
                  {
                    width: `${Math.max(0, Math.min(100, data.projectedScore))}%`,
                    backgroundColor: RATING_BAR[projectedRating],
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <Text style={[styles.bodyText, { color: COLORS.muted, marginTop: 10, textAlign: "center" }]}>
          Generated by {BRAND.productName} on {formatGeneratedDate()} · {BRAND.companyName} ·{" "}
          {BRAND.website}
        </Text>
      </Page>
    </Document>
  );
}
