import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import type {
  RecommendationCostProfile,
  RoadmapPhaseInitiative,
  RoadmapPhaseResult,
} from "@/lib/technology-improvement-plan/roadmap-engine";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";
import { getRating, RATING_LABELS } from "@/lib/scoring";
import {
  buildPhaseCompletionOutcomes,
  buildPhaseExecutiveNarrative,
  buildPhaseOutcomeBulletsFull,
  findRecommendationForInitiative,
  getPhasePriorityLabel,
  getRoadmapOverviewMetrics,
  isPhaseRecurringCoveredByRetainer,
} from "@/lib/reports/tip-presentation";
import {
  COLORS,
  PdfKpiCard,
  PdfKpiRow,
  PdfPriorityBadge,
  PdfProgressBar,
  PdfReportFooter,
  PdfReportHeader,
} from "@/lib/pdf/shared";
import { pdfReportBodyStyles } from "@/lib/pdf/shared/layout";
import type { TipCategorySummary, TipReportData } from "@/lib/pdf/types";
import { tipPdfStyles as styles } from "@/lib/pdf/tip/styles";

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

function PdfChecklist({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <View style={{ marginBottom: 12 }}>
      {items.map((item) => (
        <View key={item} style={styles.checklistRow}>
          <Text style={styles.checklistMark}>✓</Text>
          <Text style={styles.checklistText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function formatInitiativeInvestment(profile: RecommendationCostProfile): string {
  const parts: string[] = [];
  if (profile.oneTimeInvestment > 0) {
    parts.push(formatCurrency(profile.oneTimeInvestment));
  }
  if (profile.monthlyRecurringInvestment > 0) {
    parts.push(`${formatCurrency(profile.monthlyRecurringInvestment)}/mo`);
  }
  return parts.length > 0 ? parts.join(" + ") : "Scoped in phase investment";
}

export function PdfMaturityComparison({ data }: { data: TipReportData }) {
  const currentRating = getRating(data.currentScore);
  const projectedRating = getRating(data.projectedScore);

  return (
    <View style={styles.maturityPanel}>
      <PdfKpiRow>
        <PdfKpiCard label="Current StackScore" value={data.currentScore} caption={RATING_LABELS[currentRating]} />
        <PdfKpiCard
          label="Projected StackScore"
          value={data.projectedScore}
          caption={RATING_LABELS[projectedRating]}
          highlight
        />
        <PdfKpiCard
          label="Expected Improvement"
          value={`+${data.scoreImprovement}`}
          caption="Points upon roadmap completion"
        />
        <PdfKpiCard
          label="Journey Progress"
          value={`${data.journeyProgressPercent}%`}
          caption={data.journeyPhaseLabel}
        />
      </PdfKpiRow>
      <View style={{ marginTop: 8 }}>
        <PdfProgressBar percent={data.currentScore} variant="current" />
        <View style={{ height: 8 }} />
        <PdfProgressBar percent={data.projectedScore} variant="improvement" />
      </View>
    </View>
  );
}

export function PdfPillarGrid({ categories }: { categories: TipCategorySummary[] }) {
  if (categories.length === 0) return null;

  return (
    <View style={styles.pillarGrid}>
      {categories.map((category) => {
        const cardStyle = category.hasRecommendations ? styles.pillarCardPlanned : styles.pillarCard;
        return (
          <View key={category.name} style={cardStyle}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: COLORS.navy, marginBottom: 4 }}>
              {category.name}
            </Text>
            <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: COLORS.navy, marginBottom: 2 }}>
              {category.score}
            </Text>
            <Text style={{ fontSize: 9, color: COLORS.muted, marginBottom: 6 }}>{category.ratingLabel}</Text>
            <PdfProgressBar percent={category.score} variant="current" />
            <Text style={{ fontSize: 9, color: COLORS.muted, marginTop: 6, lineHeight: 1.45 }}>
              {category.hasRecommendations
                ? "Improvement initiatives planned in this domain"
                : "Baseline maturity — no active initiatives in this plan"}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function PdfRoadmapOverview({ data }: { data: TipReportData }) {
  const roadmap = data.technologyRoadmap;
  const metrics = getRoadmapOverviewMetrics(data.currentScore, roadmap, data.recommendations);

  return (
    <View>
      <View style={styles.roadmapStepActive}>
        <Text style={styles.phaseEyebrow}>Starting Point</Text>
        <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: COLORS.navy }}>
          Assessment Complete
        </Text>
      </View>
      {roadmap.phases.map((phase) => (
        <View key={phase.id}>
          <Text style={{ fontSize: 11, color: COLORS.muted, textAlign: "center", marginVertical: 4 }}>↓</Text>
          <View style={styles.roadmapStep}>
            <Text style={styles.phaseEyebrow}>{phase.subtitle}</Text>
            <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: COLORS.navy }}>{phase.name}</Text>
            <Text style={{ fontSize: 10, color: COLORS.muted, marginTop: 3 }}>{phase.timeline}</Text>
          </View>
        </View>
      ))}
      <PdfKpiRow>
        <PdfKpiCard label="Current StackScore" value={metrics.currentScore} />
        <PdfKpiCard label="Projected StackScore" value={metrics.projectedScore} highlight />
        <PdfKpiCard label="Score Improvement" value={`+${metrics.scoreImprovement}`} />
        <PdfKpiCard label="Initiatives" value={metrics.initiativeCount} />
        <PdfKpiCard label="Phases" value={metrics.phaseCount} />
      </PdfKpiRow>
    </View>
  );
}

export function PdfInitiativeCard({
  initiative,
  recommendation,
  phase,
  relatedTitles,
}: {
  initiative: RoadmapPhaseInitiative;
  recommendation?: TipRecommendationView;
  phase: RoadmapPhaseResult;
  relatedTitles: string[];
}) {
  const businessSummary = recommendation?.executiveNote?.trim() || recommendation?.businessImpact?.trim();
  const technicalSummary = recommendation?.description?.trim();
  const effort = recommendation?.suggestedService?.trim() || "Consultant-scoped delivery";

  return (
    <View style={styles.initiativeCard} minPresenceAhead={120}>
      <View style={styles.initiativeHeader}>
        <Text style={styles.initiativeTitle}>{initiative.title}</Text>
        <PdfPriorityBadge priority={initiative.priority} />
      </View>

      <View style={styles.initiativeMetaGrid}>
        <View style={styles.initiativeMetaPill}>
          <Text style={styles.initiativeMetaLabel}>Estimated Investment</Text>
          <Text style={styles.initiativeMetaValue}>
            {formatInitiativeInvestment(initiative.costProfile)}
          </Text>
        </View>
        <View style={styles.initiativeMetaPill}>
          <Text style={styles.initiativeMetaLabel}>Expected Score Impact</Text>
          <Text style={styles.initiativeMetaValue}>
            +{recommendation?.estimatedImpactPoints ?? 0} points
          </Text>
        </View>
        <View style={styles.initiativeMetaPill}>
          <Text style={styles.initiativeMetaLabel}>Implementation Effort</Text>
          <Text style={styles.initiativeMetaValue}>{effort}</Text>
        </View>
        <View style={styles.initiativeMetaPill}>
          <Text style={styles.initiativeMetaLabel}>Status</Text>
          <Text style={styles.initiativeMetaValue}>Included in {phase.subtitle}</Text>
        </View>
      </View>

      {recommendation?.businessImpact ? (
        <>
          <Text style={styles.initiativeFieldLabel}>Business Impact</Text>
          <Text style={styles.initiativeFieldBody}>{recommendation.businessImpact}</Text>
        </>
      ) : null}

      {technicalSummary ? (
        <>
          <Text style={styles.initiativeFieldLabel}>Technical Summary</Text>
          <Text style={styles.initiativeFieldBody}>{technicalSummary}</Text>
        </>
      ) : null}

      {businessSummary && businessSummary !== recommendation?.businessImpact ? (
        <>
          <Text style={styles.initiativeFieldLabel}>Executive Summary</Text>
          <Text style={styles.initiativeFieldBody}>{businessSummary}</Text>
        </>
      ) : null}

      {recommendation?.categoryName ? (
        <>
          <Text style={styles.initiativeFieldLabel}>Technology Domain</Text>
          <Text style={styles.initiativeFieldBody}>{recommendation.categoryName}</Text>
        </>
      ) : null}

      {relatedTitles.length > 0 ? (
        <>
          <Text style={styles.initiativeFieldLabel}>Related Initiatives in This Phase</Text>
          <PdfChecklist items={relatedTitles} />
        </>
      ) : null}
    </View>
  );
}

export function PdfPhaseSection({
  data,
  phase,
  phaseNumber,
}: {
  data: TipReportData;
  phase: RoadmapPhaseResult;
  phaseNumber: number;
}) {
  const outcomes = buildPhaseOutcomeBulletsFull(phase);
  const completionOutcomes = buildPhaseCompletionOutcomes(phase);
  const coveredByRetainer = isPhaseRecurringCoveredByRetainer(phase, data.recommendations);
  const showMonthly = phase.monthlyRecurringInvestment > 0;

  return (
    <View break={phaseNumber > 1}>
      <View style={styles.phaseHero} minPresenceAhead={100}>
        <Text style={styles.phaseEyebrow}>
          {phase.subtitle} · Phase {phaseNumber}
        </Text>
        <Text style={styles.phaseTitle}>{phase.name}</Text>
        <Text style={styles.phaseSubtitle}>{phase.timeline}</Text>
      </View>

      <PdfKpiRow>
        <PdfKpiCard label="Timeline" value={phase.timeline} />
        <PdfKpiCard label="Priority" value={getPhasePriorityLabel(phase)} />
        <PdfKpiCard
          label="StackScore Improvement"
          value={`+${phase.stackScoreImprovement}`}
          caption="Expected points from this phase"
          highlight
        />
        <PdfKpiCard label="Initiatives" value={phase.initiatives.length} />
      </PdfKpiRow>

      <Text style={styles.blockLabel}>Executive Summary</Text>
      <View style={styles.callout}>
        <Text style={styles.bodyText}>{buildPhaseExecutiveNarrative(phase)}</Text>
      </View>

      {outcomes.length > 0 ? (
        <>
          <Text style={styles.blockLabel}>Business Outcomes</Text>
          <View style={styles.callout}>
            <Text style={styles.calloutTitle}>What your organization gains from this phase</Text>
            <PdfChecklist items={outcomes} />
          </View>
        </>
      ) : null}

      <Text style={styles.blockLabel}>Investment Summary</Text>
      <PdfKpiRow>
        <PdfKpiCard
          label="One-Time Investment"
          value={formatCurrency(phase.oneTimeInvestment)}
          caption="Implementation and project delivery"
        />
        {showMonthly ? (
          <PdfKpiCard
            label="Monthly Recurring"
            value={
              coveredByRetainer
                ? "Included in retainer"
                : formatCurrency(phase.monthlyRecurringInvestment)
            }
            caption={coveredByRetainer ? "Strategic IT Consulting Retainer" : "New ongoing services"}
            highlight
          />
        ) : null}
        {phase.annualRecurringInvestment > 0 ? (
          <PdfKpiCard
            label="Annual Recurring"
            value={formatCurrency(phase.annualRecurringInvestment)}
          />
        ) : null}
      </PdfKpiRow>

      <Text style={styles.blockLabel}>Included Initiatives</Text>
      {phase.initiatives.map((initiative) => {
        const recommendation = findRecommendationForInitiative(
          data.recommendations,
          initiative.recommendationId,
        );
        const relatedTitles = phase.initiatives
          .filter((item) => item.recommendationId !== initiative.recommendationId)
          .map((item) => item.title)
          .slice(0, 4);

        return (
          <PdfInitiativeCard
            key={initiative.recommendationId}
            initiative={initiative}
            recommendation={recommendation}
            phase={phase}
            relatedTitles={relatedTitles}
          />
        );
      })}

      <Text style={styles.blockLabel}>Expected Results</Text>
      <View style={styles.callout}>
        <Text style={styles.calloutTitle}>Upon completion, your organization will have:</Text>
        <PdfChecklist items={completionOutcomes} />
      </View>

      <Text style={styles.blockLabel}>Success Metrics</Text>
      <PdfChecklist
        items={[
          `StackScore improvement of +${phase.stackScoreImprovement} points targeted for this phase`,
          `Projected cumulative score approaching ${phase.projectedScore}`,
          `${phase.initiatives.length} prioritized initiative${phase.initiatives.length === 1 ? "" : "s"} delivered with measurable outcomes`,
        ]}
      />

      <Text style={styles.blockLabel}>Implementation Notes</Text>
      <Text style={styles.bodyText}>
        Initiatives in this phase are sequenced to reduce operational risk while building toward the
        projected maturity score. Delivery windows follow the stated timeline and may be adjusted
        during quarterly strategic reviews.
      </Text>

      <Text style={styles.blockLabel}>Risk Reduction</Text>
      <Text style={styles.bodyText}>
        Completing {phase.name.toLowerCase()} addresses prioritized gaps identified in the Technology
        Maturity Assessment and reduces exposure from unresolved {getPhasePriorityLabel(phase).toLowerCase()}{" "}
        items before advancing to subsequent phases.
      </Text>

      <Text style={styles.blockLabel}>Business Benefits</Text>
      <PdfChecklist items={outcomes.length > 0 ? outcomes.slice(0, 4) : completionOutcomes.slice(0, 4)} />
    </View>
  );
}

export function PdfOverallInvestment({ data }: { data: TipReportData }) {
  return (
    <View>
      <PdfKpiRow>
        <PdfKpiCard
          label="One-Time Investment"
          value={formatCurrency(data.oneTimeInvestmentTotal)}
          caption="Total implementation across approved phases"
        />
        {data.monthlyRecurringTotal > 0 ? (
          <PdfKpiCard
            label="Monthly Recurring"
            value={formatCurrency(data.monthlyRecurringTotal)}
            caption="New ongoing services introduced"
            highlight
          />
        ) : null}
        {data.annualRecurringTotal > 0 ? (
          <PdfKpiCard
            label="Expected Annual Investment"
            value={formatCurrency(data.annualRecurringTotal)}
            caption="Annualized recurring services"
          />
        ) : null}
        <PdfKpiCard
          label="Expected Score Increase"
          value={`+${data.scoreImprovement}`}
          caption={`${data.currentScore} → ${data.projectedScore}`}
          highlight
        />
      </PdfKpiRow>

      <View style={styles.investmentHero}>
        <Text style={styles.investmentHeroLabel}>Total One-Time Implementation Investment</Text>
        <Text style={styles.investmentHeroValue}>{formatCurrency(data.oneTimeInvestmentTotal)}</Text>
        <Text style={styles.investmentHeroCaption}>
          Project delivery, professional services, and technology required to execute approved phases.
          One-time and recurring investments are presented separately for executive clarity.
        </Text>
      </View>

      {data.monthlyRecurringTotal > 0 ? (
        <View style={styles.investmentHeroSecondary}>
          <Text style={styles.investmentHeroLabel}>Total New Monthly Recurring Investment</Text>
          <Text style={styles.investmentHeroValue}>
            {formatCurrency(data.monthlyRecurringTotal)}
            <Text style={{ fontSize: 14 }}> /month</Text>
          </Text>
          <Text style={styles.investmentHeroCaption}>
            Ongoing services introduced by the roadmap. Recurring costs are never combined with
            one-time implementation totals.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function PdfNextSteps() {
  const steps = [
    {
      label: "Review Executive Summary",
      description: "Validate strategic alignment with business priorities and current maturity.",
    },
    {
      label: "Approve Phase 1",
      description: "Authorize the first implementation window independently of later phases.",
    },
    {
      label: "Execute & Measure",
      description: "Deliver initiatives and validate StackScore and operational improvements.",
    },
    {
      label: "Advance the Roadmap",
      description: "Approve subsequent phases as priorities and budget allow.",
    },
  ];

  return (
    <View>
      {steps.map((step, index) => (
        <View key={step.label} style={styles.nextStepRow}>
          <Text style={styles.nextStepIndex}>{index + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: COLORS.navy, marginBottom: 3 }}>
              {step.label}
            </Text>
            <Text style={{ fontSize: 10, color: COLORS.muted, lineHeight: 1.5 }}>{step.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export const tipBodyStyles = pdfReportBodyStyles;
