import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { RECOMMENDATION_STATUS_LABELS } from "@/lib/assessments/results-summary";
import { BRAND } from "@/lib/branding";
import { BUSINESS_REVIEW_LABEL } from "@/lib/customer-deliverable-labels";
import {
  formatQbrCurrency,
  formatSignedPoints,
  getBudgetUtilizationPercent,
  groupOpportunitiesByPriority,
  roadmapPhaseLabel,
  summarizeCategoryImprovement,
} from "@/lib/qbr/presentation";
import type {
  QbrCategoryImprovement,
  QbrProjectSummary,
  QbrRecommendationSummary,
  QbrReportData,
  QbrRoadmapPhaseSummary,
} from "@/lib/qbr/types";
import { QbrPdfExecutiveDashboard } from "@/lib/pdf/qbr-executive-dashboard";
import {
  COLORS,
  PdfCoverPage,
  PdfEmptyState,
  PdfPriorityBadge,
  PdfReportFooter,
  PdfReportHeader,
  PdfSectionTitle,
  PDF_LAYOUT,
  registerPdfFonts,
} from "@/lib/pdf/shared";
import { formatReportDate } from "@/lib/pdf/types";

registerPdfFonts();

const styles = StyleSheet.create({
  body: {
    paddingTop: PDF_LAYOUT.headerReserve,
    paddingBottom: PDF_LAYOUT.paddingBottom,
    paddingHorizontal: PDF_LAYOUT.paddingHorizontal,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
  cover: {
    paddingTop: 0,
    paddingBottom: PDF_LAYOUT.paddingBottom,
    paddingHorizontal: 0,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: COLORS.slate,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: COLORS.white,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 4,
    lineHeight: 1.35,
  },
  cardMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
    alignItems: "center",
  },
  metaText: {
    fontSize: 8,
    color: COLORS.muted,
  },
  chip: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardBody: {
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.slate,
  },
  grid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridItem: {
    width: "48%",
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  budgetLabel: {
    fontSize: 9,
    color: COLORS.muted,
  },
  budgetValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  listItem: {
    fontSize: 10,
    lineHeight: 1.5,
    color: COLORS.slate,
    marginBottom: 4,
    paddingLeft: 8,
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
});

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return formatReportDate(iso);
  } catch {
    return iso;
  }
}

function PageChrome({ data }: { data: QbrReportData }) {
  const score = data.scoreAtPeriodEnd ?? data.currentStackScore ?? undefined;
  return (
    <>
      <PdfReportHeader
        clientName={data.clientName}
        generatedDate={data.generatedDateLabel}
        documentLabel={BUSINESS_REVIEW_LABEL}
        technologyScore={score ?? undefined}
      />
      <PdfReportFooter
        generatedDate={data.generatedDateLabel}
        clientName={data.clientName}
        documentVersion="1.0"
      />
    </>
  );
}

function CategoryCard({ row }: { row: QbrCategoryImprovement }) {
  const delta = formatSignedPoints(row.change);
  return (
    <View wrap={false} style={[styles.card, styles.gridItem]}>
      <Text style={styles.cardTitle}>{row.categoryName}</Text>
      <View style={styles.cardMeta}>
        <Text style={styles.metaText}>
          {row.previousScore ?? "—"} → {row.currentScore ?? "—"}
        </Text>
        <Text style={styles.chip}>{delta}</Text>
      </View>
      <Text style={styles.cardBody}>{summarizeCategoryImprovement(row)}</Text>
    </View>
  );
}

function RecommendationCard({
  item,
  showResolvedDate,
}: {
  item: QbrRecommendationSummary;
  showResolvedDate?: boolean;
}) {
  return (
    <View wrap={false} style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.cardMeta}>
        <PdfPriorityBadge priority={item.priority} />
        <Text style={styles.chip}>{item.categoryName}</Text>
        <Text style={styles.chip}>
          {RECOMMENDATION_STATUS_LABELS[item.status] ?? item.status}
        </Text>
        {showResolvedDate && item.resolvedAt ? (
          <Text style={styles.metaText}>Completed {formatShortDate(item.resolvedAt)}</Text>
        ) : null}
      </View>
      {item.businessImpact ? <Text style={styles.cardBody}>{item.businessImpact}</Text> : null}
    </View>
  );
}

function ProjectCard({ project }: { project: QbrProjectSummary }) {
  return (
    <View wrap={false} style={styles.card}>
      <Text style={styles.cardTitle}>{project.title}</Text>
      <View style={styles.cardMeta}>
        <Text style={styles.chip}>Completed</Text>
        <Text style={styles.metaText}>{formatShortDate(project.completedAt)}</Text>
        {project.impactPoints != null ? (
          <Text style={styles.chip}>+{project.impactPoints} pts</Text>
        ) : null}
      </View>
      {project.description ? <Text style={styles.cardBody}>{project.description}</Text> : null}
    </View>
  );
}

function RoadmapCard({ phase }: { phase: QbrRoadmapPhaseSummary }) {
  return (
    <View wrap={false} style={styles.card}>
      <Text style={styles.cardTitle}>{phase.phaseName}</Text>
      <View style={styles.cardMeta}>
        <Text style={styles.chip}>{roadmapPhaseLabel(phase.status)}</Text>
        <Text style={styles.metaText}>{phase.timeframe}</Text>
        <Text style={styles.metaText}>
          {phase.initiativeCount} initiative{phase.initiativeCount === 1 ? "" : "s"}
        </Text>
      </View>
      {phase.summary ? <Text style={styles.cardBody}>{phase.summary}</Text> : null}
    </View>
  );
}

export function QbrReportDocument({ data }: { data: QbrReportData }) {
  const opportunityGroups = groupOpportunitiesByPriority(data.remainingOpportunities);
  const budgetUtilization = getBudgetUtilizationPercent(data.budgetForecast);
  const scoreEnd = data.scoreAtPeriodEnd ?? data.currentStackScore;

  return (
    <Document
      title={`${data.clientName} — ${BUSINESS_REVIEW_LABEL}`}
      author={BRAND.companyName}
      subject={BUSINESS_REVIEW_LABEL}
      keywords="Business Review, StackScore, technology maturity"
    >
      {/* Cover */}
      <Page size="LETTER" style={styles.cover} wrap={false}>
        <PdfReportFooter
          generatedDate={data.generatedDateLabel}
          clientName={data.clientName}
          documentVersion="1.0"
        />
        <PdfCoverPage
          eyebrow={`Prepared by ${BRAND.companyName} · ${BRAND.productName}`}
          title={BUSINESS_REVIEW_LABEL}
          subtitle="Review-period performance, outcomes, and upcoming priorities"
          clientName={data.clientName}
          meta={[
            { label: "Review Period", value: data.reviewPeriodLabel },
            { label: "Generated", value: data.generatedDateLabel },
            { label: "Maturity Tier", value: data.currentMaturityLabel ?? "—" },
            { label: "Document", value: data.title },
            {
              label: "Technology Score",
              value: scoreEnd != null ? String(scoreEnd) : "—",
            },
            {
              label: "Change vs Prior",
              value: formatSignedPoints(data.scoreChange),
            },
          ]}
          confidentialNotice={`Prepared exclusively for ${data.clientName}. Unauthorized distribution prohibited.`}
        />
      </Page>

      {/* Executive dashboard */}
      <Page size="LETTER" style={styles.body} wrap>
        <PageChrome data={data} />
        <QbrPdfExecutiveDashboard data={data} />
      </Page>

      {/* Executive summary */}
      <Page size="LETTER" style={styles.body} wrap>
        <PageChrome data={data} />
        <PdfSectionTitle
          title="Executive Summary"
          subtitle="Strategic narrative for leadership"
        />
        {(data.executiveSummary || "")
          .trim()
          .split(/\n\n+/)
          .filter(Boolean)
          .map((paragraph, index) => (
            <Text key={`summary-${index}`} style={styles.bodyText}>
              {paragraph.trim()}
            </Text>
          ))}
        {!data.executiveSummary?.trim() ? (
          <PdfEmptyState
            title="Executive summary unavailable"
            description="Generate or edit the Business Review to include a leadership summary."
          />
        ) : null}
      </Page>

      {/* Technology health */}
      <Page size="LETTER" style={styles.body} wrap>
        <PageChrome data={data} />
        <PdfSectionTitle
          title="Technology Health"
          subtitle="Category improvements across the review period"
        />
        {data.categoryImprovements.length === 0 ? (
          <PdfEmptyState
            title="No category history yet"
            description="Category score movement will appear after consecutive reviews."
          />
        ) : (
          <View style={styles.grid2}>
            {data.categoryImprovements.map((row) => (
              <CategoryCard key={row.categoryName} row={row} />
            ))}
          </View>
        )}
      </Page>

      {/* Completed work */}
      <Page size="LETTER" style={styles.body} wrap>
        <PageChrome data={data} />
        <PdfSectionTitle
          title="Completed Work"
          subtitle="Projects and recommendations closed during this review period"
        />
        <Text style={[styles.panelTitle, { marginBottom: 8 }]}>Completed Projects</Text>
        {data.completedProjects.length === 0 ? (
          <PdfEmptyState
            title="No projects completed in this period"
            description="Completed projects will appear here when delivery work closes."
          />
        ) : (
          data.completedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}

        <PdfSectionTitle
          title="Resolved Recommendations"
          subtitle="Closed improvement opportunities with business impact"
        />
        {data.resolvedRecommendations.length === 0 ? (
          <PdfEmptyState
            title="No recommendations resolved in this period"
            description="Resolved items will appear as recommendations are closed."
          />
        ) : (
          data.resolvedRecommendations.map((item) => (
            <RecommendationCard key={item.id} item={item} showResolvedDate />
          ))
        )}
      </Page>

      {/* Opportunities + risks */}
      <Page size="LETTER" style={styles.body} wrap>
        <PageChrome data={data} />
        <PdfSectionTitle
          title="Remaining Opportunities"
          subtitle="Open recommendations prioritized for continued improvement"
        />
        {opportunityGroups.length === 0 ? (
          <PdfEmptyState
            title="No open opportunities"
            description="All tracked recommendations are currently closed."
          />
        ) : (
          opportunityGroups.map((group) => (
            <View key={group.priority} style={{ marginBottom: 12 }}>
              <Text style={styles.panelTitle}>
                {group.label} Priority ({group.items.length})
              </Text>
              {group.items.map((item) => (
                <RecommendationCard key={item.id} item={item} />
              ))}
            </View>
          ))
        )}

        <PdfSectionTitle
          title="Top Risks"
          subtitle="Technology and operational risks requiring leadership attention"
        />
        {data.technologyRisks.length === 0 ? (
          <PdfEmptyState
            title="No elevated risks recorded"
            description="Risk callouts will appear when the review identifies material exposure."
          />
        ) : (
          data.technologyRisks.map((risk, index) => (
            <View key={`risk-${index}`} wrap={false} style={styles.card}>
              <Text style={styles.cardTitle}>Risk {index + 1}</Text>
              <Text style={styles.cardBody}>{risk}</Text>
            </View>
          ))
        )}
      </Page>

      {/* Roadmap + investment */}
      <Page size="LETTER" style={styles.body} wrap>
        <PageChrome data={data} />
        <PdfSectionTitle
          title="Roadmap Progress"
          subtitle="Living execution plan phases tracked for this organization"
        />
        {data.roadmapPhases.length === 0 ? (
          <PdfEmptyState
            title="No roadmap phases available"
            description="Roadmap phases will appear once a Living Execution Plan is in place."
          />
        ) : (
          data.roadmapPhases.map((phase) => (
            <RoadmapCard key={`${phase.phaseName}-${phase.timeframe}`} phase={phase} />
          ))
        )}

        <PdfSectionTitle
          title="Technology Investment Summary"
          subtitle="Planned, completed, and recurring investment for the review horizon"
        />
        {!data.budgetForecast ? (
          <PdfEmptyState
            title="Investment forecast unavailable"
            description="Budget totals will appear when roadmap investment data is present."
          />
        ) : (
          <View style={styles.panel} wrap={false}>
            {[
              {
                label: "Completed investment",
                value: formatQbrCurrency(data.budgetForecast.completedInvestment),
              },
              {
                label: "Planned investment",
                value: formatQbrCurrency(data.budgetForecast.plannedInvestment),
              },
              {
                label: "Deferred investment",
                value: formatQbrCurrency(data.budgetForecast.deferredInvestment),
              },
              {
                label: "Monthly services",
                value: `${formatQbrCurrency(data.budgetForecast.monthlyServices)}/mo`,
              },
              {
                label: "Estimated three-year investment",
                value: formatQbrCurrency(data.budgetForecast.estimatedThreeYearInvestment),
              },
              {
                label: "Budget utilization",
                value: budgetUtilization !== null ? `${budgetUtilization}%` : "—",
              },
            ].map((row) => (
              <View key={row.label} style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>{row.label}</Text>
                <Text style={styles.budgetValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>

      {/* Next priorities + closing */}
      <Page size="LETTER" style={styles.body} wrap>
        <PageChrome data={data} />
        <PdfSectionTitle
          title="Next Review Priorities"
          subtitle="Recommended actions before the next Business Review"
        />
        {data.nextQuarterPriorities.length === 0 ? (
          <PdfEmptyState
            title="No next-period priorities listed"
            description="Priorities will appear when the review identifies upcoming strategic actions."
          />
        ) : (
          data.nextQuarterPriorities.map((priority, index) => (
            <Text key={`priority-${index}`} style={styles.listItem}>
              {index + 1}. {priority}
            </Text>
          ))
        )}

        {data.strategicRecommendations.length > 0 ? (
          <>
            <PdfSectionTitle
              title="Strategic Recommendations"
              subtitle="Leadership guidance drawn from this review"
            />
            {data.strategicRecommendations.map((item, index) => (
              <Text key={`strategic-${index}`} style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </>
        ) : null}

        <PdfSectionTitle title="Business Alignment" subtitle="Goals and technology vision progress" />
        <View style={styles.panel} wrap={false}>
          <Text style={styles.panelTitle}>Business Goal</Text>
          <Text style={styles.bodyText}>{data.businessGoalLabel ?? "Not specified"}</Text>
          <Text style={styles.cardBody}>{data.businessGoalProgress}</Text>
        </View>
        <View style={styles.panel} wrap={false}>
          <Text style={styles.panelTitle}>Technology Vision</Text>
          <Text style={styles.bodyText}>{data.technologyVision ?? "Not specified"}</Text>
          <Text style={styles.cardBody}>{data.visionProgress}</Text>
        </View>

        <PdfSectionTitle
          title="Closing Summary"
          subtitle="Report metadata and confidentiality"
        />
        <View style={styles.panel} wrap={false}>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Organization</Text>
            <Text style={styles.budgetValue}>{data.clientName}</Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Review period</Text>
            <Text style={styles.budgetValue}>{data.reviewPeriodLabel}</Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Generated</Text>
            <Text style={styles.budgetValue}>{data.generatedDateLabel}</Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Prepared by</Text>
            <Text style={styles.budgetValue}>{BRAND.companyName}</Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Platform</Text>
            <Text style={styles.budgetValue}>{BRAND.productName}</Text>
          </View>
        </View>
        <Text style={[styles.cardBody, { marginTop: 8 }]}>
          CONFIDENTIAL — This Business Review was prepared exclusively for {data.clientName}. It
          may not be reproduced or distributed without written consent from {BRAND.companyName}.
        </Text>
      </Page>
    </Document>
  );
}
