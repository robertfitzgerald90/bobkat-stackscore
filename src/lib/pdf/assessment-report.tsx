import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import {
  isCustomerActiveOpportunityStatus,
  getCustomerMaturityLabel,
} from "@/lib/assessments/customer-reporting";
import {
  RECOMMENDATION_STATUS_LABELS,
  type RecommendationSummary,
} from "@/lib/assessments/results-summary";
import { presentRecommendationDescription } from "@/lib/customer-portal/recommendation-content";
import { buildAssessmentReportSections } from "@/lib/reports/assessment-content";
import { getReportTypeMeta } from "@/lib/reports/meta";
import {
  PdfReportHeader,
  PdfReportFooter,
  PDF_LAYOUT,
  registerPdfFonts,
} from "@/lib/pdf/shared";
import { REPORT_COLORS as C, REPORT_FONTS as F } from "@/lib/pdf/shared/tokens";
import {
  formatGeneratedDate,
  type AssessmentReportData,
} from "@/lib/pdf/types";
import { formatMaturityScore } from "@/lib/scoring/score-display";
import { RATING_LABELS } from "@/lib/scoring";

registerPdfFonts();

// A flowing executive document, matching the Progress report's compact summary,
// metric grid, plain section rules, and readable detail rather than slide-like heroes.
const s = StyleSheet.create({
  page: {
    paddingTop: 88,
    paddingBottom: PDF_LAYOUT.paddingBottom,
    paddingHorizontal: PDF_LAYOUT.paddingHorizontal,
    fontFamily: F.body,
    fontSize: 10,
    color: C.ink,
    backgroundColor: C.white,
  },
  intro: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: C.accent,
  },
  eyebrow: {
    fontSize: 8,
    color: C.accent,
    letterSpacing: 1,
    marginBottom: 7,
    textTransform: "uppercase",
    fontFamily: F.bodyBold,
  },
  title: {
    fontSize: 25,
    lineHeight: 1.15,
    fontFamily: F.displayBold,
    marginBottom: 8,
  },
  subtitle: { fontSize: 10, lineHeight: 1.5, color: C.inkSecondary },
  client: {
    fontSize: 13,
    fontFamily: F.bodyBold,
    marginTop: 12,
    marginBottom: 4,
  },
  meta: { fontSize: 9, lineHeight: 1.45, color: C.inkSecondary },
  metrics: { flexDirection: "row", gap: 8, marginBottom: 12 },
  metric: {
    flex: 1,
    padding: 11,
    borderWidth: 1,
    borderColor: C.rule,
    backgroundColor: C.white,
  },
  metricLabel: { fontSize: 8, color: C.inkSecondary, marginBottom: 6 },
  metricValue: {
    fontSize: 23,
    fontFamily: F.bodyBold,
    color: C.ink,
    marginBottom: 4,
  },
  metricHint: { fontSize: 8, color: C.inkSecondary },
  sectionTitle: {
    fontSize: 15,
    fontFamily: F.displayBold,
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.rule,
    marginBottom: 9,
  },
  section: { marginBottom: 14 },
  body: { fontSize: 10, lineHeight: 1.5, marginBottom: 6 },
  small: {
    fontSize: 9,
    lineHeight: 1.5,
    color: C.inkSecondary,
    marginBottom: 5,
  },
  columns: { flexDirection: "row", gap: 22 },
  column: { flex: 1 },
  label: { fontSize: 9, fontFamily: F.bodyBold, marginBottom: 6, color: C.ink },
  bullet: { fontSize: 10, lineHeight: 1.5, marginBottom: 6 },
  warning: {
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: C.critical,
    backgroundColor: C.criticalBg,
    marginBottom: 10,
  },
  warningTitle: {
    fontFamily: F.bodyBold,
    fontSize: 10,
    color: C.critical,
    marginBottom: 3,
  },
  tableHead: {
    flexDirection: "row",
    padding: 9,
    backgroundColor: C.sectionBackground,
    borderBottomWidth: 1,
    borderBottomColor: C.rule,
  },
  tableRow: {
    flexDirection: "row",
    padding: 9,
    borderBottomWidth: 1,
    borderBottomColor: C.rule,
    alignItems: "center",
  },
  pillar: { width: "54%", fontSize: 10, paddingRight: 8 },
  score: {
    width: "17%",
    fontSize: 11,
    fontFamily: F.bodyBold,
    color: C.accent,
  },
  maturity: { width: "29%", fontSize: 9, color: C.inkSecondary },
  track: {
    height: 3,
    backgroundColor: C.sectionBackground,
    marginTop: 5,
    width: 160,
  },
  fill: { height: 3, backgroundColor: C.accent },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.rule,
  },
  number: { width: 20, fontSize: 10, color: C.accent, fontFamily: F.bodyBold },
  action: { flex: 1, fontSize: 10, lineHeight: 1.5 },
  recommendation: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.rule,
  },
  recommendationTitle: {
    fontSize: 12,
    lineHeight: 1.35,
    fontFamily: F.bodyBold,
    marginBottom: 5,
  },
  recommendationMeta: {
    fontSize: 8,
    color: C.accent,
    lineHeight: 1.5,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 9,
    fontFamily: F.bodyBold,
    marginTop: 3,
    marginBottom: 3,
  },
});

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={s.sectionTitle} minPresenceAhead={75}>
      {children}
    </Text>
  );
}
function Narrative({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((paragraph, i) => (
          <Text key={i} style={s.body} orphans={3} widows={3}>
            {paragraph.trim()}
          </Text>
        ))}
    </>
  );
}
function Findings({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <View style={s.column}>
      <Text style={s.label} minPresenceAhead={40}>
        {title}
      </Text>
      {items.length ? (
        items.map((item, i) => (
          <Text key={i} style={s.bullet} orphans={2} widows={2}>
            {item}
          </Text>
        ))
      ) : (
        <Text style={s.small}>{empty}</Text>
      )}
    </View>
  );
}
function Recommendation({
  item,
  number,
}: {
  item: RecommendationSummary;
  number: number;
}) {
  const { sections, paragraphs } = presentRecommendationDescription(
    item.description,
  );
  const fields = [
    ["Finding", sections.finding],
    ["Recommended action", sections.recommendedAction],
    ["Expected outcome", sections.expectedOutcome],
    ["Implementation considerations", sections.implementationConsiderations],
  ];
  const renderFields = (rows: typeof fields) =>
    rows.map(([label, value]) =>
      value ? (
        <View key={label} wrap={value.length > 900}>
          <Text style={s.fieldLabel} minPresenceAhead={35}>
            {label}
          </Text>
          <Narrative text={value} />
        </View>
      ) : null,
    );
  const closingLength =
    (sections.expectedOutcome?.length ?? 0) +
    (sections.implementationConsiderations?.length ?? 0) +
    item.businessImpact.length;
  return (
    <View style={s.recommendation}>
      <View wrap={false} minPresenceAhead={65}>
        <Text style={s.recommendationTitle}>
          {String(number).padStart(2, "0")} {item.title}
        </Text>
        <Text style={s.recommendationMeta}>
          {item.priority.toUpperCase()} PRIORITY | {item.categoryName} |{" "}
          {RECOMMENDATION_STATUS_LABELS[item.status]}
        </Text>
      </View>
      {sections.leadingText && <Narrative text={sections.leadingText} />}
      {sections.hasStructuredSections
        ? renderFields(fields.slice(0, 2))
        : paragraphs.map((text, i) => <Narrative key={i} text={text} />)}
      <View wrap={closingLength > 900}>
        {sections.hasStructuredSections ? renderFields(fields.slice(2)) : null}
        {item.businessImpact && (
          <View wrap={item.businessImpact.length > 900}>
            <Text style={s.fieldLabel} minPresenceAhead={35}>
              Business impact
            </Text>
            <Narrative text={item.businessImpact} />
          </View>
        )}
        <View wrap={false} style={{ marginTop: 6 }}>
          {item.suggestedService && (
            <Text style={s.small}>
              Recommended service: {item.suggestedService}
            </Text>
          )}
          <Text style={s.small}>
            Priority-impact rating: {item.estimatedImpactPoints} (planning
            weight; not a guaranteed score increase).
          </Text>
        </View>
      </View>
    </View>
  );
}

export function AssessmentReportDocument({
  data,
}: {
  data: AssessmentReportData;
}) {
  const { summary, clientName, assessmentName, assessmentDate } = data;
  const content = buildAssessmentReportSections(data);
  const meta = getReportTypeMeta("assessment");
  const generatedDate = formatGeneratedDate();
  const customer = Boolean(data.suppressCatalogProjectedMaturity);
  const classification = customer
    ? (summary.overallMaturityLabel ??
      getCustomerMaturityLabel(summary.overallScore))
    : summary.overallRatingLabel;
  const opportunities =
    summary.activeImprovementOpportunityCount ??
    summary.openRecommendationsCount;
  const nextMoves = (
    summary.immediateActions.length
      ? summary.immediateActions
      : content.sortedRecommendations
  )
    .filter((item) => isCustomerActiveOpportunityStatus(item.status))
    .slice(0, 3);
  const narrative =
    data.executiveSummary?.trim() ||
    `${clientName} completed a ${content.assessmentTypeLabel.toLowerCase()} technology maturity assessment. The current StackScore is ${formatMaturityScore(summary.overallScore)} / 100 (${classification}). The following findings and recommendations support improvement planning.`;
  const frame = (
    <>
      <PdfReportHeader
        clientName={clientName}
        generatedDate={generatedDate}
        documentLabel={meta.title}
      />
      <PdfReportFooter clientName={clientName} generatedDate={generatedDate} />
    </>
  );
  return (
    <Document
      title={`${clientName} - ${meta.title}`}
      author={BRAND.companyName}
      subject={meta.subtitle}
    >
      <Page size="LETTER" style={s.page} wrap>
        {frame}
        <View style={s.intro} wrap={false}>
          <Text style={s.eyebrow}>Prepared by {BRAND.companyName}</Text>
          <Text style={s.title}>{meta.title}</Text>
          <Text style={s.subtitle}>{meta.subtitle}</Text>
          <Text style={s.client}>{clientName}</Text>
          <Text style={s.meta}>{assessmentName}</Text>
          <Text style={s.meta}>
            {content.assessmentTypeLabel} assessment | {assessmentDate}
          </Text>
        </View>
        <View style={s.metrics} wrap={false}>
          {[
            {
              label: "Overall StackScore",
              value: `${formatMaturityScore(summary.overallScore)} / 100`,
              hint: classification,
            },
            {
              label: "Improvement opportunities",
              value: String(opportunities),
              hint: "Active recommendations",
            },
            {
              label: "Critical findings",
              value: String(summary.criticalFindingsCount),
              hint: summary.hasCriticalExposure
                ? "Follow-up required"
                : "Assessment findings",
            },
          ].map((m) => (
            <View style={s.metric} key={m.label}>
              <Text style={s.metricLabel}>{m.label}</Text>
              <Text style={s.metricValue}>{m.value}</Text>
              <Text style={s.metricHint}>{m.hint}</Text>
            </View>
          ))}
        </View>
        <View style={s.section}>
          <SectionTitle>Executive Summary</SectionTitle>
          <Narrative text={narrative} />
          {summary.hasCriticalExposure && (
            <View style={s.warning} wrap={false}>
              <Text style={s.warningTitle}>Critical exposure identified</Text>
              <Text style={s.small}>
                Prioritize the security or recovery gaps identified in this
                assessment.
              </Text>
            </View>
          )}
          <View style={s.columns}>
            <Findings
              title="Demonstrated strengths"
              items={content.strengthBullets}
              empty="No assessed pillars meet the demonstrated strength threshold."
            />
            <Findings
              title="Areas of exposure"
              items={content.riskBullets}
              empty="No additional risk areas identified in this assessment."
            />
          </View>
        </View>
        <View style={s.section} wrap={false}>
          <SectionTitle>Your Next Best Moves</SectionTitle>
          {nextMoves.length ? (
            nextMoves.map((item, i) => (
              <View key={item.id} style={s.actionRow} wrap={false}>
                <Text style={s.number}>{String(i + 1).padStart(2, "0")}</Text>
                <Text style={s.action}>{item.title}</Text>
              </View>
            ))
          ) : (
            <Text style={s.small}>
              No pending recommendations are recorded for this assessment.
            </Text>
          )}
        </View>
      </Page>
      <Page size="LETTER" style={s.page} wrap>
        {frame}
        <SectionTitle>Technology Pillars</SectionTitle>
        <Text style={s.small}>
          Scores reflect the completed assessment. Improvement activity is
          tracked separately; reassessment confirms changes to official
          maturity.
        </Text>
        <View style={s.tableHead} wrap={false}>
          <Text style={[s.pillar, { fontFamily: F.bodyBold }]}>
            Technology pillar
          </Text>
          <Text style={s.score}>Score</Text>
          <Text style={s.maturity}>{customer ? "Maturity" : "Rating"}</Text>
        </View>
        {summary.categoryScores.length ? (
          summary.categoryScores.map((category) => (
            <View key={category.categoryId} style={s.tableRow} wrap={false}>
              <View style={s.pillar}>
                <Text>{category.categoryName}</Text>
                <View style={s.track}>
                  <View
                    style={[
                      s.fill,
                      {
                        width: `${Math.max(0, Math.min(100, category.percentScore))}%`,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={s.score}>
                {formatMaturityScore(category.percentScore)}
              </Text>
              <Text style={s.maturity}>
                {customer
                  ? getCustomerMaturityLabel(category.percentScore)
                  : RATING_LABELS[category.rating]}
              </Text>
            </View>
          ))
        ) : (
          <Text style={s.body}>No pillar scores available.</Text>
        )}
        <View style={[s.section, { marginTop: 22 }]}>
          <SectionTitle>Recommendation Summary</SectionTitle>
          <Text style={s.body}>
            {content.clientRecommendations.length} recommendations identified;{" "}
            {opportunities} active improvement opportunities.
          </Text>
          {content.recommendationsByPriority.map((group) => (
            <View key={group.priority} style={s.tableRow} wrap={false}>
              <Text style={{ flex: 1 }}>{group.label}</Text>
              <Text style={{ fontFamily: F.bodyBold }}>
                {group.items.length}
              </Text>
            </View>
          ))}
        </View>
        {!customer && (
          <View style={s.section}>
            <SectionTitle>Internal Planning Estimates</SectionTitle>
            <Text style={s.body}>
              Projected StackScore:{" "}
              {formatMaturityScore(summary.projectedScore)} / 100. Category-max
              estimated improvement: {summary.projectionImpact} points.
            </Text>
            {content.roadmapMilestones.map((milestone) => (
              <View style={s.tableRow} key={milestone.label} wrap={false}>
                <Text style={{ flex: 1 }}>{milestone.label}</Text>
                <Text style={{ fontFamily: F.bodyBold }}>
                  {formatMaturityScore(milestone.score)}
                </Text>
              </View>
            ))}
            <Text style={[s.small, { marginTop: 10 }]}>
              Planning estimates are not verified maturity scores. Actual score
              changes require reassessment.
            </Text>
          </View>
        )}
      </Page>
      <Page size="LETTER" style={s.page} wrap>
        {frame}
        <SectionTitle>Detailed Recommendations</SectionTitle>
        <Text style={s.small}>
          Recommendations are ordered by priority. The following findings,
          actions, and outcomes are taken from the assessment record.
        </Text>
        {content.sortedRecommendations.length ? (
          content.sortedRecommendations.map((item, i) => (
            <Recommendation key={item.id} item={item} number={i + 1} />
          ))
        ) : (
          <Text style={s.body}>No recommendations at this time.</Text>
        )}
      </Page>
    </Document>
  );
}
