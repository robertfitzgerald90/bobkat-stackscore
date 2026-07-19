import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { getRating, RATING_LABELS } from "@/lib/scoring";
import {
  buildApprovalIntro,
  buildPhaseCompletionOutcomes,
  buildPhaseExecutiveNarrative,
  buildPhaseOutcomeBullets,
  buildTipExecutiveFallback,
  findRecommendationForInitiative,
  getPhasePriorityLabel,
  getRoadmapOverviewMetrics,
  isPhaseRecurringCoveredByRetainer,
  ROADMAP_NEXT_STEPS,
  TIP_MATURITY_TARGET,
} from "@/lib/reports/tip-presentation";
import type { RoadmapPhaseResult } from "@/lib/technology-improvement-plan/roadmap-engine";
import {
  COLORS,
  PDF_SCORE_BAR,
  PdfCoverPage,
  PdfReportFooter,
  PdfReportHeader,
  PdfJourneyClosingHero,
  PdfSectionTitle,
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
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.successBg,
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
  journeyFill: { height: 10, backgroundColor: COLORS.accent, borderRadius: 5 },
  journeyMeta: { fontSize: 8, color: COLORS.muted, lineHeight: 1.5 },
  pillarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
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
  overviewNode: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    padding: 12,
    marginBottom: 4,
  },
  overviewNodeStart: {
    borderWidth: 1,
    borderColor: COLORS.navy,
    borderRadius: 8,
    backgroundColor: COLORS.navyLight,
    padding: 12,
    marginBottom: 4,
  },
  overviewArrow: {
    fontSize: 10,
    color: COLORS.muted,
    textAlign: "center",
    marginVertical: 2,
  },
  overviewLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  overviewTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  overviewMeta: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 3,
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  metricCard: {
    width: "18%",
    minWidth: 90,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    padding: 10,
  },
  metricCardEmphasis: {
    width: "18%",
    minWidth: 90,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: COLORS.navy,
    borderRadius: 8,
    backgroundColor: COLORS.navyLight,
    padding: 10,
  },
  metricLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  phaseCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    padding: 14,
    marginBottom: 16,
  },
  phaseSubtitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 3,
  },
  phaseTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 10,
  },
  phaseMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  phaseMetaBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    padding: 8,
  },
  phaseMetaBoxEmphasis: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(5,150,105,0.35)",
    borderRadius: 6,
    backgroundColor: COLORS.successBg,
    padding: 8,
  },
  phaseMetaLabel: {
    fontSize: 6,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  phaseMetaValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.35,
  },
  phaseBlockLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 6,
    marginTop: 10,
  },
  checklistItem: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
    alignItems: "flex-start",
  },
  checkMark: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.success,
    width: 10,
  },
  checklistText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.slate,
  },
  initiativeCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    padding: 10,
    marginBottom: 8,
  },
  initiativeTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 4,
  },
  initiativeDesc: {
    fontSize: 8,
    color: COLORS.muted,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  initiativeBenefit: {
    fontSize: 8,
    color: COLORS.slate,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  initiativeImpact: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.success,
  },
  investmentRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  investmentCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  investmentLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  investmentValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  investmentSuffix: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLORS.muted,
  },
  retainerText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.4,
  },
  completionBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalPanel: {
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  totalPanelSecondary: {
    backgroundColor: "#0a3d75",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 7,
    color: "rgba(255,255,255,0.72)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  totalValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    lineHeight: 1,
  },
  totalCaption: {
    fontSize: 8,
    color: "rgba(255,255,255,0.85)",
    marginTop: 8,
    lineHeight: 1.5,
  },
  nextStepRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    backgroundColor: COLORS.white,
  },
  nextStepIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.navy,
    color: COLORS.white,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingTop: 3,
  },
  nextStepLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 2,
  },
  nextStepDesc: {
    fontSize: 8,
    color: COLORS.muted,
    lineHeight: 1.45,
  },
  approvalPhaseRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    padding: 10,
    marginBottom: 8,
  },
  approvalCheckbox: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: COLORS.navy,
    borderRadius: 2,
    marginTop: 2,
  },
  approvalPhaseTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 2,
  },
  approvalPhaseMeta: {
    fontSize: 7,
    color: COLORS.muted,
    marginBottom: 6,
  },
  approvalSignLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate,
    width: 140,
    marginTop: 4,
    marginBottom: 2,
  },
  signatureBlock: {
    marginTop: 6,
    paddingTop: 12,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate,
    width: 220,
    marginTop: 24,
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 9,
    color: COLORS.muted,
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
                { width: currentWidth, backgroundColor: PDF_SCORE_BAR.current },
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
                { width: projectedWidth, backgroundColor: PDF_SCORE_BAR.improvement },
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
          Journey progress: {data.journeyProgressPercent}% · Available improvement: +
          {data.scoreImprovement} points · Maturity target: {TIP_MATURITY_TARGET}+
        </Text>
      </View>
    </View>
  );
}

function PdfPillarScorecard({ category }: { category: TipCategorySummary }) {
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
          style={[styles.pillarFill, { width: fillWidth, backgroundColor: PDF_SCORE_BAR.current }]}
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

function PdfRoadmapOverview({ data }: { data: TipReportData }) {
  const roadmap = data.technologyRoadmap;
  const metrics = getRoadmapOverviewMetrics(
    data.currentScore,
    roadmap,
    data.recommendations,
  );

  return (
    <View>
      <View wrap={false} style={styles.overviewNodeStart}>
        <Text style={styles.overviewLabel}>Starting Point</Text>
        <Text style={styles.overviewTitle}>Assessment Complete</Text>
      </View>
      {roadmap.phases.map((phase) => (
        <View key={phase.id} wrap={false}>
          <Text style={styles.overviewArrow}>↓</Text>
          <View style={styles.overviewNode}>
            <Text style={styles.overviewLabel}>{phase.subtitle}</Text>
            <Text style={styles.overviewTitle}>{phase.name}</Text>
            <Text style={styles.overviewMeta}>{phase.timeline}</Text>
          </View>
        </View>
      ))}
      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Current StackScore</Text>
          <Text style={styles.metricValue}>{metrics.currentScore}</Text>
        </View>
        <View style={styles.metricCardEmphasis}>
          <Text style={styles.metricLabel}>Projected StackScore</Text>
          <Text style={styles.metricValue}>{metrics.projectedScore}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Available Improvement</Text>
          <Text style={styles.metricValue}>+{metrics.scoreImprovement}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Initiatives</Text>
          <Text style={styles.metricValue}>{metrics.initiativeCount}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Phases</Text>
          <Text style={styles.metricValue}>{metrics.phaseCount}</Text>
        </View>
      </View>
    </View>
  );
}

function PdfPhaseSection({
  data,
  phase,
}: {
  data: TipReportData;
  phase: RoadmapPhaseResult;
}) {
  const outcomes = buildPhaseOutcomeBullets(phase);
  const completionOutcomes = buildPhaseCompletionOutcomes(phase);
  const coveredByRetainer = isPhaseRecurringCoveredByRetainer(phase, data.recommendations);
  const showMonthly = phase.monthlyRecurringInvestment > 0;

  return (
    <View style={styles.phaseCard} wrap={false}>
      <Text style={styles.phaseSubtitle}>{phase.subtitle}</Text>
      <Text style={styles.phaseTitle}>{phase.name}</Text>

      <View style={styles.phaseMetaRow}>
        <View style={styles.phaseMetaBox}>
          <Text style={styles.phaseMetaLabel}>Timeline</Text>
          <Text style={styles.phaseMetaValue}>{phase.timeline}</Text>
        </View>
        <View style={styles.phaseMetaBox}>
          <Text style={styles.phaseMetaLabel}>Priority</Text>
          <Text style={styles.phaseMetaValue}>{getPhasePriorityLabel(phase)}</Text>
        </View>
        <View style={styles.phaseMetaBoxEmphasis}>
          <Text style={styles.phaseMetaLabel}>Expected StackScore Improvement</Text>
          <Text style={styles.phaseMetaValue}>+{phase.stackScoreImprovement} Points</Text>
        </View>
      </View>

      <Text style={styles.phaseBlockLabel}>Executive Summary</Text>
      <Text style={styles.bodyText}>{buildPhaseExecutiveNarrative(phase)}</Text>

      {outcomes.length > 0 ? (
        <>
          <Text style={styles.phaseBlockLabel}>Business Outcomes</Text>
          {outcomes.map((outcome) => (
            <View key={outcome} style={styles.checklistItem}>
              <Text style={styles.checkMark}>✓</Text>
              <Text style={styles.checklistText}>{outcome}</Text>
            </View>
          ))}
        </>
      ) : null}

      <Text style={styles.phaseBlockLabel}>Included Initiatives</Text>
      {phase.initiatives.map((initiative) => {
        const recommendation = findRecommendationForInitiative(
          data.recommendations,
          initiative.recommendationId,
        );
        return (
          <View key={initiative.recommendationId} style={styles.initiativeCard} wrap={false}>
            <Text style={styles.initiativeTitle}>{initiative.title}</Text>
            {recommendation?.description ? (
              <Text style={styles.initiativeDesc}>{recommendation.description}</Text>
            ) : null}
            {recommendation?.businessImpact ? (
              <Text style={styles.initiativeBenefit}>
                Business benefit: {recommendation.businessImpact}
              </Text>
            ) : null}
            <Text style={styles.initiativeImpact}>
              Estimated StackScore contribution: +
              {recommendation?.estimatedImpactPoints ?? 0} points
            </Text>
          </View>
        );
      })}

      <Text style={styles.phaseBlockLabel}>Investment Summary</Text>
      <View style={styles.investmentRow} wrap={false}>
        <View style={styles.investmentCard}>
          <Text style={styles.investmentLabel}>One-Time Implementation Investment</Text>
          <Text style={styles.investmentValue}>
            {formatCurrency(phase.oneTimeInvestment)}
          </Text>
        </View>
        {showMonthly ? (
          <View style={styles.investmentCard}>
            <Text style={styles.investmentLabel}>New Monthly Recurring Investment</Text>
            {coveredByRetainer ? (
              <Text style={styles.retainerText}>
                Included in Strategic IT Consulting Retainer
              </Text>
            ) : (
              <Text style={styles.investmentValue}>
                {formatCurrency(phase.monthlyRecurringInvestment)}
                <Text style={styles.investmentSuffix}>/month</Text>
              </Text>
            )}
          </View>
        ) : null}
      </View>

      <View style={styles.completionBox} wrap={false}>
        <Text style={styles.phaseBlockLabel}>Phase Completion Outcome</Text>
        <Text style={styles.bodyText}>
          Upon completion of this phase your organization will have:
        </Text>
        {completionOutcomes.map((outcome) => (
          <View key={outcome} style={styles.checklistItem}>
            <Text style={styles.checkMark}>✓</Text>
            <Text style={styles.checklistText}>{outcome}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PdfOverallInvestment({ data }: { data: TipReportData }) {
  return (
    <View wrap={false}>
      <View style={styles.totalPanel}>
        <Text style={styles.totalLabel}>Total One-Time Implementation Investment</Text>
        <Text style={styles.totalValue}>
          {formatCurrency(data.oneTimeInvestmentTotal)}
        </Text>
        <Text style={styles.totalCaption}>
          Project delivery, professional services, and technology required to execute approved
          phases.
        </Text>
      </View>
      {data.monthlyRecurringTotal > 0 ? (
        <View style={styles.totalPanelSecondary}>
          <Text style={styles.totalLabel}>Total New Monthly Recurring Investment</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(data.monthlyRecurringTotal)}
            <Text style={styles.investmentSuffix}> /month</Text>
          </Text>
          <Text style={styles.totalCaption}>
            Ongoing services introduced by the roadmap. One-time and recurring investments are
            never combined into a single figure.
          </Text>
        </View>
      ) : null}
      {data.annualRecurringTotal > 0 ? (
        <View style={styles.totalPanelSecondary}>
          <Text style={styles.totalLabel}>Total Annual Recurring Investment</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(data.annualRecurringTotal)}
            <Text style={styles.investmentSuffix}> /year</Text>
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function PdfPageChrome({ data }: { data: TipReportData }) {
  return (
    <>
      <PdfReportHeader
        clientName={data.clientName}
        generatedDate={data.generatedDate}
        documentLabel="Technology Improvement Plan"
      />
      <PdfReportFooter
        generatedDate={data.generatedDate}
        clientName={data.clientName}
        documentVersion={String(data.version)}
      />
    </>
  );
}

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
      <Page size="LETTER" style={styles.coverPage} wrap={false}>
        <PdfReportFooter
          generatedDate={data.generatedDate}
          clientName={data.clientName}
          documentVersion={String(data.version)}
        />
        <PdfCoverPage
          eyebrow={`Generated by ${BRAND.productName}`}
          title="Technology Improvement Plan"
          subtitle="A phased technology roadmap developed by your Virtual CIO — approve and implement one phase at a time"
          clientName={data.clientName}
          meta={[
            { label: "Document Version", value: `v${data.version}` },
            { label: "Prepared Date", value: data.generatedDate },
            ...(data.assessmentName
              ? [{ label: "Based On Assessment", value: data.assessmentName }]
              : []),
            ...(data.maturityTierLabel
              ? [{ label: "Current Maturity", value: data.maturityTierLabel }]
              : []),
          ]}
          confidentialNotice="Confidential — proprietary analysis for authorized recipients only"
        />
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfPageChrome data={data} />

        <View style={styles.sectionBlock}>
          <PdfSectionTitle
            title="Executive Summary"
            subtitle="Strategic context for a phased technology roadmap"
          />
          <Text style={styles.bodyText}>{executiveText}</Text>
        </View>

        <View style={styles.sectionBlock}>
          <PdfSectionTitle
            title="Current Technology Maturity"
            subtitle="Where the organization stands today and the improvement trajectory ahead"
          />
          <PdfMaturityHero data={data} />
          {data.categorySummaries.length > 0 ? (
            <View style={styles.pillarGrid}>
              {data.categorySummaries.map((category) => (
                <PdfPillarScorecard key={category.name} category={category} />
              ))}
            </View>
          ) : null}
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfPageChrome data={data} />
        <View style={styles.sectionBlock}>
          <PdfSectionTitle
            title="Technology Roadmap Overview"
            subtitle="A sequenced journey from assessment through strategic enhancement"
          />
          <PdfRoadmapOverview data={data} />
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfPageChrome data={data} />
        <View style={styles.sectionBlock}>
          <PdfSectionTitle
            title="Implementation Phases"
            subtitle="Each phase is designed for independent approval and incremental delivery"
          />
          {phases.map((phase) => (
            <PdfPhaseSection key={phase.id} data={data} phase={phase} />
          ))}
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfPageChrome data={data} />

        <View style={styles.sectionBlock}>
          <PdfSectionTitle
            title="Overall Investment Summary"
            subtitle="One-time implementation and recurring services are presented separately"
          />
          <PdfOverallInvestment data={data} />
        </View>

        <View style={styles.sectionBlock}>
          <PdfSectionTitle
            title="Next Steps"
            subtitle="Implementation is incremental — approve and deliver one phase at a time"
          />
          {ROADMAP_NEXT_STEPS.map((step, index) => (
            <View key={step.label} style={styles.nextStepRow} wrap={false}>
              <Text style={styles.nextStepIndex}>{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextStepLabel}>{step.label}</Text>
                <Text style={styles.nextStepDesc}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View wrap={false} style={styles.signatureBlock}>
          <PdfSectionTitle
            title="Approval"
            subtitle="Phases may be approved independently as priorities and budget allow"
          />
          <Text style={styles.bodyText}>{buildApprovalIntro(data.clientName)}</Text>
          {phases.map((phase) => (
            <View key={phase.id} style={styles.approvalPhaseRow} wrap={false}>
              <View style={styles.approvalCheckbox} />
              <View style={{ flex: 1 }}>
                <Text style={styles.approvalPhaseTitle}>
                  {phase.subtitle} — {phase.name}
                </Text>
                <Text style={styles.approvalPhaseMeta}>
                  Timeline {phase.timeline} · One-time {formatCurrency(phase.oneTimeInvestment)}
                  {phase.monthlyRecurringInvestment > 0
                    ? ` · Monthly ${formatCurrency(phase.monthlyRecurringInvestment)}`
                    : ""}
                </Text>
                <View style={styles.approvalSignLine} />
                <Text style={styles.signatureLabel}>Phase signature / date</Text>
              </View>
            </View>
          ))}
          <Text style={styles.signatureLine} />
          <Text style={[styles.signatureLabel, { marginBottom: 14 }]}>Authorized Signature</Text>
          <Text style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Date</Text>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap={false}>
        <PdfPageChrome data={data} />
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
                    backgroundColor: PDF_SCORE_BAR.current,
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
                    backgroundColor: PDF_SCORE_BAR.improvement,
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
