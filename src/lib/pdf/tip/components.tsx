import type { ReactNode } from "react";
import { Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { PdfProgressBar } from "@/lib/pdf/shared/components/report-bar";
import { COLORS } from "@/lib/pdf/shared/colors";
import { PdfTipReportFooter } from "@/lib/pdf/tip/footer";
import { PdfTipReportHeader } from "@/lib/pdf/tip/header";
import {
  canKeepCardIntact,
  cardStartPresence,
  estimateBusinessValueFirstRowHeight,
  estimateBusinessValueMetricCardHeight,
  estimateCalloutIntroHeight,
  estimateExecutiveHeroHeight,
  estimateFindingCardHeight,
  estimateInitiativeCardHeight,
  estimateInvestmentTableHeight,
  estimateNextStepCardHeight,
  estimateScopeBoxHeight,
} from "@/lib/pdf/tip/pagination";
import { PdfTipSection } from "@/lib/pdf/tip/section";
import { TIP_PAGINATION } from "@/lib/pdf/tip/tokens";
import type { TipReportData } from "@/lib/pdf/types";
import type {
  TipBusinessValueMetric,
  TipCategoryFinding,
  TipPhaseInvestmentRow,
  TipStrategicInitiative,
} from "@/lib/pdf/types";
import {
  PRIORITY_BADGE_STYLES,
  RISK_BADGE_STYLES,
  tipPdfStyles as styles,
} from "./styles";

export function PdfTipPageChrome({ data }: { data: TipReportData }) {
  return (
    <>
      <PdfTipReportHeader
        clientName={data.clientName}
        generatedDate={data.generatedDate}
        technologyScore={data.currentScore}
        reportVersion={String(data.version)}
      />
      <PdfTipReportFooter
        generatedDate={data.generatedDate}
        clientName={data.clientName}
        documentVersion={String(data.version)}
      />
    </>
  );
}

export function PdfAssessmentScope() {
  return (
    <PdfTipSection
      title="Assessment Scope"
      firstBlockMinHeight={estimateScopeBoxHeight()}
      firstBlock={
        <View wrap={false} style={styles.scopeBox}>
          <Text style={styles.scopeText}>
            This assessment evaluates technology maturity using industry best practices and
            organizational information provided during the assessment process. It is intended to
            identify strategic improvement opportunities and support executive decision-making.
          </Text>
          <Text style={[styles.scopeText, { marginTop: 5 }]}>
            This document is not a penetration test, compliance audit, or technical implementation
            guide. Detailed execution planning, product selection, and deployment methodology are
            reserved for an ongoing consulting partnership with {BRAND.companyName}.
          </Text>
        </View>
      }
    />
  );
}

function PdfTipKpiCard({
  label,
  value,
  caption,
  highlight = false,
}: {
  label: string;
  value: string | number;
  caption?: string;
  highlight?: boolean;
}) {
  return (
    <View style={highlight ? styles.kpiCardHighlight : styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {caption ? <Text style={styles.kpiCaption}>{caption}</Text> : null}
    </View>
  );
}

export function PdfExecutiveSummaryDashboard({
  clientName,
  assessmentDate,
  currentScore,
  projectedScore,
  maturityTierLabel,
  overallBusinessRisk,
  executiveSummary,
  topBusinessRisks,
  topOpportunities,
}: {
  clientName: string;
  assessmentDate: string;
  currentScore: number;
  projectedScore: number;
  maturityTierLabel: string;
  overallBusinessRisk: string;
  executiveSummary: string;
  topBusinessRisks: string[];
  topOpportunities: string[];
}) {
  return (
    <PdfTipSection
      title="Executive Summary"
      firstBlockMinHeight={estimateExecutiveHeroHeight()}
      firstBlock={
        <View wrap={false} style={styles.executiveHero}>
          <View style={styles.executiveMetaRow}>
            <View style={styles.executiveMetaItem}>
              <Text style={styles.executiveMetaLabel}>Organization</Text>
              <Text style={styles.executiveMetaValue}>{clientName}</Text>
            </View>
            <View style={styles.executiveMetaItem}>
              <Text style={styles.executiveMetaLabel}>Assessment Date</Text>
              <Text style={styles.executiveMetaValue}>{assessmentDate}</Text>
            </View>
            <View style={styles.executiveMetaItem}>
              <Text style={styles.executiveMetaLabel}>Overall Business Risk</Text>
              <Text style={styles.executiveMetaValue}>{overallBusinessRisk}</Text>
            </View>
          </View>
          <View style={styles.kpiRow}>
            <PdfTipKpiCard label="StackScore" value={currentScore} caption="Current (0–100)" />
            <PdfTipKpiCard
              label="Projected Score"
              value={projectedScore}
              caption="After roadmap"
              highlight
            />
            <PdfTipKpiCard
              label="Technology Maturity"
              value={maturityTierLabel}
              caption="Current level"
            />
          </View>
        </View>
      }
    >
      <Text style={styles.bodyText} orphans={2} widows={2}>
        {executiveSummary}
      </Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.blockLabel} minPresenceAhead={28}>
            Top Business Risks
          </Text>
          {topBusinessRisks.map((risk) => (
            <View key={risk} wrap={false} style={styles.checklistRow}>
              <Text style={[styles.checklistMark, { color: COLORS.critical }]}>!</Text>
              <Text style={styles.checklistText}>{risk}</Text>
            </View>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.blockLabel} minPresenceAhead={28}>
            Top Opportunities
          </Text>
          {topOpportunities.map((item) => (
            <View key={item} wrap={false} style={styles.checklistRow}>
              <Text style={styles.checklistMark}>+</Text>
              <Text style={styles.checklistText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </PdfTipSection>
  );
}

function PdfBusinessValueMetricCard({ metric }: { metric: TipBusinessValueMetric }) {
  return (
    <View wrap={false} style={styles.valueMetricCard}>
      <Text style={styles.valueMetricLabel}>{metric.label}</Text>
      <View style={styles.valueMetricCompare}>
        <View>
          <Text style={styles.valueMetricCaption}>Current</Text>
          <Text style={styles.valueMetricValue}>{metric.currentPercent}%</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.valueMetricCaption}>Projected</Text>
          <Text style={[styles.valueMetricValue, { color: COLORS.success }]}>
            {metric.projectedPercent}%
          </Text>
        </View>
      </View>
      <PdfProgressBar percent={metric.projectedPercent} variant="improvement" height={5} />
    </View>
  );
}

export function PdfBusinessValueSnapshot({
  metrics,
}: {
  metrics: TipBusinessValueMetric[];
}) {
  const firstRowMetrics = metrics.slice(0, 2);
  const remainingMetrics = metrics.slice(2);

  return (
    <PdfTipSection
      title="Business Value Snapshot"
      subtitle="Projected maturity improvements after completing the strategic roadmap"
      firstBlockMinHeight={estimateBusinessValueFirstRowHeight(firstRowMetrics.length)}
      firstBlock={
        firstRowMetrics.length > 0 ? (
          <View
            wrap={false}
            style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}
          >
            {firstRowMetrics.map((metric) => (
              <PdfBusinessValueMetricCard key={metric.label} metric={metric} />
            ))}
          </View>
        ) : null
      }
    >
      {remainingMetrics.length > 0 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {remainingMetrics.map((metric) => (
            <PdfBusinessValueMetricCard key={metric.label} metric={metric} />
          ))}
        </View>
      ) : null}
    </PdfTipSection>
  );
}

function PdfRiskBadge({ level }: { level: TipCategoryFinding["riskLevel"] }) {
  const palette = RISK_BADGE_STYLES[level];
  return (
    <Text
      style={[
        styles.badge,
        {
          backgroundColor: palette.bg,
          color: palette.text,
          borderColor: palette.border,
        },
      ]}
    >
      Risk: {level}
    </Text>
  );
}

function PdfPriorityBadge({ level }: { level: TipCategoryFinding["priority"] }) {
  const palette = PRIORITY_BADGE_STYLES[level];
  return (
    <Text
      style={[
        styles.badge,
        {
          backgroundColor: palette.bg,
          color: palette.text,
          borderColor: palette.border,
        },
      ]}
    >
      Priority: {level}
    </Text>
  );
}

/**
 * Label + body stay together. minPresenceAhead on the label prevents orphaned headings.
 */
function PdfFieldBlock({ label, body }: { label: string; body: string }) {
  return (
    <View style={styles.fieldBlock} wrap={false}>
      <Text style={styles.fieldLabel} minPresenceAhead={TIP_PAGINATION.fieldBlock}>
        {label}
      </Text>
      <Text style={styles.fieldBody} orphans={2} widows={2}>
        {body}
      </Text>
    </View>
  );
}

function PdfInitiativeBadges({ initiative }: { initiative: TipStrategicInitiative }) {
  return (
    <View style={styles.badgeRow}>
      <PdfPriorityBadge level={initiative.priority} />
      <Text
        style={[
          styles.badge,
          {
            backgroundColor: COLORS.surface,
            color: COLORS.navy,
            borderColor: COLORS.border,
          },
        ]}
      >
        {initiative.recommendedPhase}
      </Text>
      <Text
        style={[
          styles.badge,
          {
            backgroundColor: COLORS.surface,
            color: COLORS.navy,
            borderColor: COLORS.border,
          },
        ]}
      >
        {initiative.estimatedInvestment}
      </Text>
    </View>
  );
}

function PdfInitiativeBenefits({ benefits }: { benefits: string[] }) {
  if (benefits.length === 0) return null;
  return (
    <View wrap={false}>
      <Text style={styles.fieldLabel} minPresenceAhead={TIP_PAGINATION.fieldBlock}>
        Expected Benefits
      </Text>
      {benefits.map((benefit) => (
        <View key={benefit} wrap={false} style={styles.checklistRow}>
          <Text style={styles.checklistMark}>+</Text>
          <Text style={styles.checklistText}>{benefit}</Text>
        </View>
      ))}
    </View>
  );
}

export function PdfCategoryFindingCard({
  finding,
  part = "full",
  skipLeadSentinel = false,
}: {
  finding: TipCategoryFinding;
  part?: "full" | "lead" | "tail";
  skipLeadSentinel?: boolean;
}) {
  const estimated = estimateFindingCardHeight(finding);
  const keepIntact = canKeepCardIntact(estimated);

  const startPresence = cardStartPresence(estimated, TIP_PAGINATION.findingCard);

  const leadBody = (
    <>
      <Text style={styles.findingTitle}>{finding.categoryName}</Text>
      <View style={styles.badgeRow}>
        <PdfRiskBadge level={finding.riskLevel} />
        <PdfPriorityBadge level={finding.priority} />
      </View>
      <PdfFieldBlock label="Current State" body={finding.currentState} />
    </>
  );

  if (part === "tail") {
    return (
      <View style={styles.findingCard}>
        <PdfFieldBlock label="Business Impact" body={finding.businessImpact} />
      </View>
    );
  }

  if (part === "lead") {
    return (
      <View style={styles.findingCard}>
        <View wrap={false}>{leadBody}</View>
      </View>
    );
  }

  if (keepIntact) {
    return (
      <>
        {!skipLeadSentinel ? (
          <View style={{ height: 0 }} minPresenceAhead={startPresence} />
        ) : null}
        <View wrap={false} style={styles.findingCard}>
          {leadBody}
          <PdfFieldBlock label="Business Impact" body={finding.businessImpact} />
        </View>
      </>
    );
  }

  return (
    <>
      {!skipLeadSentinel ? (
        <View style={{ height: 0 }} minPresenceAhead={TIP_PAGINATION.findingCard} />
      ) : null}
      <View style={styles.findingCard}>
        <View wrap={false}>
          <Text style={styles.findingTitle} minPresenceAhead={TIP_PAGINATION.initiativeHeader}>
            {finding.categoryName}
          </Text>
          <View style={styles.badgeRow}>
            <PdfRiskBadge level={finding.riskLevel} />
            <PdfPriorityBadge level={finding.priority} />
          </View>
          <PdfFieldBlock label="Current State" body={finding.currentState} />
        </View>
        <PdfFieldBlock label="Business Impact" body={finding.businessImpact} />
      </View>
    </>
  );
}

export function PdfCurrentStateFindings({
  findings,
}: {
  findings: TipCategoryFinding[];
}) {
  const [firstFinding, ...remainingFindings] = findings;
  let firstBlock: ReactNode = null;
  let firstBlockMinHeight = 0;
  const leadingChildren: ReactNode[] = [];

  if (firstFinding) {
    const estimated = estimateFindingCardHeight(firstFinding);
    if (canKeepCardIntact(estimated)) {
      firstBlock = (
        <PdfCategoryFindingCard finding={firstFinding} skipLeadSentinel />
      );
      firstBlockMinHeight = estimated;
    } else {
      firstBlock = (
        <PdfCategoryFindingCard finding={firstFinding} part="lead" skipLeadSentinel />
      );
      firstBlockMinHeight = TIP_PAGINATION.findingLeadFragment;
      leadingChildren.push(
        <PdfCategoryFindingCard
          key={`${firstFinding.categoryName}-tail`}
          finding={firstFinding}
          part="tail"
          skipLeadSentinel
        />,
      );
    }
  }

  return (
    <PdfTipSection
      title="Current State Findings"
      subtitle="Assessment observations grouped by category — focused on business impact, not technical implementation"
      firstBlockMinHeight={firstBlockMinHeight}
      firstBlock={firstBlock}
    >
      {leadingChildren}
      {remainingFindings.map((finding) => (
        <PdfCategoryFindingCard key={finding.categoryName} finding={finding} />
      ))}
    </PdfTipSection>
  );
}

/**
 * Initiative cards stay intact when they fit the printable area.
 * Oversized cards split only between logical field groups — never mid-label.
 */
export function PdfStrategicInitiativeCard({
  initiative,
  part = "full",
  skipLeadSentinel = false,
}: {
  initiative: TipStrategicInitiative;
  part?: "full" | "lead" | "tail";
  skipLeadSentinel?: boolean;
}) {
  const estimated = estimateInitiativeCardHeight(initiative);
  const keepIntact = canKeepCardIntact(estimated);
  const startPresence = cardStartPresence(estimated, TIP_PAGINATION.initiativeFirstField);

  const leadBody = (
    <>
      <Text style={styles.initiativeTitle}>{initiative.name}</Text>
      <PdfInitiativeBadges initiative={initiative} />
      <PdfFieldBlock label="Business Objective" body={initiative.businessObjective} />
    </>
  );

  if (part === "tail") {
    return (
      <View style={styles.initiativeCard}>
        <PdfFieldBlock label="Why It Matters" body={initiative.whyItMatters} />
        <PdfInitiativeBenefits benefits={initiative.expectedBenefits} />
      </View>
    );
  }

  if (part === "lead") {
    return (
      <View style={styles.initiativeCard}>
        <View wrap={false}>{leadBody}</View>
      </View>
    );
  }

  if (keepIntact) {
    return (
      <>
        {!skipLeadSentinel ? (
          <View style={{ height: 0 }} minPresenceAhead={startPresence} />
        ) : null}
        <View wrap={false} style={styles.initiativeCard}>
          {leadBody}
          <PdfFieldBlock label="Why It Matters" body={initiative.whyItMatters} />
          <PdfInitiativeBenefits benefits={initiative.expectedBenefits} />
        </View>
      </>
    );
  }

  return (
    <>
      {!skipLeadSentinel ? (
        <View style={{ height: 0 }} minPresenceAhead={TIP_PAGINATION.initiativeFirstField} />
      ) : null}
      <View style={styles.initiativeCard}>
        <View wrap={false}>
          <Text style={styles.initiativeTitle} minPresenceAhead={TIP_PAGINATION.initiativeHeader}>
            {initiative.name}
          </Text>
          <PdfInitiativeBadges initiative={initiative} />
          <PdfFieldBlock label="Business Objective" body={initiative.businessObjective} />
        </View>
        <PdfFieldBlock label="Why It Matters" body={initiative.whyItMatters} />
        <PdfInitiativeBenefits benefits={initiative.expectedBenefits} />
      </View>
    </>
  );
}

export function PdfStrategicImprovementRoadmap({
  initiatives,
}: {
  initiatives: TipStrategicInitiative[];
}) {
  const [firstInitiative, ...remainingInitiatives] = initiatives;
  let firstBlock: ReactNode = null;
  let firstBlockMinHeight = 0;
  const leadingChildren: ReactNode[] = [];

  if (firstInitiative) {
    const estimated = estimateInitiativeCardHeight(firstInitiative);
    if (canKeepCardIntact(estimated)) {
      firstBlock = (
        <PdfStrategicInitiativeCard initiative={firstInitiative} skipLeadSentinel />
      );
      firstBlockMinHeight = estimated;
    } else {
      firstBlock = (
        <PdfStrategicInitiativeCard initiative={firstInitiative} part="lead" skipLeadSentinel />
      );
      firstBlockMinHeight = TIP_PAGINATION.initiativeLeadFragment;
      leadingChildren.push(
        <PdfStrategicInitiativeCard
          key={`${firstInitiative.id}-tail`}
          initiative={firstInitiative}
          part="tail"
          skipLeadSentinel
        />,
      );
    }
  }

  return (
    <PdfTipSection
      title="Strategic Improvement Roadmap"
      subtitle="What should be accomplished — implementation methodology reserved for consulting engagement"
      firstBlockMinHeight={firstBlockMinHeight}
      firstBlock={firstBlock}
    >
      {leadingChildren}
      {remainingInitiatives.map((initiative) => (
        <PdfStrategicInitiativeCard key={initiative.id} initiative={initiative} />
      ))}
    </PdfTipSection>
  );
}

const INVESTMENT_COLUMNS = [
  { key: "phase", label: "Phase", width: "18%" },
  { key: "businessGoal", label: "Business Goal", width: "52%" },
  { key: "investment", label: "Estimated Investment", width: "30%", align: "right" as const },
];

function PdfTipInvestmentTableHeader() {
  return (
    <View style={styles.tableHeader}>
      {INVESTMENT_COLUMNS.map((column) => (
        <Text
          key={column.key}
          style={[
            styles.tableHeaderCell,
            { width: column.width, textAlign: column.align ?? "left" },
          ]}
        >
          {column.label}
        </Text>
      ))}
    </View>
  );
}

function PdfTipInvestmentTable({
  rows,
}: {
  rows: TipPhaseInvestmentRow[];
}) {
  // Phase tables are short — keep the header + all rows as one block so rows never split
  // and totals on the following block can stay with the table when space allows.
  return (
    <View wrap={false} minPresenceAhead={TIP_PAGINATION.table} style={styles.tableWrap}>
      <PdfTipInvestmentTableHeader />
      {rows.map((row, index) => (
        <View
          key={`${row.phaseLabel}-${index}`}
          wrap={false}
          style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
        >
          <Text style={[styles.tableCell, { width: INVESTMENT_COLUMNS[0]!.width }]}>
            {row.phaseLabel}
          </Text>
          <Text style={[styles.tableCell, { width: INVESTMENT_COLUMNS[1]!.width }]}>
            {row.businessGoal}
          </Text>
          <Text
            style={[
              styles.tableCell,
              { width: INVESTMENT_COLUMNS[2]!.width, textAlign: "right" },
            ]}
          >
            {row.estimatedInvestment}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function PdfPhaseInvestmentSummary({
  rows,
  totalInvestment,
  recurringServices,
  oneTimeInvestments,
}: {
  rows: TipPhaseInvestmentRow[];
  totalInvestment: string;
  recurringServices: string;
  oneTimeInvestments: string;
}) {
  return (
    <PdfTipSection
      title="Phase Investment Summary"
      firstBlockMinHeight={estimateInvestmentTableHeight(rows.length)}
      firstBlock={<PdfTipInvestmentTable rows={rows} />}
    >
      <View wrap={false} minPresenceAhead={TIP_PAGINATION.investmentBlock}>
        <View style={styles.investmentHero}>
          <Text style={styles.investmentHeroLabel}>Estimated Total Investment</Text>
          <Text style={styles.investmentHeroValue}>{totalInvestment}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 6 }}>
          <View style={[styles.callout, { flex: 1, marginBottom: 0 }]}>
            <Text style={styles.calloutTitle}>Recurring Services</Text>
            <Text style={[styles.bodyText, { marginBottom: 0 }]}>{recurringServices}</Text>
          </View>
          <View style={[styles.callout, { flex: 1, marginBottom: 0 }]}>
            <Text style={styles.calloutTitle}>One-Time Investments</Text>
            <Text style={[styles.bodyText, { marginBottom: 0 }]}>{oneTimeInvestments}</Text>
          </View>
        </View>
      </View>
    </PdfTipSection>
  );
}

export function PdfRoadmapToResults() {
  const benefits = [
    "Quarterly technology reassessments and StackScore tracking",
    "Living technology roadmap aligned to business priorities",
    "Progress tracking against strategic initiatives",
    "Executive business reviews with measurable outcomes",
    "Budget planning and investment prioritization",
    "Vendor management and technology strategy guidance",
    "StackScore portal access for ongoing visibility",
  ];

  return (
    <PdfTipSection
      title="From Roadmap to Results"
      subtitle="How Strategic IT Consulting turns assessment insights into accountable execution"
      firstBlockMinHeight={estimateCalloutIntroHeight(2)}
      firstBlock={
        <View wrap={false} style={styles.callout}>
          <Text style={styles.bodyText}>
            This Technology Improvement Plan identifies where technology creates business risk and
            where investment will deliver the greatest return. The assessment answers what should be
            accomplished and why it matters — not how to implement each initiative.
          </Text>
          <Text style={[styles.bodyText, { marginBottom: 0 }]}>
            Strategic IT Consulting provides the ongoing partnership to translate this roadmap into
            results: prioritized execution, vendor coordination, and executive accountability
            throughout the journey.
          </Text>
        </View>
      }
    >
      <Text style={styles.blockLabel} minPresenceAhead={28}>
        Partnership Benefits
      </Text>
      {benefits.map((benefit) => (
        <View key={benefit} wrap={false} style={styles.checklistRow}>
          <Text style={styles.checklistMark}>+</Text>
          <Text style={styles.checklistText}>{benefit}</Text>
        </View>
      ))}
    </PdfTipSection>
  );
}

export function PdfExecutiveNextSteps() {
  const options = [
    {
      title: "Option 1 — Approve Phase 1",
      body: "Confirm Phase 1 priorities and investment range. Your consultant will schedule a kickoff to align stakeholders, finalize scope, and begin execution planning under the Strategic IT Consulting engagement.",
    },
    {
      title: "Option 2 — Schedule a Strategy Session",
      body: "Meet with your technology advisor to review findings, discuss trade-offs, and refine the roadmap timeline before committing to implementation.",
    },
    {
      title: "Option 3 — Enroll in Strategic IT Consulting",
      body: "Establish an ongoing advisory partnership for quarterly reassessments, living roadmap management, executive reviews, and accountable delivery of the full improvement program.",
    },
  ];

  const [firstOption, ...remainingOptions] = options;

  return (
    <PdfTipSection
      title="Next Steps"
      firstBlockMinHeight={firstOption ? estimateNextStepCardHeight() : 0}
      firstBlock={
        firstOption ? (
          <View
            wrap={false}
            minPresenceAhead={TIP_PAGINATION.nextStepCard}
            style={styles.nextStepCard}
          >
            <Text style={styles.nextStepTitle}>{firstOption.title}</Text>
            <Text style={styles.nextStepBody}>{firstOption.body}</Text>
          </View>
        ) : null
      }
    >
      {remainingOptions.map((option) => (
        <View
          key={option.title}
          wrap={false}
          minPresenceAhead={TIP_PAGINATION.nextStepCard}
          style={styles.nextStepCard}
        >
          <Text style={styles.nextStepTitle} minPresenceAhead={24}>
            {option.title}
          </Text>
          <Text style={styles.nextStepBody}>{option.body}</Text>
        </View>
      ))}
      <Text style={[styles.bodyText, { marginTop: 6, marginBottom: 0 }]}>
        Contact {BRAND.companyName} at {BRAND.email}
        {BRAND.phone ? ` or ${BRAND.phone}` : ""} to proceed.
      </Text>
    </PdfTipSection>
  );
}
