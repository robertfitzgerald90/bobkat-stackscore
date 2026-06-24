import path from "path";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { RATING_LABELS } from "@/lib/scoring";
import {
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  type AssessmentReportData,
} from "@/lib/pdf/types";

const logoPath = path.join(process.cwd(), "public", "branding", "bobkat-it-logo-navy.png");

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#2C3E50",
    backgroundColor: "#FFFFFF",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#64748B",
  },
  coverBand: {
    backgroundColor: BRAND.lightBackground,
    borderRadius: 8,
    padding: 28,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 16,
    objectFit: "contain",
  },
  brandName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: BRAND.primaryColor,
    marginBottom: 4,
  },
  reportSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 20,
  },
  clientName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: BRAND.darkColor,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 10,
    color: "#64748B",
    marginBottom: 3,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: BRAND.lightBackground,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  scoreCardAccent: {
    flex: 1,
    backgroundColor: "#EEF4F8",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.primaryColor,
  },
  scoreLabel: {
    fontSize: 9,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: BRAND.darkColor,
  },
  scoreValueAccent: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: BRAND.primaryColor,
  },
  ratingBadge: {
    marginTop: 6,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BRAND.primaryColor,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: BRAND.darkColor,
    marginBottom: 10,
    marginTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: BRAND.primaryColor,
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#334155",
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#B91C1C",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 9,
    color: "#7F1D1D",
    lineHeight: 1.5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND.primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: BRAND.lightBackground,
  },
  colCategory: { width: "50%" },
  colScore: { width: "20%", textAlign: "right" },
  colRating: { width: "30%", textAlign: "right" },
  riskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  prioritySection: {
    marginBottom: 14,
  },
  priorityHeading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BRAND.darkColor,
    marginBottom: 8,
    backgroundColor: BRAND.lightBackground,
    padding: 8,
    borderRadius: 4,
  },
  recommendationCard: {
    marginBottom: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 4,
  },
  recommendationTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: BRAND.darkColor,
  },
  recommendationMeta: {
    fontSize: 8,
    color: "#64748B",
    marginBottom: 4,
  },
  recommendationBody: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "#475569",
  },
});

function PageFooter() {
  const contact = [BRAND.email, BRAND.phone, BRAND.website].filter(Boolean).join("  |  ");

  return (
    <View style={styles.footer} fixed>
      <Text>{BRAND.companyName} — {BRAND.reportTitle}</Text>
      <Text>{contact}</Text>
    </View>
  );
}

type AssessmentReportDocumentProps = {
  data: AssessmentReportData;
};

export function AssessmentReportDocument({ data }: AssessmentReportDocumentProps) {
  const { summary, clientName, assessmentName, assessmentDate, executiveSummary } = data;

  const clientRecommendations = summary.recommendations.filter(
    (recommendation) => recommendation.status !== "declined",
  );

  const recommendationsByPriority = PRIORITY_ORDER.map((priority) => ({
    priority,
    label: PRIORITY_LABELS[priority],
    items: clientRecommendations.filter((r) => r.priority === priority),
  })).filter((group) => group.items.length > 0);

  return (
    <Document
      title={`${clientName} — StackScore Assessment`}
      author={BRAND.companyName}
      subject={BRAND.reportTitle}
    >
      <Page size="LETTER" style={styles.page}>
        <PageFooter />

        <View style={styles.coverBand}>
          <Image src={logoPath} style={styles.logo} />
          <Text style={styles.brandName}>{BRAND.companyName}</Text>
          <Text style={styles.reportSubtitle}>{BRAND.reportTitle}</Text>
          <Text style={styles.clientName}>{clientName}</Text>
          <Text style={styles.metaText}>{assessmentName}</Text>
          <Text style={styles.metaText}>Assessment Date: {assessmentDate}</Text>
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Overall StackScore</Text>
            <Text style={styles.scoreValue}>{summary.overallScore}</Text>
            <Text style={styles.ratingBadge}>{summary.overallRatingLabel}</Text>
          </View>
          <View style={styles.scoreCardAccent}>
            <Text style={styles.scoreLabel}>Projected Score</Text>
            <Text style={styles.scoreValueAccent}>{summary.projectedScore}</Text>
            <Text style={styles.ratingBadge}>After recommendations addressed</Text>
          </View>
        </View>

        {summary.hasCriticalExposure ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Critical Exposure Warning</Text>
            <Text style={styles.warningText}>
              {summary.criticalFindingsCount} critical finding
              {summary.criticalFindingsCount === 1 ? "" : "s"} identified during this
              assessment. Immediate remediation is recommended to reduce business risk.
            </Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={styles.bodyText}>
          {executiveSummary ??
            `This assessment evaluated ${clientName}'s technology environment across seven maturity categories. The overall StackScore is ${summary.overallScore} (${summary.overallRatingLabel}).`}
        </Text>
      </Page>

      <Page size="LETTER" style={styles.page}>
        <PageFooter />

        <Text style={styles.sectionTitle}>Category Scores</Text>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colCategory]}>Category</Text>
            <Text style={[styles.tableHeaderText, styles.colScore]}>Score</Text>
            <Text style={[styles.tableHeaderText, styles.colRating]}>Rating</Text>
          </View>
          {summary.categoryScores.map((category, index) => (
            <View key={category.categoryId} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.colCategory}>{category.categoryName}</Text>
              <Text style={styles.colScore}>{Math.round(category.percentScore)}%</Text>
              <Text style={styles.colRating}>{RATING_LABELS[category.rating]}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Top Risks</Text>
        {summary.topRisks.length === 0 ? (
          <Text style={styles.bodyText}>No significant risk areas identified.</Text>
        ) : (
          summary.topRisks.map((risk) => (
            <View key={risk.categoryId} style={styles.riskItem}>
              <Text>{risk.categoryName}</Text>
              <Text>
                {Math.round(risk.percentScore)}% — {RATING_LABELS[risk.rating]}
              </Text>
            </View>
          ))
        )}

        {summary.topStrengths.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Top Strengths</Text>
            {summary.topStrengths.map((strength) => (
              <View key={strength.categoryId} style={styles.riskItem}>
                <Text>{strength.categoryName}</Text>
                <Text>
                  {Math.round(strength.percentScore)}% — {RATING_LABELS[strength.rating]}
                </Text>
              </View>
            ))}
          </>
        ) : null}
      </Page>

      <Page size="LETTER" style={styles.page}>
        <PageFooter />

        <Text style={styles.sectionTitle}>Recommendations</Text>
        <Text style={styles.bodyText}>
          The following prioritized recommendations will help improve your technology maturity
          and reduce operational risk. Projected StackScore after addressing open recommendations:{" "}
          <Text style={{ fontFamily: "Helvetica-Bold" }}>{summary.projectedScore}</Text>.
        </Text>

        {recommendationsByPriority.length === 0 ? (
          <Text style={styles.bodyText}>No recommendations at this time.</Text>
        ) : (
          recommendationsByPriority.map((group) => (
            <View key={group.priority} style={styles.prioritySection}>
              <Text style={styles.priorityHeading}>
                {group.label} ({group.items.length})
              </Text>
              {group.items.map((recommendation) => (
                <View key={recommendation.id} style={styles.recommendationCard}>
                  <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                  <Text style={styles.recommendationMeta}>
                    {recommendation.categoryName}
                    {recommendation.suggestedService
                      ? ` · ${recommendation.suggestedService}`
                      : ""}
                    {" · "}+{recommendation.estimatedImpactPoints} pts potential impact
                  </Text>
                  <Text style={styles.recommendationBody}>{recommendation.businessImpact}</Text>
                </View>
              ))}
            </View>
          ))
        )}

        <View style={{ marginTop: 24, padding: 16, backgroundColor: BRAND.lightBackground, borderRadius: 6 }}>
          <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: BRAND.darkColor, marginBottom: 6 }}>
            Next Steps with {BRAND.companyName}
          </Text>
          <Text style={styles.bodyText}>
            Contact {BRAND.companyName} to discuss implementation priorities, project planning,
            and ongoing technology management. We are ready to help you improve your StackScore
            and strengthen your business technology foundation.
          </Text>
          <Text style={{ fontSize: 9, color: "#64748B" }}>
            {BRAND.email}{BRAND.phone ? ` · ${BRAND.phone}` : ""} · {BRAND.website}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
