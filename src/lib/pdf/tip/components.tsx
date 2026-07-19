import { Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { PdfFlowSection } from "@/lib/pdf/shared/components/flow-section";
import { PdfReportFooter } from "@/lib/pdf/shared/components/report-footer";
import { PdfReportHeader } from "@/lib/pdf/shared/components/report-header";
import { PdfKpiCard, PdfKpiRow } from "@/lib/pdf/shared/components/kpi-card";
import { PdfReportTable } from "@/lib/pdf/shared/components/report-table";
import { PdfProgressBar } from "@/lib/pdf/shared/components/report-bar";
import { COLORS } from "@/lib/pdf/shared/colors";
import { REPORT_SPACING } from "@/lib/pdf/shared/tokens";
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
      <PdfReportHeader
        clientName={data.clientName}
        generatedDate={data.generatedDate}
        documentLabel="Technology Improvement Plan"
        technologyScore={data.currentScore}
        reportVersion={String(data.version)}
      />
      <PdfReportFooter
        generatedDate={data.generatedDate}
        clientName={data.clientName}
        documentVersion={String(data.version)}
      />
    </>
  );
}

export function PdfAssessmentScope() {
  return (
    <PdfFlowSection title="Assessment Scope">
      <View style={styles.scopeBox}>
        <Text style={styles.scopeText}>
          This assessment evaluates technology maturity using industry best practices and
          organizational information provided during the assessment process. It is intended to
          identify strategic improvement opportunities and support executive decision-making.
        </Text>
        <Text style={[styles.scopeText, { marginTop: 8 }]}>
          This document is not a penetration test, compliance audit, or technical implementation
          guide. Detailed execution planning, product selection, and deployment methodology are
          reserved for an ongoing consulting partnership with {BRAND.companyName}.
        </Text>
      </View>
    </PdfFlowSection>
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
    <PdfFlowSection title="Executive Summary">
      <View style={styles.executiveHero}>
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
        <PdfKpiRow>
          <PdfKpiCard label="StackScore" value={currentScore} caption="Current (0–100)" />
          <PdfKpiCard
            label="Projected Score"
            value={projectedScore}
            caption="After roadmap"
            highlight
          />
          <PdfKpiCard
            label="Technology Maturity"
            value={maturityTierLabel}
            caption="Current level"
          />
        </PdfKpiRow>
      </View>

      <Text style={styles.blockLabel}>Executive Summary</Text>
      <Text style={styles.bodyText}>{executiveSummary}</Text>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.blockLabel}>Top Business Risks</Text>
          {topBusinessRisks.map((risk) => (
            <View key={risk} style={styles.checklistRow}>
              <Text style={[styles.checklistMark, { color: COLORS.critical }]}>!</Text>
              <Text style={styles.checklistText}>{risk}</Text>
            </View>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.blockLabel}>Top Opportunities</Text>
          {topOpportunities.map((item) => (
            <View key={item} style={styles.checklistRow}>
              <Text style={styles.checklistMark}>+</Text>
              <Text style={styles.checklistText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </PdfFlowSection>
  );
}

export function PdfBusinessValueSnapshot({
  metrics,
}: {
  metrics: TipBusinessValueMetric[];
}) {
  return (
    <PdfFlowSection
      title="Business Value Snapshot"
      subtitle="Projected maturity improvements after completing the strategic roadmap"
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.valueMetricCard}>
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
            <PdfProgressBar percent={metric.projectedPercent} variant="improvement" />
          </View>
        ))}
      </View>
    </PdfFlowSection>
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

export function PdfCategoryFindingCard({ finding }: { finding: TipCategoryFinding }) {
  return (
    <View style={styles.findingCard}>
      <View style={styles.findingHeader}>
        <Text style={styles.findingTitle}>{finding.categoryName}</Text>
      </View>
      <View style={styles.badgeRow}>
        <PdfRiskBadge level={finding.riskLevel} />
        <PdfPriorityBadge level={finding.priority} />
      </View>
      <Text style={styles.fieldLabel}>Current State</Text>
      <Text style={styles.fieldBody}>{finding.currentState}</Text>
      <Text style={styles.fieldLabel}>Business Impact</Text>
      <Text style={styles.fieldBody}>{finding.businessImpact}</Text>
    </View>
  );
}

export function PdfCurrentStateFindings({
  findings,
}: {
  findings: TipCategoryFinding[];
}) {
  return (
    <PdfFlowSection
      title="Current State Findings"
      subtitle="Assessment observations grouped by category — focused on business impact, not technical implementation"
    >
      {findings.map((finding) => (
        <PdfCategoryFindingCard key={finding.categoryName} finding={finding} />
      ))}
    </PdfFlowSection>
  );
}

export function PdfStrategicInitiativeCard({
  initiative,
}: {
  initiative: TipStrategicInitiative;
}) {
  return (
    <View style={styles.initiativeCard}>
      <Text style={styles.initiativeTitle}>{initiative.name}</Text>
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
      <Text style={styles.fieldLabel}>Business Objective</Text>
      <Text style={styles.fieldBody}>{initiative.businessObjective}</Text>
      <Text style={styles.fieldLabel}>Why It Matters</Text>
      <Text style={styles.fieldBody}>{initiative.whyItMatters}</Text>
      {initiative.expectedBenefits.length > 0 ? (
        <>
          <Text style={styles.fieldLabel}>Expected Benefits</Text>
          {initiative.expectedBenefits.map((benefit) => (
            <View key={benefit} style={styles.checklistRow}>
              <Text style={styles.checklistMark}>+</Text>
              <Text style={styles.checklistText}>{benefit}</Text>
            </View>
          ))}
        </>
      ) : null}
    </View>
  );
}

export function PdfStrategicImprovementRoadmap({
  initiatives,
}: {
  initiatives: TipStrategicInitiative[];
}) {
  return (
    <PdfFlowSection
      title="Strategic Improvement Roadmap"
      subtitle="What should be accomplished — implementation methodology reserved for consulting engagement"
    >
      {initiatives.map((initiative) => (
        <PdfStrategicInitiativeCard key={initiative.id} initiative={initiative} />
      ))}
    </PdfFlowSection>
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
    <PdfFlowSection title="Phase Investment Summary">
      <PdfReportTable
        columns={[
          { key: "phase", label: "Phase", width: "18%" },
          { key: "businessGoal", label: "Business Goal", width: "52%" },
          { key: "investment", label: "Estimated Investment", width: "30%", align: "right" },
        ]}
        rows={rows.map((row) => ({
          phase: row.phaseLabel,
          businessGoal: row.businessGoal,
          investment: row.estimatedInvestment,
        }))}
      />

      <View style={styles.investmentHero}>
        <Text style={styles.investmentHeroLabel}>Estimated Total Investment</Text>
        <Text style={styles.investmentHeroValue}>{totalInvestment}</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
        <View style={[styles.callout, { flex: 1, marginBottom: 0 }]}>
          <Text style={styles.calloutTitle}>Recurring Services</Text>
          <Text style={styles.bodyText}>{recurringServices}</Text>
        </View>
        <View style={[styles.callout, { flex: 1, marginBottom: 0 }]}>
          <Text style={styles.calloutTitle}>One-Time Investments</Text>
          <Text style={styles.bodyText}>{oneTimeInvestments}</Text>
        </View>
      </View>
    </PdfFlowSection>
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
    `StackScore portal access for ongoing visibility`,
  ];

  return (
    <PdfFlowSection
      title="From Roadmap to Results"
      subtitle="How Strategic IT Consulting turns assessment insights into accountable execution"
    >
      <View style={styles.callout}>
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

      <Text style={styles.blockLabel}>Partnership Benefits</Text>
      {benefits.map((benefit) => (
        <View key={benefit} style={styles.checklistRow}>
          <Text style={styles.checklistMark}>+</Text>
          <Text style={styles.checklistText}>{benefit}</Text>
        </View>
      ))}
    </PdfFlowSection>
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

  return (
    <PdfFlowSection title="Next Steps">
      {options.map((option) => (
        <View key={option.title} style={styles.nextStepCard}>
          <Text style={styles.nextStepTitle}>{option.title}</Text>
          <Text style={styles.nextStepBody}>{option.body}</Text>
        </View>
      ))}
      <Text style={[styles.bodyText, { marginTop: REPORT_SPACING.block, marginBottom: 0 }]}>
        Contact {BRAND.companyName} at {BRAND.email}
        {BRAND.phone ? ` or ${BRAND.phone}` : ""} to proceed.
      </Text>
    </PdfFlowSection>
  );
}
