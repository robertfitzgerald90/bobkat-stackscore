import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatAssessmentType } from "@/lib/assessments/display";
import type { RecommendationSummary } from "@/lib/assessments/results-summary";
import { BRAND } from "@/lib/branding";
import {
  COLORS,
  PDF_RATING_BAR as RATING_BAR,
  PDF_TARGET_SCORE as TARGET_SCORE,
  PdfBulletSection,
  PdfClosingHero,
  PdfFlowSection,
  PdfMiniScoreBar,
  PdfPageFooter,
  PdfPriorityBadge,
  PdfScoreGauge,
  getPdfLogoPath,
  PDF_LAYOUT,
  registerPdfFonts,
} from "@/lib/pdf/shared";
import {
  computeRoadmapScores,
  countByPriority,
  getRating,
  sortRecommendationsForDisplay,
} from "@/lib/pdf/report-helpers";
import {
  formatGeneratedDate,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  type AssessmentReportData,
} from "@/lib/pdf/types";
import { RATING_LABELS } from "@/lib/scoring";
import type { Priority, Rating } from "@/generated/prisma/client";

registerPdfFonts();

const styles = StyleSheet.create({
  page: {
    paddingTop: PDF_LAYOUT.paddingTop,
    paddingBottom: PDF_LAYOUT.paddingBottom,
    paddingHorizontal: PDF_LAYOUT.paddingHorizontal,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.slate,
    backgroundColor: "#FFFFFF",
  },
  coverPage: {
    paddingTop: 0,
    paddingBottom: PDF_LAYOUT.paddingBottom,
    paddingHorizontal: 0,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.slate,
    backgroundColor: "#FFFFFF",
  },
  coverHero: {
    backgroundColor: COLORS.navy,
    paddingTop: 52,
    paddingBottom: 40,
    paddingHorizontal: 54,
  },
  coverBody: {
    paddingHorizontal: 54,
    paddingTop: 36,
    flexGrow: 1,
  },
  coverBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },
  coverBrandLogo: {
    width: 56,
    height: 56,
    objectFit: "contain",
  },
  coverPreparedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  coverPreparedLogo: {
    width: 40,
    height: 40,
    objectFit: "contain",
  },
  coverProduct: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  coverSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  coverClientName: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 22,
    lineHeight: 1.3,
  },
  coverMetaBlock: { marginBottom: 12 },
  coverMetaLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  coverMetaValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate,
    lineHeight: 1.4,
  },
  coverPreparedBy: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.4,
  },
  coverFinePrint: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 4,
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 54,
    right: 54,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 8,
    color: COLORS.muted,
  },
  footerCenter: { fontSize: 8, color: COLORS.muted, textAlign: "center" },
  sectionBlock: { marginBottom: 22 },
  sectionTitleWrap: { marginBottom: 14, marginTop: 4 },
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
  bodyText: {
    fontSize: 10,
    lineHeight: 1.65,
    color: COLORS.slate,
    marginBottom: 10,
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 16,
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  scoreRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  gaugeCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gaugeCardAccent: {
    flex: 1,
    backgroundColor: "#EEF4F8",
    borderRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.navy,
  },
  gaugeLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  gaugeValue: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1,
    marginBottom: 4,
  },
  gaugeRating: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 10,
  },
  gaugeTrack: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    position: "relative",
    overflow: "hidden",
  },
  gaugeFill: { height: 10, borderRadius: 5 },
  targetLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.target,
    opacity: 0.65,
  },
  targetCaption: {
    fontSize: 7,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: "right",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  summaryStat: {
    width: "48%",
    minHeight: 54,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
  },
  summaryStatValue: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 3,
  },
  summaryStatLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  indexGroupTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginTop: 10,
    marginBottom: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryListItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryListIndex: {
    width: 16,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
  },
  summaryListTitle: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.slate,
  },
  summaryListImpact: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    minWidth: 28,
    textAlign: "right",
  },
  roadmapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  roadmapRowHighlight: {
    backgroundColor: "#EEF4F8",
    borderColor: COLORS.navy,
  },
  roadmapLabel: { flex: 1, fontSize: 10, fontFamily: "Helvetica-Bold", color: COLORS.slate },
  roadmapScore: { fontSize: 18, fontFamily: "Helvetica-Bold", color: COLORS.navy, minWidth: 36 },
  roadmapBarWrap: { width: 120 },
  bulletSection: { marginBottom: 14 },
  bulletHeading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 6,
  },
  bulletItem: {
    fontSize: 9,
    lineHeight: 1.55,
    color: COLORS.slate,
    marginBottom: 4,
    paddingLeft: 10,
  },
  categoryCard: {
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    flexDirection: "column",
  },
  categoryTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
    width: "100%",
  },
  categoryName: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.45,
    paddingRight: 4,
  },
  categoryPercent: {
    flexShrink: 0,
    width: 44,
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.2,
    textAlign: "right",
  },
  categoryProgressWrap: {
    width: "100%",
    marginBottom: 10,
  },
  categoryRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  categoryRatingLabel: {
    fontSize: 9,
    color: COLORS.muted,
    lineHeight: 1.4,
  },
  categoryRatingValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.4,
  },
  progressTrack: {
    height: 10,
    width: "100%",
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: { height: 10, borderRadius: 5 },
  priorityGroup: { marginBottom: 18 },
  priorityGroupTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recommendationCard: {
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  recommendationTitle: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.45,
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
  recommendationField: { marginBottom: 8 },
  recommendationFieldLabel: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  recommendationFieldValue: { fontSize: 9, lineHeight: 1.55, color: COLORS.slate },
  recommendationImpact: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.45,
  },
  closingHero: {
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    padding: 20,
    marginBottom: 18,
  },
  closingHeroTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  closingHeroSubtitle: {
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 1.5,
  },
  closingStatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  closingStat: {
    width: "48%",
    minHeight: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 14,
    backgroundColor: COLORS.surface,
  },
  closingStatValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 4,
  },
  closingStatLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ctaBox: {
    padding: 18,
    backgroundColor: "#EEF4F8",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.navy,
  },
  ctaTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 8,
  },
  ctaButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.navy,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  ctaButtonText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  warningBox: {
    backgroundColor: COLORS.criticalBg,
    borderWidth: 1,
    borderColor: COLORS.criticalBorder,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.critical,
    marginBottom: 4,
  },
  warningText: { fontSize: 9, color: "#7F1D1D", lineHeight: 1.55 },
});

function CategoryScoreCard({
  categoryName,
  percentScore,
  rating,
}: {
  categoryName: string;
  percentScore: number;
  rating: Rating;
}) {
  const roundedScore = Math.round(percentScore);
  const fillWidth = `${Math.max(0, Math.min(100, roundedScore))}%`;

  return (
    <View wrap={false} style={styles.categoryCard}>
      <View style={styles.categoryTitleRow}>
        <Text style={styles.categoryName}>{categoryName}</Text>
        <Text style={styles.categoryPercent}>{roundedScore}%</Text>
      </View>

      <View style={styles.categoryProgressWrap}>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: fillWidth, backgroundColor: RATING_BAR[rating] }]}
          />
        </View>
      </View>

      <View style={styles.categoryRatingRow}>
        <Text style={styles.categoryRatingLabel}>Rating:</Text>
        <Text style={styles.categoryRatingValue}>{RATING_LABELS[rating]}</Text>
      </View>
    </View>
  );
}

function RecommendationCard({
  priority,
  title,
  estimatedImpactPoints,
  suggestedService,
  businessImpact,
  categoryName,
}: {
  priority: Priority;
  title: string;
  estimatedImpactPoints: number;
  suggestedService: string | null;
  businessImpact: string;
  categoryName: string;
}) {
  return (
    <View wrap={false} style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationTitle}>{title}</Text>
        <PdfPriorityBadge priority={priority} />
      </View>
      <View style={styles.recommendationField}>
        <Text style={styles.recommendationFieldLabel}>Potential Score Impact</Text>
        <Text style={styles.recommendationImpact}>+{estimatedImpactPoints} points</Text>
      </View>
      {suggestedService ? (
        <View style={styles.recommendationField}>
          <Text style={styles.recommendationFieldLabel}>Recommended Service</Text>
          <Text style={styles.recommendationFieldValue}>{suggestedService}</Text>
        </View>
      ) : null}
      <View style={styles.recommendationField}>
        <Text style={styles.recommendationFieldLabel}>Business Impact</Text>
        <Text style={styles.recommendationFieldValue}>{businessImpact}</Text>
      </View>
      <View style={{ marginBottom: 0 }}>
        <Text style={styles.recommendationFieldLabel}>Category</Text>
        <Text style={styles.recommendationFieldValue}>{categoryName}</Text>
      </View>
    </View>
  );
}

function RecommendationIndex({
  sortedRecommendations,
}: {
  sortedRecommendations: RecommendationSummary[];
}) {
  let index = 0;

  return (
    <>
      {PRIORITY_ORDER.map((priority) => {
        const group = sortedRecommendations.filter(
          (recommendation) => recommendation.priority === priority,
        );
        if (group.length === 0) return null;

        const [first, ...rest] = group;

        return (
          <View key={priority}>
            <View wrap={false}>
              <Text style={styles.indexGroupTitle}>
                {PRIORITY_LABELS[priority]} ({group.length})
              </Text>
              {(() => {
                index += 1;
                return (
                  <View style={styles.summaryListItem}>
                    <Text style={styles.summaryListIndex}>{index}.</Text>
                    <Text style={styles.summaryListTitle}>{first.title}</Text>
                    <Text style={styles.summaryListImpact}>+{first.estimatedImpactPoints}</Text>
                  </View>
                );
              })()}
            </View>
            {rest.map((recommendation) => {
              index += 1;
              return (
                <View key={recommendation.id} wrap={false} style={styles.summaryListItem}>
                  <Text style={styles.summaryListIndex}>{index}.</Text>
                  <Text style={styles.summaryListTitle}>{recommendation.title}</Text>
                  <Text style={styles.summaryListImpact}>
                    +{recommendation.estimatedImpactPoints}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </>
  );
}

function PriorityRecommendationGroup({
  label,
  items,
}: {
  label: string;
  items: RecommendationSummary[];
}) {
  const [first, ...rest] = items;
  if (!first) return null;

  return (
    <View style={styles.priorityGroup}>
      <View wrap={false}>
        <Text style={styles.priorityGroupTitle}>{label}</Text>
        <RecommendationCard
          priority={first.priority}
          title={first.title}
          estimatedImpactPoints={first.estimatedImpactPoints}
          suggestedService={first.suggestedService}
          businessImpact={first.businessImpact}
          categoryName={first.categoryName}
        />
      </View>
      {rest.map((recommendation) => (
        <RecommendationCard
          key={recommendation.id}
          priority={recommendation.priority}
          title={recommendation.title}
          estimatedImpactPoints={recommendation.estimatedImpactPoints}
          suggestedService={recommendation.suggestedService}
          businessImpact={recommendation.businessImpact}
          categoryName={recommendation.categoryName}
        />
      ))}
    </View>
  );
}

type AssessmentReportDocumentProps = {
  data: AssessmentReportData;
};

export function AssessmentReportDocument({ data }: AssessmentReportDocumentProps) {
  const {
    summary,
    clientName,
    assessmentName,
    assessmentType,
    assessmentDate,
    executiveSummary,
  } = data;

  const generatedDate = formatGeneratedDate();
  const assessmentTypeLabel = formatAssessmentType(assessmentType);

  const clientRecommendations = summary.recommendations.filter(
    (recommendation) => recommendation.status !== "declined",
  );

  const sortedRecommendations = sortRecommendationsForDisplay(clientRecommendations);

  const recommendationsByPriority = PRIORITY_ORDER.map((priority) => ({
    priority,
    label: PRIORITY_LABELS[priority],
    items: sortedRecommendations.filter(
      (recommendation) => recommendation.priority === priority,
    ),
  })).filter((group) => group.items.length > 0);

  const roadmap = computeRoadmapScores(summary.overallScore, summary.recommendations);
  const estimatedImprovement = summary.projectedScore - summary.overallScore;
  const criticalCount = countByPriority(summary.recommendations, "critical");
  const highCount = countByPriority(summary.recommendations, "high");

  const totalImpact = clientRecommendations.reduce(
    (sum, recommendation) => sum + recommendation.estimatedImpactPoints,
    0,
  );

  const overallRiskBullets = [
    `Overall StackScore: ${summary.overallScore} / 100 (${summary.overallRatingLabel})`,
    summary.hasCriticalExposure
      ? `${summary.criticalFindingsCount} critical security or recovery gap${summary.criticalFindingsCount === 1 ? "" : "s"} identified`
      : "No critical exposure flags were triggered in this assessment",
    `${summary.openRecommendationsCount} open recommendation${summary.openRecommendationsCount === 1 ? "" : "s"} requiring follow-up`,
  ];

  const strengthBullets = summary.topStrengths.map(
    (strength) =>
      `${strength.categoryName}: ${Math.round(strength.percentScore)}% (${RATING_LABELS[strength.rating]})`,
  );

  const riskBullets = summary.topRisks.map(
    (risk) => `${risk.categoryName}: ${Math.round(risk.percentScore)}% (${RATING_LABELS[risk.rating]})`,
  );

  const priorityBullets =
    summary.immediateActions.length > 0
      ? summary.immediateActions.map(
          (action) => `${action.title} (+${action.estimatedImpactPoints} pts)`,
        )
      : sortedRecommendations.slice(0, 3).map(
          (action) => `${action.title} (+${action.estimatedImpactPoints} pts)`,
        );

  const improvementBullets = [
    `Current score: ${summary.overallScore} → Projected score: ${summary.projectedScore}`,
    `Estimated improvement: +${estimatedImprovement} point${estimatedImprovement === 1 ? "" : "s"} if recommendations are addressed`,
    `Target maturity threshold: ${TARGET_SCORE}+ StackScore`,
  ];

  const overviewBullets = executiveSummary
    ? executiveSummary
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [
        `${clientName} was assessed across core technology maturity categories.`,
        `The current StackScore is ${summary.overallScore} with a projected score of ${summary.projectedScore} after remediation.`,
      ];

  const roadmapMilestones: Array<{
    label: string;
    score: number;
    highlight: boolean;
    isTarget?: boolean;
  }> = [
    { label: "Current StackScore", score: roadmap.current, highlight: false },
    { label: "After Critical Recommendations", score: roadmap.afterCritical, highlight: false },
    {
      label: "After Critical + High Recommendations",
      score: roadmap.afterCriticalAndHigh,
      highlight: true,
    },
    { label: "After All Recommendations", score: summary.projectedScore, highlight: false },
    { label: "Target Score", score: TARGET_SCORE, highlight: false, isTarget: true },
  ];

  return (
    <Document
      title={`${clientName} — StackScore Assessment`}
      author={BRAND.companyName}
      subject={BRAND.reportTitle}
    >
      <Page size="LETTER" style={styles.coverPage} wrap={false}>
        <PdfPageFooter generatedDate={generatedDate} />

        <View style={styles.coverHero}>
          <Text style={styles.coverProduct}>Bobkat {BRAND.productName}</Text>
          <Text style={styles.coverSubtitle}>{BRAND.reportTitle}</Text>
        </View>

        <View style={styles.coverBody}>
          <View style={styles.coverBrandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={getPdfLogoPath()} style={styles.coverBrandLogo} />
            <View>
              <Text style={styles.coverPreparedBy}>{BRAND.companyName}</Text>
              <Text style={styles.coverFinePrint}>Technology maturity assessment partner</Text>
            </View>
          </View>

          <Text style={styles.coverClientName}>{clientName}</Text>

          <View style={styles.coverMetaBlock}>
            <Text style={styles.coverMetaLabel}>Assessment Type</Text>
            <Text style={styles.coverMetaValue}>{assessmentTypeLabel}</Text>
          </View>
          <View style={styles.coverMetaBlock}>
            <Text style={styles.coverMetaLabel}>Assessment</Text>
            <Text style={styles.coverMetaValue}>{assessmentName}</Text>
          </View>
          <View style={styles.coverMetaBlock}>
            <Text style={styles.coverMetaLabel}>Assessment Date</Text>
            <Text style={styles.coverMetaValue}>{assessmentDate}</Text>
          </View>

          <View style={styles.coverPreparedRow}>
            <View>
              <Text style={styles.coverPreparedBy}>Prepared by {BRAND.companyName}</Text>
              <Text style={styles.coverFinePrint}>
                Confidential executive deliverable for remediation planning
              </Text>
            </View>
          </View>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfPageFooter generatedDate={generatedDate} />

        <PdfFlowSection
          title="Recommendation Summary"
          subtitle="Prioritized remediation opportunities and projected StackScore impact"
        >
          <View wrap={false} style={styles.scoreRow}>
            <PdfScoreGauge
              score={summary.overallScore}
              label="Current StackScore"
              ratingLabel={summary.overallRatingLabel}
            />
            <PdfScoreGauge
              score={summary.projectedScore}
              label="Projected StackScore"
              ratingLabel={RATING_LABELS[getRating(summary.projectedScore)]}
              variant="accent"
            />
          </View>

          <View style={styles.summaryGrid}>
            <View wrap={false} style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{clientRecommendations.length}</Text>
              <Text style={styles.summaryStatLabel}>Total Recommendations</Text>
            </View>
            <View wrap={false} style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{summary.openRecommendationsCount}</Text>
              <Text style={styles.summaryStatLabel}>Open Items</Text>
            </View>
            <View wrap={false} style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>+{totalImpact}</Text>
              <Text style={styles.summaryStatLabel}>Potential Points</Text>
            </View>
            <View wrap={false} style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{criticalCount + highCount}</Text>
              <Text style={styles.summaryStatLabel}>Critical + High</Text>
            </View>
          </View>

          {sortedRecommendations.length > 0 ? (
            <View>
              <View wrap={false} style={{ marginBottom: 8 }}>
                <Text style={styles.panelTitle}>Recommendation Index</Text>
                <Text style={[styles.bodyText, { marginBottom: 0 }]}>
                  Sorted by priority (Critical → High → Medium → Low), then by highest
                  potential score impact within each group.
                </Text>
              </View>
              <RecommendationIndex sortedRecommendations={sortedRecommendations} />
            </View>
          ) : (
            <Text style={styles.bodyText}>No recommendations at this time.</Text>
          )}
        </PdfFlowSection>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfPageFooter generatedDate={generatedDate} />

        <PdfFlowSection
          title="Technology Maturity Roadmap"
          subtitle="Phased StackScore improvement path for executive planning"
        >
          <Text style={styles.bodyText}>
            This roadmap shows how your StackScore can improve as recommendations are addressed
            in priority order. Use it to sequence remediation, allocate budget, and align
            technology projects with business risk reduction.
          </Text>

          {roadmapMilestones.map((milestone) => (
            <View
              key={milestone.label}
              wrap={false}
              style={
                milestone.highlight
                  ? [styles.roadmapRow, styles.roadmapRowHighlight]
                  : styles.roadmapRow
              }
            >
              <Text style={styles.roadmapLabel}>{milestone.label}</Text>
              <PdfMiniScoreBar score={milestone.score} />
              <Text style={styles.roadmapScore}>
                {milestone.isTarget ? `${TARGET_SCORE}+` : milestone.score}
              </Text>
            </View>
          ))}

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>How to Use This Roadmap</Text>
            <Text style={[styles.bodyText, { marginBottom: 4 }]}>
              • Address Critical items first to reduce immediate business and security risk.
            </Text>
            <Text style={[styles.bodyText, { marginBottom: 4 }]}>
              • High-priority items deliver the next wave of meaningful score improvement.
            </Text>
            <Text style={[styles.bodyText, { marginBottom: 0 }]}>
              • Medium and Low items complete the path toward the {TARGET_SCORE}+ maturity target.
            </Text>
          </View>
        </PdfFlowSection>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfPageFooter generatedDate={generatedDate} />

        <PdfFlowSection
          title="Executive Summary"
          subtitle="Skimmable assessment highlights for leadership review"
        >
          <View wrap={false} style={styles.scoreRow}>
            <PdfScoreGauge
              score={summary.overallScore}
              label="Current StackScore"
              ratingLabel={summary.overallRatingLabel}
            />
            <PdfScoreGauge
              score={summary.projectedScore}
              label="Projected StackScore"
              ratingLabel={RATING_LABELS[getRating(summary.projectedScore)]}
              variant="accent"
            />
          </View>

          {summary.hasCriticalExposure ? (
            <View wrap={false} style={styles.warningBox}>
              <Text style={styles.warningTitle}>Critical Exposure Warning</Text>
              <Text style={styles.warningText}>
                Immediate remediation is recommended to reduce business risk and protect
                operational continuity.
              </Text>
            </View>
          ) : null}

          <View style={styles.panel}>
            <PdfBulletSection title="Overall Risk" items={overallRiskBullets} />
            <PdfBulletSection title="Top Strengths" items={strengthBullets} />
            <PdfBulletSection title="Top Risks" items={riskBullets} />
            <PdfBulletSection title="Immediate Priorities" items={priorityBullets} />
            <PdfBulletSection title="Projected Improvement" items={improvementBullets} />
            <PdfBulletSection title="Assessment Overview" items={overviewBullets} />
          </View>
        </PdfFlowSection>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfPageFooter generatedDate={generatedDate} />

        <PdfFlowSection
          title="Technology Pillars"
          subtitle="Technology maturity performance across assessed domains"
        >
          {summary.categoryScores.length === 0 ? (
            <Text style={styles.bodyText}>No category scores available.</Text>
          ) : (
            summary.categoryScores.map((category) => (
              <CategoryScoreCard
                key={category.categoryId}
                categoryName={category.categoryName}
                percentScore={category.percentScore}
                rating={category.rating}
              />
            ))
          )}
        </PdfFlowSection>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfPageFooter generatedDate={generatedDate} />

        <PdfFlowSection
          title="Detailed Recommendations"
          subtitle="Prioritized remediation guidance with business impact and service alignment"
        >
          <Text style={styles.bodyText}>
            Recommendations are organized by priority. Each card includes potential score
            impact, recommended service, and business impact to support project planning.
          </Text>

          {recommendationsByPriority.length === 0 ? (
            <Text style={styles.bodyText}>No recommendations at this time.</Text>
          ) : (
            recommendationsByPriority.map((group) => (
              <PriorityRecommendationGroup
                key={group.priority}
                label={`${group.label} (${group.items.length})`}
                items={group.items}
              />
            ))
          )}
        </PdfFlowSection>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfPageFooter generatedDate={generatedDate} />

        <View>
          <PdfClosingHero
            title="Technology Improvement Plan"
            subtitle="A prioritized path from current maturity to your projected StackScore target"
          />

          <View wrap={false} style={styles.scoreRow}>
            <PdfScoreGauge
              score={summary.overallScore}
              label="Current Score"
              ratingLabel={summary.overallRatingLabel}
            />
            <PdfScoreGauge
              score={summary.projectedScore}
              label="Projected Score"
              ratingLabel={RATING_LABELS[getRating(summary.projectedScore)]}
              variant="accent"
            />
          </View>

          <View style={styles.closingStatGrid}>
            <View wrap={false} style={styles.closingStat}>
              <Text style={styles.closingStatValue}>{criticalCount}</Text>
              <Text style={styles.closingStatLabel}>Critical Projects</Text>
            </View>
            <View wrap={false} style={styles.closingStat}>
              <Text style={styles.closingStatValue}>{highCount}</Text>
              <Text style={styles.closingStatLabel}>High Priority Projects</Text>
            </View>
            <View wrap={false} style={styles.closingStat}>
              <Text style={styles.closingStatValue}>+{estimatedImprovement}</Text>
              <Text style={styles.closingStatLabel}>Estimated Improvement</Text>
            </View>
            <View wrap={false} style={styles.closingStat}>
              <Text style={styles.closingStatValue}>{TARGET_SCORE}+</Text>
              <Text style={styles.closingStatLabel}>Maturity Target</Text>
            </View>
          </View>

          <View style={styles.ctaBox}>
            <Text style={styles.ctaTitle}>Partner with {BRAND.companyName}</Text>
            <Text style={[styles.bodyText, { marginBottom: 0 }]}>
              Ready to turn these recommendations into measurable improvement? {BRAND.companyName}{" "}
              can help you prioritize projects, implement remediation, and track StackScore progress
              over time.
            </Text>
            <Text style={{ fontSize: 9, color: COLORS.muted, marginTop: 10, lineHeight: 1.5 }}>
              {BRAND.email}
              {BRAND.phone ? ` · ${BRAND.phone}` : ""} · {BRAND.website}
            </Text>
            <View wrap={false} style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Schedule a Remediation Planning Session</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
