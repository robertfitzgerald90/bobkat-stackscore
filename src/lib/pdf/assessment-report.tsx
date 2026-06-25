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
import { BRAND } from "@/lib/branding";
import { RATING_LABELS } from "@/lib/scoring";
import type { Priority, Rating } from "@/generated/prisma/client";
import {
  formatGeneratedDate,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  type AssessmentReportData,
} from "@/lib/pdf/types";

const logoPath = path.join(process.cwd(), "public", "branding", "bobkat-it-logo-navy.png");

Font.registerHyphenationCallback((word) => [word]);

const COLORS = {
  navy: BRAND.primaryColor,
  slate: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  surface: BRAND.lightBackground,
  critical: "#B91C1C",
  criticalBg: "#FEF2F2",
  criticalBorder: "#FECACA",
  high: "#9A3412",
  highBg: "#FFF7ED",
  highBorder: "#FED7AA",
  medium: "#475569",
  mediumBg: "#F8FAFC",
  mediumBorder: "#E2E8F0",
  low: "#64748B",
  lowBg: "#FFFFFF",
  lowBorder: "#E2E8F0",
  success: "#15803D",
  successBg: "#F0FDF4",
  warning: "#B45309",
  warningBg: "#FFFBEB",
};

const PRIORITY_BADGE: Record<
  Priority,
  { label: string; bg: string; text: string; border: string }
> = {
  critical: { label: "CRITICAL", bg: COLORS.criticalBg, text: COLORS.critical, border: COLORS.criticalBorder },
  high: { label: "HIGH", bg: COLORS.highBg, text: COLORS.high, border: COLORS.highBorder },
  medium: { label: "MEDIUM", bg: COLORS.mediumBg, text: COLORS.medium, border: COLORS.mediumBorder },
  low: { label: "LOW", bg: COLORS.lowBg, text: COLORS.low, border: COLORS.lowBorder },
};

const RATING_BAR: Record<Rating, string> = {
  exceptional: "#15803D",
  strong: "#16A34A",
  stable: "#7D97AC",
  at_risk: "#D97706",
  critical: "#DC2626",
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
    paddingTop: 56,
    paddingBottom: 48,
    paddingHorizontal: 54,
    marginBottom: 40,
  },
  coverBody: {
    paddingHorizontal: 54,
    flexGrow: 1,
  },
  coverFooterNote: {
    paddingHorizontal: 54,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 32,
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
  footerCenter: {
    fontSize: 8,
    color: COLORS.muted,
    textAlign: "center",
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
    objectFit: "contain",
  },
  coverLogo: {
    width: 72,
    height: 72,
    marginBottom: 24,
    objectFit: "contain",
  },
  coverProduct: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  coverSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
    marginBottom: 0,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  coverClientName: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 20,
    lineHeight: 1.3,
  },
  coverMetaBlock: {
    marginBottom: 14,
  },
  coverMetaLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  coverMetaValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate,
    lineHeight: 1.4,
  },
  coverPreparedBy: {
    fontSize: 11,
    color: COLORS.muted,
    lineHeight: 1.5,
  },
  sectionBlock: {
    marginBottom: 32,
  },
  sectionTitleWrap: {
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.navy,
    letterSpacing: 0.2,
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
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 8,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scoreCardAccent: {
    flex: 1,
    backgroundColor: "#EEF4F8",
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.navy,
  },
  scoreLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1,
  },
  scoreValueAccent: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1,
  },
  ratingBadge: {
    marginTop: 8,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  warningBox: {
    backgroundColor: COLORS.criticalBg,
    borderWidth: 1,
    borderColor: COLORS.criticalBorder,
    borderRadius: 6,
    padding: 14,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.critical,
    marginBottom: 6,
  },
  warningText: {
    fontSize: 9,
    color: "#7F1D1D",
    lineHeight: 1.55,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
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
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryListItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryListIndex: {
    width: 18,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    paddingTop: 1,
  },
  summaryListTitle: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.slate,
  },
  summaryListImpact: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    paddingTop: 1,
  },
  categoryRow: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
    gap: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate,
    lineHeight: 1.4,
  },
  categoryMeta: {
    fontSize: 9,
    color: COLORS.muted,
    textAlign: "right",
    lineHeight: 1.4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  insightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  insightName: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.45,
    color: COLORS.slate,
  },
  insightValue: {
    fontSize: 9,
    color: COLORS.muted,
    textAlign: "right",
    lineHeight: 1.45,
    maxWidth: "42%",
  },
  priorityGroup: {
    marginBottom: 20,
  },
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
  recommendationField: {
    marginBottom: 8,
  },
  recommendationFieldLabel: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  recommendationFieldValue: {
    fontSize: 9,
    lineHeight: 1.55,
    color: COLORS.slate,
  },
  recommendationImpact: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.45,
  },
  ctaBox: {
    marginTop: 8,
    padding: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ctaTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 8,
  },
  ctaContact: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 8,
    lineHeight: 1.5,
  },
});

function PageFooter({ generatedDate }: { generatedDate: string }) {
  const contact = [BRAND.email, BRAND.phone, BRAND.website].filter(Boolean).join("  |  ");

  return (
    <View style={styles.footer} fixed>
      <Text style={{ fontSize: 8, color: COLORS.muted, maxWidth: "34%" }}>
        {BRAND.companyName}
      </Text>
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

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View wrap={false} style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle} orphans={2} widows={2}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function ScoreProgressBar({ percent, rating }: { percent: number; rating: Rating }) {
  const width = `${Math.max(0, Math.min(100, Math.round(percent)))}%`;

  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width, backgroundColor: RATING_BAR[rating] },
        ]}
      />
    </View>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const badge = PRIORITY_BADGE[priority];

  return (
    <Text
      style={[
        styles.priorityBadge,
        {
          backgroundColor: badge.bg,
          color: badge.text,
          borderColor: badge.border,
        },
      ]}
    >
      {badge.label}
    </Text>
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

  const recommendationsByPriority = PRIORITY_ORDER.map((priority) => ({
    priority,
    label: PRIORITY_LABELS[priority],
    items: clientRecommendations.filter((recommendation) => recommendation.priority === priority),
  })).filter((group) => group.items.length > 0);

  const priorityCounts = PRIORITY_ORDER.map((priority) => ({
    priority,
    label: PRIORITY_LABELS[priority],
    count: clientRecommendations.filter((recommendation) => recommendation.priority === priority).length,
  }));

  const totalImpact = clientRecommendations.reduce(
    (sum, recommendation) => sum + recommendation.estimatedImpactPoints,
    0,
  );

  const defaultExecutiveSummary =
    executiveSummary ??
    `This assessment evaluated ${clientName}'s technology environment across seven maturity categories. The overall StackScore is ${summary.overallScore} (${summary.overallRatingLabel}), with a projected score of ${summary.projectedScore} once open recommendations are addressed.`;

  return (
    <Document
      title={`${clientName} — StackScore Assessment`}
      author={BRAND.companyName}
      subject={BRAND.reportTitle}
    >
      <Page size="LETTER" style={styles.coverPage} wrap={false}>
        <PageFooter generatedDate={generatedDate} />

        <View style={styles.coverHero}>
          <Image src={logoPath} style={styles.coverLogo} />
          <Text style={styles.coverProduct}>Bobkat {BRAND.productName}</Text>
          <Text style={styles.coverSubtitle}>{BRAND.reportTitle}</Text>
        </View>

        <View style={styles.coverBody}>
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

          <View style={styles.coverFooterNote}>
            <Text style={styles.coverPreparedBy}>
              Prepared by {BRAND.companyName}
            </Text>
            <Text style={{ fontSize: 9, color: COLORS.muted, marginTop: 6, lineHeight: 1.5 }}>
              Confidential technology maturity assessment prepared for executive review and
              remediation planning.
            </Text>
          </View>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PageFooter generatedDate={generatedDate} />

        <View style={styles.sectionBlock}>
          <SectionTitle
            title="Recommendation Summary"
            subtitle="Prioritized remediation opportunities and projected StackScore impact"
          />

          <View wrap={false} style={styles.scoreRow}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Current StackScore</Text>
              <Text style={styles.scoreValue}>{summary.overallScore}</Text>
              <Text style={styles.ratingBadge}>{summary.overallRatingLabel}</Text>
            </View>
            <View style={styles.scoreCardAccent}>
              <Text style={styles.scoreLabel}>Projected StackScore</Text>
              <Text style={styles.scoreValueAccent}>{summary.projectedScore}</Text>
              <Text style={styles.ratingBadge}>After recommendations addressed</Text>
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
              <Text style={styles.summaryStatValue}>{summary.criticalFindingsCount}</Text>
              <Text style={styles.summaryStatLabel}>Critical Findings</Text>
            </View>
          </View>

          <View wrap={false} style={styles.panel}>
            <Text style={styles.panelTitle}>Recommendations by Priority</Text>
            {priorityCounts.map((entry) => (
              <View key={entry.priority} style={styles.insightRow}>
                <Text style={styles.insightName}>{entry.label}</Text>
                <Text style={styles.insightValue}>{entry.count}</Text>
              </View>
            ))}
          </View>

          {clientRecommendations.length > 0 ? (
            <View>
              <View wrap={false} style={{ marginBottom: 10 }}>
                <Text style={styles.panelTitle}>Recommendation Index</Text>
              </View>
              {clientRecommendations.map((recommendation, index) => (
                <View key={recommendation.id} wrap={false} style={styles.summaryListItem}>
                  <Text style={styles.summaryListIndex}>{index + 1}.</Text>
                  <Text style={styles.summaryListTitle}>{recommendation.title}</Text>
                  <Text style={styles.summaryListImpact}>
                    +{recommendation.estimatedImpactPoints}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.bodyText}>No recommendations at this time.</Text>
          )}
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap={false}>
        <PageFooter generatedDate={generatedDate} />

        <View style={styles.sectionBlock}>
          <SectionTitle
            title="Executive Summary"
            subtitle="Assessment outcomes, business risk posture, and strategic context"
          />

          <View wrap={false} style={styles.panel}>
            <Text style={styles.panelTitle}>Score at a Glance</Text>
            <View style={styles.scoreRow}>
              <View style={[styles.scoreCard, { marginBottom: 0 }]}>
                <Text style={styles.scoreLabel}>Overall StackScore</Text>
                <Text style={styles.scoreValue}>{summary.overallScore}</Text>
                <Text style={styles.ratingBadge}>{summary.overallRatingLabel}</Text>
              </View>
              <View style={[styles.scoreCardAccent, { marginBottom: 0 }]}>
                <Text style={styles.scoreLabel}>Projected StackScore</Text>
                <Text style={styles.scoreValueAccent}>{summary.projectedScore}</Text>
                <Text style={styles.ratingBadge}>After remediation</Text>
              </View>
            </View>
          </View>

          {summary.hasCriticalExposure ? (
            <View wrap={false} style={styles.warningBox}>
              <Text style={styles.warningTitle}>Critical Exposure Warning</Text>
              <Text style={styles.warningText}>
                {summary.criticalFindingsCount} critical finding
                {summary.criticalFindingsCount === 1 ? "" : "s"} identified during this assessment.
                Immediate remediation is recommended to reduce business risk and protect operational
                continuity.
              </Text>
            </View>
          ) : null}

          <View wrap={false} style={styles.panel}>
            <Text style={styles.panelTitle}>Assessment Overview</Text>
            <Text style={[styles.bodyText, { marginBottom: 0 }]}>{defaultExecutiveSummary}</Text>
          </View>

          <View wrap={false} style={styles.panel}>
            <Text style={styles.panelTitle}>Engagement Details</Text>
            <View style={styles.insightRow}>
              <Text style={styles.insightName}>Client</Text>
              <Text style={styles.insightValue}>{clientName}</Text>
            </View>
            <View style={styles.insightRow}>
              <Text style={styles.insightName}>Assessment Type</Text>
              <Text style={styles.insightValue}>{assessmentTypeLabel}</Text>
            </View>
            <View style={styles.insightRow}>
              <Text style={styles.insightName}>Assessment Date</Text>
              <Text style={styles.insightValue}>{assessmentDate}</Text>
            </View>
            <View style={[styles.insightRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.insightName}>Open Recommendations</Text>
              <Text style={styles.insightValue}>{summary.openRecommendationsCount}</Text>
            </View>
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
              <View style={styles.categoryRow}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>
                    {summary.categoryScores[0].categoryName}
                  </Text>
                  <Text style={styles.categoryMeta}>
                    {Math.round(summary.categoryScores[0].percentScore)}% ·{" "}
                    {RATING_LABELS[summary.categoryScores[0].rating]}
                  </Text>
                </View>
                <ScoreProgressBar
                  percent={summary.categoryScores[0].percentScore}
                  rating={summary.categoryScores[0].rating}
                />
              </View>
            ) : null}
          </View>

          {summary.categoryScores.slice(1).map((category) => (
            <View key={category.categoryId} wrap={false} style={styles.categoryRow}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.categoryName}</Text>
                <Text style={styles.categoryMeta}>
                  {Math.round(category.percentScore)}% · {RATING_LABELS[category.rating]}
                </Text>
              </View>
              <ScoreProgressBar percent={category.percentScore} rating={category.rating} />
            </View>
          ))}
        </View>

        <View style={styles.sectionBlock} break>
          <SectionTitle
            title="Top Risks"
            subtitle="Categories requiring the most immediate attention"
          />
          {summary.topRisks.length === 0 ? (
            <Text style={styles.bodyText}>No significant risk areas identified.</Text>
          ) : (
            summary.topRisks.map((risk) => (
              <View key={risk.categoryId} wrap={false} style={styles.insightRow}>
                <Text style={styles.insightName}>{risk.categoryName}</Text>
                <Text style={styles.insightValue}>
                  {Math.round(risk.percentScore)}% — {RATING_LABELS[risk.rating]}
                </Text>
              </View>
            ))
          )}
        </View>

        {summary.topStrengths.length > 0 ? (
          <View style={styles.sectionBlock}>
            <SectionTitle
              title="Top Strengths"
              subtitle="Areas demonstrating strong technology maturity"
            />
            {summary.topStrengths.map((strength) => (
              <View key={strength.categoryId} wrap={false} style={styles.insightRow}>
                <Text style={styles.insightName}>{strength.categoryName}</Text>
                <Text style={styles.insightValue}>
                  {Math.round(strength.percentScore)}% — {RATING_LABELS[strength.rating]}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
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
              The following recommendations are organized by priority to support executive decision
              making and remediation planning. Addressing open items can improve the projected
              StackScore to {summary.projectedScore}.
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

          <View wrap={false} style={styles.ctaBox}>
            <Text style={styles.ctaTitle}>Next Steps with {BRAND.companyName}</Text>
            <Text style={[styles.bodyText, { marginBottom: 0 }]}>
              Contact {BRAND.companyName} to discuss implementation priorities, project planning,
              and ongoing technology management. We are ready to help you improve your StackScore
              and strengthen your business technology foundation.
            </Text>
            <Text style={styles.ctaContact}>
              {BRAND.email}
              {BRAND.phone ? ` · ${BRAND.phone}` : ""} · {BRAND.website}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
