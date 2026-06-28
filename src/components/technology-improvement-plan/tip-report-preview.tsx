"use client";

import { getPriorityTimeline } from "@/lib/recommendations/display";
import { buildTipReportData } from "@/lib/technology-improvement-plan/report-data";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import type { TipPlanDetail } from "@/lib/technology-improvement-plan/types";
import { getRating, RATING_LABELS } from "@/lib/scoring";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";
import {
  ReportBody,
  ReportClientHeader,
  ReportCover,
  ReportDocument,
  ReportExecutiveSummary,
  ReportFooter,
  ReportHeader,
  ReportHighlightCard,
  ReportMetricCard,
  ReportMetricGrid,
  ReportPriorityChip,
  ReportSection,
  ReportShell,
} from "@/components/reports";

type TipReportPreviewProps = {
  plan: TipPlanDetail;
  isAdmin: boolean;
  executiveSummary: string;
  onExecutiveSummaryChange?: (value: string) => void;
  isEditable?: boolean;
};

export function TipReportPreview({
  plan,
  isAdmin,
  executiveSummary,
  onExecutiveSummaryChange,
  isEditable = false,
}: TipReportPreviewProps) {
  const data = buildTipReportData(
    {
      ...plan,
      executiveSummary,
      wizardState: { ...plan.wizardState, executiveSummary },
    },
    isAdmin,
  );

  const currentRating = getRating(data.currentScore);
  const projectedRating = getRating(data.projectedScore);

  return (
    <ReportShell>
      <ReportDocument>
      <ReportCover reportType="technology_improvement_plan" />

      <ReportBody>
        <ReportClientHeader
          clientName={data.clientName}
          metaItems={[
            { label: "Version", value: `v${data.version}` },
            { label: "Prepared", value: data.generatedDate },
            ...(data.maturityTierLabel
              ? [{ label: "Maturity", value: data.maturityTierLabel }]
              : []),
          ]}
        />

        <ReportHeader
          reportTitle="Technology Improvement Plan"
          clientName={data.clientName}
          dateLabel={data.generatedDate}
        />

        <ReportSection
          title="Executive Summary"
          subtitle="Business context, profile trajectory, and expected outcomes"
          variant="accent"
        >
          <ReportExecutiveSummary
            value={executiveSummary}
            isEditable={isEditable}
            onChange={onExecutiveSummaryChange}
            fallback={`This plan outlines prioritized initiatives to advance ${data.clientName}'s technology posture from ${data.currentScore} to a projected ${data.projectedScore}.`}
            className="text-foreground/90"
          />
          <ReportMetricGrid columns={2} className="mt-4">
            <ReportMetricCard
              label="Technology Profile — Today"
              value={data.currentScore}
              valueClassName={getScoreTextColorClass(data.currentScore)}
              subtitle={RATING_LABELS[currentRating]}
            />
            <ReportMetricCard
              label="Technology Profile — Projected"
              value={data.projectedScore}
              valueClassName={getScoreTextColorClass(data.projectedScore)}
              subtitle={RATING_LABELS[projectedRating]}
              highlight
            />
          </ReportMetricGrid>
          <div className="mt-4 rounded-lg border bg-primary/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Technology Journey — {data.journeyPhaseLabel}
            </p>
            <div className="mt-3 h-3 overflow-hidden rounded-full border bg-background">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${data.journeyProgressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {data.journeyProgressPercent}% complete · +{data.scoreImprovement} projected points
            </p>
          </div>
        </ReportSection>

        {data.businessOutcomes.length > 0 ? (
          <ReportSection
            title="Expected Business Outcomes"
            subtitle="Primary value drivers from prioritized initiatives"
            variant="accent"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {data.businessOutcomes.map((outcome) => (
                <ReportHighlightCard key={outcome.title} leftBorder>
                  <p className="text-sm font-semibold text-primary">{outcome.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {outcome.description}
                  </p>
                </ReportHighlightCard>
              ))}
            </div>
          </ReportSection>
        ) : null}

        {data.categorySummaries.length > 0 ? (
          <ReportSection
            title="Category Profile Summary"
            subtitle="Highlighted categories include planned improvements"
            variant="accent"
          >
            <div className="space-y-3">
              {data.categorySummaries.map((category) => (
                <div
                  key={category.name}
                  className={cn(
                    "rounded-lg border p-3",
                    category.hasRecommendations && "border-primary bg-primary/5",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-primary">{category.name}</p>
                    <p className={cn("text-sm font-bold", getScoreTextColorClass(category.score))}>
                      {category.score}%
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {category.ratingLabel}
                    {category.hasRecommendations ? " · Improvement planned" : ""}
                  </p>
                </div>
              ))}
            </div>
          </ReportSection>
        ) : null}

        <ReportSection
          title="Prioritized Recommendations"
          subtitle="Initiatives ordered by business impact and priority"
          variant="accent"
        >
          <div className="space-y-4">
            {data.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="overflow-hidden rounded-lg border border-t-4 border-t-primary bg-background"
              >
                <div className="flex items-start justify-between gap-3 p-4 pb-2">
                  <p className="font-semibold text-primary">{rec.title}</p>
                  <ReportPriorityChip priority={rec.priority} />
                </div>
                <div className="grid gap-2 px-4 pb-4 sm:grid-cols-3">
                  <MetaBox label="Expected Outcome" value={`+${rec.estimatedImpactPoints} pts`} />
                  <MetaBox label="Timeline" value={getPriorityTimeline(rec.priority)} />
                  <MetaBox label="Category" value={rec.categoryName} />
                </div>
                <div className="border-t bg-muted/30 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Business Impact
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{rec.businessImpact}</p>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection title="Phased Implementation Roadmap" variant="accent">
          <div className="space-y-3">
            {data.roadmapPhases.map((phase, index) => (
              <div
                key={phase.id}
                className={cn(
                  "rounded-lg border p-4",
                  index === 0 && "border-primary bg-primary/5",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-primary">{phase.label}</p>
                  <p className={cn("text-lg font-bold", getScoreTextColorClass(phase.projectedScore))}>
                    {phase.projectedScore}
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">+{phase.scoreDelta} points</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {phase.recommendations.map((rec) => (
                    <li key={rec.id}>• {rec.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection
          title="Investment Summary"
          subtitle="Client-facing investment breakdown"
          variant="accent"
        >
          <div className="overflow-hidden rounded-lg border">
            <div className="grid grid-cols-[1fr_2fr_auto] gap-3 bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
              <span>Category</span>
              <span>Description</span>
              <span className="text-right">Amount</span>
            </div>
            {data.investmentLineItems.map((row, index) => (
              <div
                key={row.category}
                className={cn(
                  "grid grid-cols-[1fr_2fr_auto] gap-3 border-t px-4 py-3 text-sm",
                  index % 2 === 1 && "bg-muted/20",
                )}
              >
                <span className="font-semibold text-primary">{row.category}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">{row.description}</span>
                <span className="text-right font-semibold">{formatCurrency(row.amount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-primary px-6 py-5 text-primary-foreground">
            <p className="text-xs uppercase tracking-wide text-primary-foreground/75">
              Total Client Investment
            </p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(data.clientInvestmentTotal)}</p>
          </div>
          {isAdmin && data.investmentBreakdown ? (
            <div className="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                Internal Pricing (Admin Only — not in client PDF)
              </p>
              <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                <p>Margin: {data.investmentBreakdown.marginPercent}%</p>
                <p>Margin amount: {formatCurrency(data.investmentBreakdown.marginAmount)}</p>
                <p>Labor: {formatCurrency(data.investmentBreakdown.labor)}</p>
                <p>Hardware: {formatCurrency(data.investmentBreakdown.hardware)}</p>
              </div>
            </div>
          ) : null}
        </ReportSection>

        <ReportFooter confidentialFor={data.clientName} />
      </ReportBody>
      </ReportDocument>
    </ReportShell>
  );
}

function MetaBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold text-primary">{value}</p>
    </div>
  );
}
