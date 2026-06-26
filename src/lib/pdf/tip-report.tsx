import path from "path";
import {
  Document,
  Font,
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
  formatGeneratedDate,
  type TipReportData,
} from "@/lib/pdf/types";
import type { Priority, Rating } from "@/generated/prisma/client";

const logoPath = path.join(process.cwd(), "public", "branding", "bobkat-it-logo-navy.png");
const TARGET_SCORE = 80;

Font.registerHyphenationCallback((word) => [word]);

const COLORS = {
  navy: BRAND.primaryColor,
  navyLight: "#EEF4F8",
  slate: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  surface: BRAND.lightBackground,
  white: "#FFFFFF",
  critical: "#DC2626",
  criticalBg: "#FEF2F2",
  criticalBorder: "#FECACA",
  high: "#9A3412",
  highBg: "#FFF7ED",
  highBorder: "#FED7AA",
  medium: "#475569",
  mediumBg: "#F8FAFC",
  low: "#64748B",
  success: "#15803D",
  accent: "#7D97AC",
};

const RATING_BAR: Record<Rating, string> = {
  critical: "#DC2626",
  at_risk: "#D97706",
  stable: "#7D97AC",
  strong: "#16A34A",
  exceptional: "#082F5B",
};

const PRIORITY_BADGE: Record<
  Priority,
  { label: string; bg: string; text: string; border: string }
> = {
  critical: { label: "CRITICAL", bg: COLORS.criticalBg, text: COLORS.critical, border: COLORS.criticalBorder },
  high: { label: "HIGH", bg: COLORS.highBg, text: COLORS.high, border: COLORS.highBorder },
  medium: { label: "MEDIUM", bg: COLORS.mediumBg, text: COLORS.medium, border: COLORS.border },
  low: { label: "LOW", bg: COLORS.white, text: COLORS.low, border: COLORS.border },
};

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
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    lineHeight: 1.15,
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.88)",
    lineHeight: 1.55,
    maxWidth: 420,
  },
  coverBody: {
    paddingHorizontal: 54,
    paddingTop: 40,
    flexGrow: 1,
  },
  coverBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
  },
  coverBrandLogo: { width: 64, height: 64, objectFit: "contain" },
  coverPreparedBy: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 3,
  },
  coverFinePrint: { fontSize: 9, color: COLORS.muted, lineHeight: 1.5 },
  coverClientName: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 28,
    lineHeight: 1.25,
  },
  coverMetaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 24, marginBottom: 28 },
  coverMetaBlock: { minWidth: 140 },
  coverMetaLabel: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 4,
  },
  coverMetaValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate,
    lineHeight: 1.4,
  },
  coverConfidential: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  coverConfidentialText: {
    fontSize: 8,
    color: COLORS.muted,
    lineHeight: 1.6,
    letterSpacing: 0.2,
  },
  pageHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.navy,
    paddingHorizontal: 54,
    paddingTop: 18,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  pageHeaderLogo: { width: 28, height: 28, objectFit: "contain" },
  pageHeaderBrand: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    letterSpacing: 0.4,
  },
  pageHeaderDoc: { fontSize: 7, color: COLORS.muted, marginTop: 2 },
  pageHeaderRight: { alignItems: "flex-end" },
  pageHeaderClient: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate,
    marginBottom: 2,
  },
  pageHeaderDate: { fontSize: 7, color: COLORS.muted },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 54,
    right: 54,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  footerLeft: { fontSize: 7, color: COLORS.muted, lineHeight: 1.5, maxWidth: "42%" },
  footerCenter: { fontSize: 7, color: COLORS.muted, textAlign: "center", flex: 1 },
  footerPage: { fontSize: 7, color: COLORS.muted, textAlign: "right", minWidth: 72 },
  sectionBlock: { marginBottom: 24 },
  sectionTitleWrap: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.navy,
  },
  sectionSubtitle: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 6,
    lineHeight: 1.5,
  },
  bodyText: { fontSize: 10, lineHeight: 1.65, color: COLORS.slate, marginBottom: 10 },
  scoreRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  gaugeCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gaugeCardAccent: {
    flex: 1,
    backgroundColor: COLORS.navyLight,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.navy,
  },
  gaugeLabel: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  gaugeValue: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1,
    marginBottom: 4,
  },
  gaugeRating: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 12,
  },
  gaugeTrack: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    overflow: "hidden",
  },
  gaugeFill: { height: 10, borderRadius: 5 },
  journeyPanel: {
    backgroundColor: COLORS.navyLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  journeyTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  journeyTrack: {
    height: 12,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 8,
  },
  journeyFill: { height: 12, backgroundColor: COLORS.navy, borderRadius: 6 },
  journeyMeta: { fontSize: 9, color: COLORS.slate, lineHeight: 1.5 },
  outcomeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  outcomeCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.navy,
  },
  outcomeTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  outcomeText: { fontSize: 8, color: COLORS.slate, lineHeight: 1.55 },
  categoryCard: {
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  categoryCardHighlight: {
    borderColor: COLORS.navy,
    backgroundColor: COLORS.navyLight,
  },
  categoryTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  categoryScore: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginLeft: 8,
  },
  categoryTrack: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  categoryFill: { height: 8, borderRadius: 4 },
  categoryMeta: { fontSize: 8, color: COLORS.muted },
  recommendationCard: {
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderTopWidth: 3,
    borderTopColor: COLORS.navy,
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  recommendationTitle: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.4,
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  recMetaRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  recMetaBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recMetaLabel: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  recMetaValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.4,
  },
  recFieldLabel: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  recFieldValue: { fontSize: 9, lineHeight: 1.6, color: COLORS.slate },
  roadmapCard: {
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  roadmapCardAccent: {
    backgroundColor: COLORS.navyLight,
    borderColor: COLORS.navy,
  },
  roadmapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  roadmapLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: COLORS.navy, flex: 1 },
  roadmapScore: { fontSize: 16, fontFamily: "Helvetica-Bold", color: COLORS.navy },
  roadmapInitiative: { fontSize: 9, color: COLORS.slate, lineHeight: 1.55, marginBottom: 4 },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.navy,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  tableRowAlt: { backgroundColor: COLORS.surface },
  tableCellCategory: { width: "24%", fontSize: 9, fontFamily: "Helvetica-Bold", color: COLORS.navy },
  tableCellDesc: { width: "52%", fontSize: 9, color: COLORS.slate, paddingRight: 8, lineHeight: 1.5 },
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
    padding: 18,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 8,
    color: "rgba(255,255,255,0.75)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  totalValue: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    lineHeight: 1,
  },
  totalCaption: { fontSize: 9, color: "rgba(255,255,255,0.85)", marginTop: 8, lineHeight: 1.5 },
  signatureBlock: {
    marginTop: 8,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate,
    width: 240,
    marginTop: 32,
    marginBottom: 6,
  },
  closingHero: {
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    padding: 22,
    marginBottom: 18,
  },
  closingHeroTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    marginBottom: 6,
  },
  closingHeroSubtitle: { fontSize: 10, color: "rgba(255,255,255,0.88)", lineHeight: 1.55 },
  journeySteps: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  journeyStep: { alignItems: "center", width: "30%" },
  journeyStepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    marginBottom: 6,
  },
  journeyStepDotActive: { backgroundColor: COLORS.white },
  journeyStepLabel: { fontSize: 8, color: "rgba(255,255,255,0.9)", textAlign: "center" },
});

function ReportFooter({ clientName, generatedDate }: { clientName: string; generatedDate: string }) {
  const contact = [BRAND.email, BRAND.website].filter(Boolean).join("  ·  ");

  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerLeft}>
        Confidential — Prepared exclusively for {clientName} by {BRAND.companyName}. Unauthorized
        distribution prohibited.
      </Text>
      <Text style={styles.footerCenter}>
        {BRAND.productName} · Generated {generatedDate}
        {contact ? `\n${contact}` : ""}
      </Text>
      <Text
        style={styles.footerPage}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}

function ReportHeader({
  clientName,
  generatedDate,
}: {
  clientName: string;
  generatedDate: string;
}) {
  return (
    <View style={styles.pageHeader} fixed>
      <View style={styles.pageHeaderLeft}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={logoPath} style={styles.pageHeaderLogo} />
        <View>
          <Text style={styles.pageHeaderBrand}>
            {BRAND.companyName} · {BRAND.productName}
          </Text>
          <Text style={styles.pageHeaderDoc}>Technology Improvement Plan</Text>
        </View>
      </View>
      <View style={styles.pageHeaderRight}>
        <Text style={styles.pageHeaderClient}>{clientName}</Text>
        <Text style={styles.pageHeaderDate}>Prepared {generatedDate}</Text>
      </View>
    </View>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View wrap={false} style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const badge = PRIORITY_BADGE[priority];
  return (
    <Text
      style={[
        styles.priorityBadge,
        { backgroundColor: badge.bg, color: badge.text, borderColor: badge.border },
      ]}
    >
      {badge.label}
    </Text>
  );
}

function ScoreGauge({
  score,
  label,
  ratingLabel,
  variant = "default",
}: {
  score: number;
  label: string;
  ratingLabel: string;
  variant?: "default" | "accent";
}) {
  const rating = getRating(score);
  const width = `${Math.max(0, Math.min(100, Math.round(score)))}%`;

  return (
    <View wrap={false} style={variant === "accent" ? styles.gaugeCardAccent : styles.gaugeCard}>
      <Text style={styles.gaugeLabel}>{label}</Text>
      <Text style={styles.gaugeValue}>{score}</Text>
      <Text style={styles.gaugeRating}>{ratingLabel}</Text>
      <View style={styles.gaugeTrack}>
        <View style={[styles.gaugeFill, { width, backgroundColor: RATING_BAR[rating] }]} />
      </View>
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
    `This Technology Improvement Plan presents a prioritized path for ${data.clientName} to strengthen technology resilience, reduce operational risk, and advance business outcomes. Based on the current StackScore of ${data.currentScore}, implementing the initiatives below is projected to reach a StackScore of ${data.projectedScore}.`;

  const journeyWidth = `${Math.max(0, Math.min(100, data.journeyProgressPercent))}%`;

  return (
    <Document
      title={`${data.clientName} — Technology Improvement Plan`}
      author={BRAND.companyName}
      subject="Technology Improvement Plan"
    >
      {/* Cover */}
      <Page size="LETTER" style={styles.coverPage} wrap={false}>
        <ReportFooter clientName={data.clientName} generatedDate={data.generatedDate} />

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
            <Image src={logoPath} style={styles.coverBrandLogo} />
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

      {/* Executive overview */}
      <Page size="LETTER" style={styles.page} wrap>
        <ReportHeader clientName={data.clientName} generatedDate={data.generatedDate} />
        <ReportFooter clientName={data.clientName} generatedDate={data.generatedDate} />

        <View style={styles.sectionBlock}>
          <SectionTitle
            title="Executive Summary"
            subtitle="Business context, profile trajectory, and expected outcomes"
          />
          <Text style={styles.bodyText}>{executiveText}</Text>
        </View>

        <View wrap={false} style={styles.scoreRow}>
          <ScoreGauge
            score={data.currentScore}
            label="Technology Profile — Today"
            ratingLabel={RATING_LABELS[currentRating]}
          />
          <ScoreGauge
            score={data.projectedScore}
            label="Technology Profile — Projected"
            ratingLabel={RATING_LABELS[projectedRating]}
            variant="accent"
          />
        </View>

        <View wrap={false} style={styles.journeyPanel}>
          <Text style={styles.journeyTitle}>Technology Journey — {data.journeyPhaseLabel} Phase</Text>
          <View style={styles.journeyTrack}>
            <View style={[styles.journeyFill, { width: journeyWidth }]} />
          </View>
          <Text style={styles.journeyMeta}>
            Journey progress: {data.journeyProgressPercent}% · Projected StackScore improvement: +
            {data.scoreImprovement} points · Maturity target: {TARGET_SCORE}+
          </Text>
        </View>

        {data.businessOutcomes.length > 0 ? (
          <View style={styles.sectionBlock}>
            <SectionTitle
              title="Expected Business Outcomes"
              subtitle="Primary value drivers from prioritized initiatives"
            />
            <View style={styles.outcomeGrid}>
              {data.businessOutcomes.map((outcome) => (
                <View key={outcome.title} wrap={false} style={styles.outcomeCard}>
                  <Text style={styles.outcomeTitle}>{outcome.title}</Text>
                  <Text style={styles.outcomeText}>{outcome.description}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {data.categorySummaries.length > 0 ? (
          <View style={styles.sectionBlock}>
            <SectionTitle
              title="Category Profile Summary"
              subtitle="Current maturity by domain — highlighted categories include planned improvements"
            />
            {data.categorySummaries.map((category) => {
              const rating = getRating(category.score);
              const fillWidth = `${Math.max(0, Math.min(100, category.score))}%`;
              return (
                <View
                  key={category.name}
                  wrap={false}
                  style={[
                    styles.categoryCard,
                    category.hasRecommendations ? styles.categoryCardHighlight : {},
                  ]}
                >
                  <View style={styles.categoryTitleRow}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryScore}>{category.score}%</Text>
                  </View>
                  <View style={styles.categoryTrack}>
                    <View
                      style={[
                        styles.categoryFill,
                        { width: fillWidth, backgroundColor: RATING_BAR[rating] },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryMeta}>
                    {category.ratingLabel}
                    {category.hasRecommendations ? " · Improvement planned" : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </Page>

      {/* Recommendations */}
      <Page size="LETTER" style={styles.page} wrap>
        <ReportHeader clientName={data.clientName} generatedDate={data.generatedDate} />
        <ReportFooter clientName={data.clientName} generatedDate={data.generatedDate} />

        <View style={styles.sectionBlock}>
          <SectionTitle
            title="Prioritized Recommendations"
            subtitle="Initiatives ordered by business impact and implementation priority"
          />
          {data.recommendations.map((rec) => (
            <View key={rec.id} wrap={false} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <PriorityBadge priority={rec.priority} />
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
              <View style={{ marginBottom: rec.suggestedService ? 10 : 0 }}>
                <Text style={styles.recFieldLabel}>Business Impact</Text>
                <Text style={styles.recFieldValue}>{rec.businessImpact}</Text>
              </View>
              {rec.suggestedService ? (
                <View style={{ marginBottom: rec.executiveNote ? 10 : 0 }}>
                  <Text style={styles.recFieldLabel}>Recommended Service</Text>
                  <Text style={styles.recFieldValue}>{rec.suggestedService}</Text>
                </View>
              ) : null}
              {rec.executiveNote ? (
                <View>
                  <Text style={styles.recFieldLabel}>Executive Note</Text>
                  <Text style={styles.recFieldValue}>{rec.executiveNote}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </Page>

      {/* Roadmap */}
      <Page size="LETTER" style={styles.page} wrap>
        <ReportHeader clientName={data.clientName} generatedDate={data.generatedDate} />
        <ReportFooter clientName={data.clientName} generatedDate={data.generatedDate} />

        <View style={styles.sectionBlock}>
          <SectionTitle
            title="Phased Implementation Roadmap"
            subtitle="Sequential delivery plan with projected profile progression"
          />
          {data.roadmapPhases.map((phase, index) => (
            <View
              key={phase.id}
              wrap={false}
              style={[styles.roadmapCard, index === 0 ? styles.roadmapCardAccent : {}]}
            >
              <View style={styles.roadmapHeader}>
                <Text style={styles.roadmapLabel}>{phase.label}</Text>
                <Text style={styles.roadmapScore}>{phase.projectedScore}</Text>
              </View>
              <Text style={[styles.recFieldLabel, { marginBottom: 6 }]}>
                Projected improvement: +{phase.scoreDelta} points
              </Text>
              {phase.recommendations.map((rec) => (
                <Text key={rec.id} style={styles.roadmapInitiative}>
                  • {rec.title}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>

      {/* Investment + approval */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <ReportHeader clientName={data.clientName} generatedDate={data.generatedDate} />
        <ReportFooter clientName={data.clientName} generatedDate={data.generatedDate} />

        <View style={styles.sectionBlock}>
          <SectionTitle
            title="Investment Summary"
            subtitle="Professional services and technology investment required to execute this plan"
          />
          <InvestmentTable data={data} />
        </View>

        <View wrap={false} style={styles.signatureBlock}>
          <SectionTitle
            title="Approval"
            subtitle="Authorization to proceed with the initiatives outlined in this plan"
          />
          <Text style={styles.bodyText}>
            By signing below, {data.clientName} acknowledges review of this Technology Improvement
            Plan and approves the proposed initiatives and investment summarized above.
          </Text>
          <Text style={styles.signatureLine} />
          <Text style={[styles.recFieldValue, { marginBottom: 16 }]}>Authorized Signature</Text>
          <Text style={styles.signatureLine} />
          <Text style={styles.recFieldValue}>Date</Text>
        </View>
      </Page>

      {/* Technology Journey closing */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <ReportHeader clientName={data.clientName} generatedDate={data.generatedDate} />
        <ReportFooter clientName={data.clientName} generatedDate={data.generatedDate} />

        <View style={styles.closingHero}>
          <Text style={styles.closingHeroTitle}>Your Technology Journey</Text>
          <Text style={styles.closingHeroSubtitle}>
            {BRAND.companyName} partners with organizations through Assess → Improve → Maintain to
            deliver measurable, lasting technology outcomes.
          </Text>
          <View style={styles.journeySteps}>
            {(["Assess", "Improve", "Maintain"] as const).map((step) => (
              <View key={step} style={styles.journeyStep}>
                <View
                  style={[
                    styles.journeyStepDot,
                    data.journeyPhaseLabel.toLowerCase().startsWith(step.toLowerCase().slice(0, 4))
                      ? styles.journeyStepDotActive
                      : {},
                  ]}
                />
                <Text style={styles.journeyStepLabel}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View wrap={false} style={styles.scoreRow}>
          <ScoreGauge
            score={data.currentScore}
            label="Starting StackScore"
            ratingLabel={RATING_LABELS[currentRating]}
          />
          <ScoreGauge
            score={data.projectedScore}
            label="Target StackScore"
            ratingLabel={RATING_LABELS[projectedRating]}
            variant="accent"
          />
        </View>

        <Text style={[styles.bodyText, { color: COLORS.muted, marginTop: 8 }]}>
          Generated by {BRAND.productName} on {formatGeneratedDate()} · {BRAND.companyName} ·{" "}
          {BRAND.website}
        </Text>
      </Page>
    </Document>
  );
}
