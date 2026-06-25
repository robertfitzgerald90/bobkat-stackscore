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
import { formatAssessmentType } from "@/lib/assessments/display";
import type { RecommendationSummary } from "@/lib/assessments/results-summary";
import { BRAND } from "@/lib/branding";
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

const logoPath = path.join(process.cwd(), "public", "branding", "bobkat-it-logo-navy.png");
const TARGET_SCORE = 80;

Font.registerHyphenationCallback((word) => [word]);

const COLORS = {
  navy: BRAND.primaryColor,
  slate: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  surface: BRAND.lightBackground,
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
  successBg: "#F0FDF4",
  warning: "#B45309",
  warningBg: "#FFFBEB",
  target: "#082F5B",
};

const PRIORITY_BADGE: Record<
  Priority,
  { label: string; bg: string; text: string; border: string }
> = {
  critical: { label: "CRITICAL", bg: COLORS.criticalBg, text: COLORS.critical, border: COLORS.criticalBorder },
  high: { label: "HIGH", bg: COLORS.highBg, text: COLORS.high, border: COLORS.highBorder },
  medium: { label: "MEDIUM", bg: COLORS.mediumBg, text: COLORS.medium, border: COLORS.border },
  low: { label: "LOW", bg: "#FFFFFF", text: COLORS.low, border: COLORS.border },
};

const RATING_BAR: Record<Rating, string> = {
  critical: "#DC2626",
  at_risk: "#D97706",
  stable: "#7D97AC",
  strong: "#16A34A",
  exceptional: "#082F5B",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 52,
    paddingBottom: 72,
    paddingHorizontal: 54,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.slate,
    backgroundColor: "#FFFFFF",
  },
  coverPage: {
    paddingTop: 0,
    paddingBottom: 72,
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
  sectionBlock: { marginBottom: 28 },
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
    minHeight: 98,
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

function PageFooter({ generatedDate }: { generatedDate: string }) {
  const contact = [BRAND.email, BRAND.phone, BRAND.website].filter(Boolean).join("  |  ");

  return (
    <View style={styles.footer} fixed>
      <Text style={{ fontSize: 8, color: COLORS.muted, maxWidth: "34%" }}>{BRAND.companyName}</Text>
      <Text style={styles.footerCenter}>
        Generated {generatedDate}
        {contact ? `  |  ${contact}` : ""}
      </Text>
      <Text
        style={{ fontSize: 8, color: COLORS.muted, textAlign: "right", minWidth: "18%" }}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View wrap={false} style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle} orphans={2} widows={2}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function ScoreGauge({
  score,
  label,
  ratingLabel,
  variant = "default",
  showTarget = true,
}: {
  score: number;
  label: string;
  ratingLabel: string;
  variant?: "default" | "accent";
  showTarget?: boolean;
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
        {showTarget ? <View style={[styles.targetLine, { left: `${TARGET_SCORE}%` }]} /> : null}
      </View>
      {showTarget ? <Text style={styles.targetCaption}>Target: {TARGET_SCORE}+</Text> : null}
    </View>
  );
}

function MiniScoreBar({ score, width = 120 }: { score: number; width?: number }) {
  const rating = getRating(score);
  const fillWidth = `${Math.max(0, Math.min(100, Math.round(score)))}%`;

  return (
    <View style={[styles.roadmapBarWrap, { width }]}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: fillWidth, backgroundColor: RATING_BAR[rating] }]} />
      </View>
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

function BulletSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <View wrap={false} style={styles.bulletSection}>
      <Text style={styles.bulletHeading}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.bulletItem}>
          • {item}
        </Text>
      ))}
    </View>
  );
}

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
        <PriorityBadge priority={priority} />
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

        return (
          <View key={priority}>
            <View wrap={false}>
              <Text style={styles.indexGroupTitle}>
                {PRIORITY_LABELS[priority]} ({group.length})
              </Text>
            </View>
            {group.map((recommendation) => {
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
        <PageFooter generatedDate={generatedDate} />

        <View style={styles.coverHero}>
          <Text style={styles.coverProduct}>Bobkat {BRAND.productName}</Text>
          <Text style={styles.coverSubtitle}>{BRAND.reportTitle}</Text>
        </View>

        <View style={styles.coverBody}>
          <View style={styles.coverBrandRow}>
            <Image src={logoPath} style={styles.coverBrandLogo} />
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
        <PageFooter generatedDate={generatedDate} />

        <View style={styles.sectionBlock}>
          <View wrap={false}>
            <SectionTitle
              title="Recommendation Summary"
              subtitle="Prioritized remediation opportunities and projected StackScore impact"
            />
            <View style={styles.scoreRow}>
              <ScoreGauge
                score={summary.overallScore}
                label="Current StackScore"
                ratingLabel={summary.overallRatingLabel}
              />
              <ScoreGauge
                score={summary.projectedScore}
                label="Projected StackScore"
                ratingLabel={RATING_LABELS[getRating(summary.projectedScore)]}
                variant="accent"
              />
            </View>
          </View>

          <View wrap={false} style={styles.summaryGrid}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{clientRecommendations.length}</Text>
              <Text style={styles.summaryStatLabel}>Total Recommendations</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{summary.openRecommendationsCount}</Text>
              <Text style={styles.summaryStatLabel}>Open Items</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>+{totalImpact}</Text>
              <Text style={styles.summaryStatLabel}>Potential Points</Text>
            </View>
            <View style={styles.summaryStat}>
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
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PageFooter generatedDate={generatedDate} />

        <View style={styles.sectionBlock}>
          <View wrap={false}>
            <SectionTitle
              title="Technology Maturity Roadmap"
              subtitle="Phased StackScore improvement path for executive planning"
            />
            <Text style={styles.bodyText}>
              This roadmap shows how your StackScore can improve as recommendations are addressed
              in priority order. Use it to sequence remediation, allocate budget, and align
              technology projects with business risk reduction.
            </Text>
          </View>

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
              <MiniScoreBar score={milestone.score} />
              <Text style={styles.roadmapScore}>
                {milestone.isTarget ? `${TARGET_SCORE}+` : milestone.score}
              </Text>
            </View>
          ))}

          <View wrap={false} style={styles.panel}>
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
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PageFooter generatedDate={generatedDate} />

        <View style={styles.sectionBlock}>
          <View wrap={false}>
            <SectionTitle
              title="Executive Summary"
              subtitle="Skimmable assessment highlights for leadership review"
            />
            <View style={styles.scoreRow}>
              <ScoreGauge
                score={summary.overallScore}
                label="Current StackScore"
                ratingLabel={summary.overallRatingLabel}
              />
              <ScoreGauge
                score={summary.projectedScore}
                label="Projected StackScore"
                ratingLabel={RATING_LABELS[getRating(summary.projectedScore)]}
                variant="accent"
              />
            </View>
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

          <View wrap={false} style={styles.panel}>
            <BulletSection title="Overall Risk" items={overallRiskBullets} />
            <BulletSection title="Top Strengths" items={strengthBullets} />
            <BulletSection title="Top Risks" items={riskBullets} />
            <BulletSection title="Immediate Priorities" items={priorityBullets} />
            <BulletSection title="Projected Improvement" items={improvementBullets} />
            <BulletSection title="Assessment Overview" items={overviewBullets} />
          </View>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PageFooter generatedDate={generatedDate} />

        <View style={styles.sectionBlock}>
          <View wrap={false}>
            <SectionTitle
              title="Category Scores"
              subtitle="Technology maturity performance across assessed domains"
            />
            {summary.categoryScores[0] ? (
              <CategoryScoreCard
                categoryName={summary.categoryScores[0].categoryName}
                percentScore={summary.categoryScores[0].percentScore}
                rating={summary.categoryScores[0].rating}
              />
            ) : null}
          </View>

          {summary.categoryScores.slice(1).map((category) => (
            <CategoryScoreCard
              key={category.categoryId}
              categoryName={category.categoryName}
              percentScore={category.percentScore}
              rating={category.rating}
            />
          ))}
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PageFooter generatedDate={generatedDate} />

        <View style={styles.sectionBlock}>
          <View wrap={false}>
            <SectionTitle
              title="Detailed Recommendations"
              subtitle="Prioritized remediation guidance with business impact and service alignment"
            />
            <Text style={styles.bodyText}>
              Recommendations are organized by priority. Each card includes potential score
              impact, recommended service, and business impact to support project planning.
            </Text>
          </View>

          {recommendationsByPriority.length === 0 ? (
            <Text style={styles.bodyText}>No recommendations at this time.</Text>
          ) : (
            recommendationsByPriority.map((group) => (
              <View key={group.priority} style={styles.priorityGroup}>
                {group.items.map((recommendation, index) =>
                  index === 0 ? (
                    <View key={recommendation.id} wrap={false}>
                      <Text style={styles.priorityGroupTitle}>
                        {group.label} ({group.items.length})
                      </Text>
                      <RecommendationCard
                        priority={recommendation.priority}
                        title={recommendation.title}
                        estimatedImpactPoints={recommendation.estimatedImpactPoints}
                        suggestedService={recommendation.suggestedService}
                        businessImpact={recommendation.businessImpact}
                        categoryName={recommendation.categoryName}
                      />
                    </View>
                  ) : (
                    <RecommendationCard
                      key={recommendation.id}
                      priority={recommendation.priority}
                      title={recommendation.title}
                      estimatedImpactPoints={recommendation.estimatedImpactPoints}
                      suggestedService={recommendation.suggestedService}
                      businessImpact={recommendation.businessImpact}
                      categoryName={recommendation.categoryName}
                    />
                  ),
                )}
              </View>
            ))
          )}
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap={false}>
        <PageFooter generatedDate={generatedDate} />

        <View style={styles.closingHero}>
          <Text style={styles.closingHeroTitle}>Technology Improvement Plan</Text>
          <Text style={styles.closingHeroSubtitle}>
            A prioritized path from current maturity to your projected StackScore target
          </Text>
        </View>

        <View wrap={false} style={styles.scoreRow}>
          <ScoreGauge
            score={summary.overallScore}
            label="Current Score"
            ratingLabel={summary.overallRatingLabel}
          />
          <ScoreGauge
            score={summary.projectedScore}
            label="Projected Score"
            ratingLabel={RATING_LABELS[getRating(summary.projectedScore)]}
            variant="accent"
          />
        </View>

        <View wrap={false} style={styles.closingStatGrid}>
          <View style={styles.closingStat}>
            <Text style={styles.closingStatValue}>{criticalCount}</Text>
            <Text style={styles.closingStatLabel}>Critical Projects</Text>
          </View>
          <View style={styles.closingStat}>
            <Text style={styles.closingStatValue}>{highCount}</Text>
            <Text style={styles.closingStatLabel}>High Priority Projects</Text>
          </View>
          <View style={styles.closingStat}>
            <Text style={styles.closingStatValue}>
              +{estimatedImprovement}
            </Text>
            <Text style={styles.closingStatLabel}>Estimated Improvement</Text>
          </View>
          <View style={styles.closingStat}>
            <Text style={styles.closingStatValue}>{TARGET_SCORE}+</Text>
            <Text style={styles.closingStatLabel}>Maturity Target</Text>
          </View>
        </View>

        <View wrap={false} style={styles.ctaBox}>
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
          <View style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Schedule a Remediation Planning Session</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
