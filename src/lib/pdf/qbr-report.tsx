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
  PdfPriorityBadge,
  PdfReportFooter,
  PdfReportHeader,
  PDF_LAYOUT,
  registerPdfFonts,
} from "@/lib/pdf/shared";
import { REPORT_FONTS, REPORT_COLORS } from "@/lib/pdf/shared/tokens";
import { formatReportDate } from "@/lib/pdf/types";

registerPdfFonts();

const styles = StyleSheet.create({
  body: {
    paddingTop: 88,
    paddingBottom: PDF_LAYOUT.paddingBottom,
    paddingHorizontal: PDF_LAYOUT.paddingHorizontal,
    fontFamily: REPORT_FONTS.body,
    fontSize: 10,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
  cover: {
    paddingTop: 0,
    paddingBottom: PDF_LAYOUT.paddingBottom,
    paddingHorizontal: 0,
    fontFamily: REPORT_FONTS.body,
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
    borderRadius: 0,
    padding: 12,
    marginBottom: 8,
    backgroundColor: COLORS.white,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: REPORT_FONTS.bodyBold,
    color: REPORT_COLORS.ink,
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
    fontFamily: REPORT_FONTS.bodyBold,
    color: REPORT_COLORS.ink,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 0,
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
    fontFamily: REPORT_FONTS.bodyBold,
    color: REPORT_COLORS.ink,
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
    borderRadius: 0,
    padding: 12,
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 9,
    fontFamily: REPORT_FONTS.bodyBold,
    color: REPORT_COLORS.ink,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
});

function PdfSectionTitle({
  title,
  subtitle,
  keepWithNext = 65,
}: {
  title: string;
  subtitle?: string;
  keepWithNext?: number;
}) {
  return (
    <View
      wrap={false}
      minPresenceAhead={keepWithNext}
      style={{ marginTop: 12, marginBottom: 10 }}
    >
      <Text
        style={{
          fontFamily: REPORT_FONTS.displayBold,
          fontSize: 15,
          paddingBottom: 6,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontSize: 9,
            color: COLORS.muted,
            lineHeight: 1.4,
            marginTop: 5,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function PdfEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={{ marginBottom: 14 }} wrap={false}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{description}</Text>
    </View>
  );
}

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return formatReportDate(iso);
  } catch {
    return iso;
  }
}

function PageChrome({ data }: { data: QbrReportData }) {
  return (
    <>
      <PdfReportHeader
        clientName={data.clientName}
        generatedDate={data.generatedDateLabel}
        documentLabel={BUSINESS_REVIEW_LABEL}
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
    <View wrap={item.businessImpact.length > 900} style={styles.card}>
      <Text style={styles.cardTitle} minPresenceAhead={45}>
        {item.title}
      </Text>
      <View style={styles.cardMeta}>
        <PdfPriorityBadge priority={item.priority} />
        <Text style={styles.chip}>{item.categoryName}</Text>
        <Text style={styles.chip}>
          {RECOMMENDATION_STATUS_LABELS[item.status] ?? item.status}
        </Text>
        {showResolvedDate && item.resolvedAt ? (
          <Text style={styles.metaText}>
            Completed {formatShortDate(item.resolvedAt)}
          </Text>
        ) : null}
      </View>
      {item.businessImpact ? (
        <Text style={styles.cardBody}>{item.businessImpact}</Text>
      ) : null}
    </View>
  );
}

function ProjectCard({ project }: { project: QbrProjectSummary }) {
  return (
    <View wrap={(project.description?.length ?? 0) > 900} style={styles.card}>
      <Text style={styles.cardTitle} minPresenceAhead={45}>
        {project.title}
      </Text>
      <View style={styles.cardMeta}>
        <Text style={styles.chip}>Completed</Text>
        <Text style={styles.metaText}>
          {formatShortDate(project.completedAt)}
        </Text>
        {project.impactPoints != null ? (
          <Text style={styles.chip}>+{project.impactPoints} pts</Text>
        ) : null}
      </View>
      {project.description ? (
        <Text style={styles.cardBody}>{project.description}</Text>
      ) : null}
    </View>
  );
}

function RoadmapCard({ phase }: { phase: QbrRoadmapPhaseSummary }) {
  return (
    <View wrap={(phase.summary?.length ?? 0) > 900} style={styles.card}>
      <Text style={styles.cardTitle} minPresenceAhead={45}>
        {phase.phaseName}
      </Text>
      <View style={styles.cardMeta}>
        <Text style={styles.chip}>{roadmapPhaseLabel(phase.status)}</Text>
        <Text style={styles.metaText}>{phase.timeframe}</Text>
        <Text style={styles.metaText}>
          {phase.initiativeCount} initiative
          {phase.initiativeCount === 1 ? "" : "s"}
        </Text>
      </View>
      {phase.summary ? (
        <Text style={styles.cardBody}>{phase.summary}</Text>
      ) : null}
    </View>
  );
}

export function QbrReportDocument({ data }: { data: QbrReportData }) {
  const opportunityGroups = groupOpportunitiesByPriority(
    data.remainingOpportunities,
  );
  const budgetUtilization = getBudgetUtilizationPercent(data.budgetForecast);

  return (
    <Document
      title={`${data.clientName} — ${BUSINESS_REVIEW_LABEL}`}
      author={BRAND.companyName}
      subject={BUSINESS_REVIEW_LABEL}
      keywords="Business Review, StackScore, technology maturity"
    >
      <Page size="LETTER" style={styles.body} wrap>
        <PageChrome data={data} />
        <View
          wrap={false}
          style={{
            paddingBottom: 14,
            marginBottom: 16,
            borderBottomWidth: 2,
            borderBottomColor: COLORS.accent,
          }}
        >
          <Text
            style={{
              fontSize: 8,
              color: COLORS.accent,
              fontFamily: REPORT_FONTS.bodyBold,
              letterSpacing: 1,
              marginBottom: 7,
            }}
          >
            PREPARED BY {BRAND.companyName.toUpperCase()}
          </Text>
          <Text
            style={{
              fontSize: 25,
              fontFamily: REPORT_FONTS.displayBold,
              lineHeight: 1.15,
              marginBottom: 8,
            }}
          >
            {BUSINESS_REVIEW_LABEL}
          </Text>
          <Text style={styles.cardBody}>
            Review-period performance, outcomes, and upcoming priorities
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: REPORT_FONTS.bodyBold,
              marginTop: 10,
              marginBottom: 4,
            }}
          >
            {data.clientName}
          </Text>
          <Text style={styles.cardBody}>{data.title}</Text>
          <Text style={styles.metaText}>
            {data.reviewPeriodLabel} | Prepared {data.generatedDateLabel}
          </Text>
        </View>
        <QbrPdfExecutiveDashboard data={data} />
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
        <PdfSectionTitle
          title="Completed Work"
          subtitle="Projects and recommendations closed during this review period"
        />
        <Text style={[styles.panelTitle, { marginBottom: 8 }]}>
          Completed Projects
        </Text>
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
        <PdfSectionTitle
          title="Remaining Opportunities"
          keepWithNext={140}
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
              <Text style={styles.panelTitle} minPresenceAhead={100}>
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
            <View
              key={`risk-${index}`}
              wrap={risk.length > 900}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>Risk {index + 1}</Text>
              <Text style={styles.cardBody}>{risk}</Text>
            </View>
          ))
        )}
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
            <RoadmapCard
              key={`${phase.phaseName}-${phase.timeframe}`}
              phase={phase}
            />
          ))
        )}

        <View wrap={false}>
          <PdfSectionTitle
            title="Technology Investment Summary"
            subtitle="Recorded spend and approved planning figures for the review horizon"
          />
          {!data.budgetForecast ? (
            <PdfEmptyState
              title="Investment quotations not included"
              description="Implementation costs are scoped with Bobkat IT. This review focuses on technology improvement progress rather than speculative estimates."
            />
          ) : (
            <View style={styles.panel} wrap={false}>
              {[
                data.budgetForecast.completedInvestment > 0
                  ? {
                      label: "Completed investment",
                      value: formatQbrCurrency(
                        data.budgetForecast.completedInvestment,
                      ),
                    }
                  : null,
                data.budgetForecast.plannedInvestment > 0
                  ? {
                      label: "Planned investment",
                      value: formatQbrCurrency(
                        data.budgetForecast.plannedInvestment,
                      ),
                    }
                  : null,
                data.budgetForecast.deferredInvestment > 0
                  ? {
                      label: "Deferred investment",
                      value: formatQbrCurrency(
                        data.budgetForecast.deferredInvestment,
                      ),
                    }
                  : null,
                data.budgetForecast.monthlyServices > 0
                  ? {
                      label: "Monthly services",
                      value: `${formatQbrCurrency(data.budgetForecast.monthlyServices)}/mo`,
                    }
                  : null,
                data.budgetForecast.estimatedThreeYearInvestment > 0
                  ? {
                      label: "Estimated three-year investment",
                      value: formatQbrCurrency(
                        data.budgetForecast.estimatedThreeYearInvestment,
                      ),
                    }
                  : null,
                data.budgetForecast.plannedInvestment > 0 &&
                budgetUtilization !== null
                  ? {
                      label: "Budget utilization",
                      value: `${budgetUtilization}%`,
                    }
                  : null,
              ]
                .filter(
                  (row): row is { label: string; value: string } => row != null,
                )
                .map((row) => (
                  <View key={row.label} style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>{row.label}</Text>
                    <Text style={styles.budgetValue}>{row.value}</Text>
                  </View>
                ))}
            </View>
          )}
        </View>
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

        <PdfSectionTitle
          title="Business Alignment"
          subtitle="Goals and technology vision progress"
        />
        <View
          style={styles.panel}
          wrap={
            (data.businessGoalLabel?.length ?? 0) +
              data.businessGoalProgress.length >
            900
          }
        >
          <Text style={styles.panelTitle}>Business Goal</Text>
          <Text style={styles.bodyText}>
            {data.businessGoalLabel ?? "Not specified"}
          </Text>
          <Text style={styles.cardBody}>{data.businessGoalProgress}</Text>
        </View>
        <View
          style={styles.panel}
          wrap={
            (data.technologyVision?.length ?? 0) + data.visionProgress.length >
            900
          }
        >
          <Text style={styles.panelTitle}>Technology Vision</Text>
          <Text style={styles.bodyText}>
            {data.technologyVision ?? "Not specified"}
          </Text>
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
          CONFIDENTIAL — This Business Review was prepared exclusively for{" "}
          {data.clientName}. It may not be reproduced or distributed without
          written consent from {BRAND.companyName}.
        </Text>
      </Page>
    </Document>
  );
}
