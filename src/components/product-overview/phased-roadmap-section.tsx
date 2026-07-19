"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { RoadmapStatusBadge } from "@/components/client-roadmap/roadmap-status-badge";
import { DemoInvestmentSummary } from "@/components/product-overview/demo-investment-summary";
import { useInteractiveDemo } from "@/components/product-overview/interactive-demo-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RECOMMENDATION_LIFECYCLE_LABELS } from "@/lib/client-roadmap/labels";
import type { DerivedDemoPhase } from "@/lib/product-overview/interactive-demo";
import { scrollToSection } from "@/lib/product-overview/polish-classes";
import { cn } from "@/lib/utils";

function PhaseTimeline({ phases }: { phases: DerivedDemoPhase[] }) {
  return (
    <ol className="flex flex-col gap-0 md:flex-row md:items-stretch md:gap-2">
      <li className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-900 md:min-w-[8.5rem] md:flex-col md:justify-center md:text-center">
        <Check className="h-4 w-4 shrink-0" aria-hidden />
        Assessment Complete
      </li>
      {phases.map((phase, index) => (
        <li key={phase.id} className="flex flex-1 flex-col md:flex-row md:items-stretch">
          <div
            className="mx-5 h-6 w-px bg-border md:mx-0 md:my-auto md:h-px md:w-6"
            aria-hidden
          />
          <div
            className={cn(
              "flex-1 rounded-xl border px-4 py-3",
              phase.status === "awaiting_approval" || phase.status === "in_progress"
                ? "border-primary/40 bg-primary/5"
                : "border-border/70 bg-card",
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Phase {phase.phaseNumber}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{phase.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{phase.timeline}</p>
            <div className="mt-2">
              <RoadmapStatusBadge status={phase.status} />
            </div>
            {index < phases.length - 1 ? null : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function PhaseCard({
  phase,
  selected,
  onSelect,
}: {
  phase: DerivedDemoPhase;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary/50 bg-primary/5 shadow-sm"
          : "border-border/70 bg-card hover:border-primary/30 hover:bg-muted/20",
      )}
      aria-pressed={selected}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Phase {phase.phaseNumber}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">{phase.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{phase.timeline}</p>
        </div>
        <RoadmapStatusBadge status={phase.status} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{phase.primaryBusinessOutcome}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Expected StackScore improvement</p>
          <p className="text-base font-semibold tabular-nums text-foreground">
            +{phase.stackScoreImprovement} points
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Initiatives</p>
          <p className="text-base font-semibold tabular-nums text-foreground">
            {phase.initiativeCount}
          </p>
        </div>
      </div>
      <div className="mt-4 border-t border-border/60 pt-4">
        <DemoInvestmentSummary
          oneTimeInvestment={phase.oneTimeInvestment}
          monthlyRecurringInvestment={phase.monthlyRecurringInvestment}
          showMonthlyRecurring={phase.showMonthlyRecurring}
          monthlyRecurringLabel={phase.monthlyRecurringLabel}
          compact
        />
      </div>
      <p className="mt-4 text-sm font-medium text-primary">Inspect phase details</p>
    </button>
  );
}

function PhaseDetail({ phase }: { phase: DerivedDemoPhase }) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="mt-8 border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Phase {phase.phaseNumber} Detail
          </p>
          <CardTitle className="mt-2 text-2xl">{phase.name}</CardTitle>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{phase.timeline}</Badge>
            <RoadmapStatusBadge status={phase.status} />
            <Badge variant={phase.riskLevel === "Critical" ? "destructive" : "outline"}>
              {phase.riskLevel} risk
            </Badge>
            <Badge variant="secondary">+{phase.stackScoreImprovement} StackScore</Badge>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-expanded={open}
          aria-label={open ? "Collapse phase detail" : "Expand phase detail"}
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDown className={cn("h-5 w-5 transition-transform", open && "rotate-180")} />
        </Button>
      </CardHeader>
      <CardContent className={cn("space-y-8", !open && "hidden md:block")}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Why this phase matters</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{phase.whyItMatters}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Business outcomes</h4>
            <ul className="mt-2 space-y-2">
              {phase.businessOutcomes.map((outcome) => (
                <li key={outcome} className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Included initiatives</h4>
          <div className="mt-3 grid gap-3">
            {phase.initiatives.map((initiative) => (
              <div
                key={initiative.id}
                className="rounded-xl border border-border/70 bg-muted/10 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{initiative.title}</p>
                  <Badge variant="outline">
                    {RECOMMENDATION_LIFECYCLE_LABELS[initiative.status]}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{initiative.description}</p>
                <p className="mt-2 text-sm text-foreground">
                  <span className="font-medium">Business benefit:</span> {initiative.businessBenefit}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  StackScore contribution · +{initiative.stackScoreContribution} ·{" "}
                  {initiative.costType.replace("_", " ")}
                  {initiative.includedInStrategicConsulting
                    ? " · Included in Strategic IT Consulting"
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-background p-5">
            <h4 className="text-sm font-semibold text-foreground">Phase investment</h4>
            <DemoInvestmentSummary
              className="mt-4"
              oneTimeInvestment={phase.oneTimeInvestment}
              monthlyRecurringInvestment={phase.monthlyRecurringInvestment}
              showMonthlyRecurring={phase.showMonthlyRecurring}
              monthlyRecurringLabel={phase.monthlyRecurringLabel}
            />
            {phase.showMonthlyRecurring && phase.monthlyRecurringLabel !== "strategic_consulting_included" ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Monthly services begin when the associated managed services are activated.
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-border/70 bg-background p-5">
            <h4 className="text-sm font-semibold text-foreground">After this phase</h4>
            <ul className="mt-3 space-y-2">
              {phase.completionOutcomes.map((outcome) => (
                <li key={outcome} className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {phase.phaseNumber === 1 ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="h-11 px-6"
              onClick={() => scrollToSection("product-overview-phase-proposal")}
            >
              Preview Phase 1 Proposal
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function PhasedRoadmapSection() {
  const { view, selectPhase } = useInteractiveDemo();
  const {
    company,
    phases,
    selectedPhase,
    effectiveScore,
    projectedFinalScore,
    assessment,
    roadmapCompletionPercent,
    completedInitiativeCount,
    remainingInitiativeCount,
    currentPhaseNumber,
  } = view;

  return (
    <section
      id="product-overview-roadmap"
      className="scroll-mt-[var(--demo-shell-height,9rem)] border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Living Execution Plan
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              A phased plan {company.name} can approve one step at a time
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              StackScore converts assessment findings into an ordered implementation roadmap so the
              organization can address its highest-priority risks first — without committing to the
              entire plan up front.
            </p>
          </div>
        </OfferReveal>

        <OfferReveal delayMs={80}>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Effective StackScore", `${effectiveScore}`],
              ["Projected final score", `${projectedFinalScore}`],
              ["Available improvement", `+${assessment.availableImprovement}`],
              ["Roadmap completion", `${roadmapCompletionPercent}%`],
              ["Current phase", `Phase ${currentPhaseNumber}`],
            ].map(([label, value]) => (
              <Card key={label} className="border-border/70 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {completedInitiativeCount} completed initiatives · {remainingInitiativeCount} remaining
          </p>
        </OfferReveal>

        <OfferReveal delayMs={120}>
          <div className="mt-8 overflow-x-auto pb-2">
            <PhaseTimeline phases={phases} />
          </div>
        </OfferReveal>

        <OfferReveal delayMs={160}>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {phases.map((phase) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                selected={selectedPhase.id === phase.id}
                onSelect={() => selectPhase(phase.id)}
              />
            ))}
          </div>
        </OfferReveal>

        <PhaseDetail phase={selectedPhase} />
      </div>
    </section>
  );
}
