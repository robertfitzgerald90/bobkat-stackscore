"use client";

import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { DemoInvestmentSummary } from "@/components/product-overview/demo-investment-summary";
import { useInteractiveDemo } from "@/components/product-overview/interactive-demo-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getInteractiveDemoScenario,
} from "@/lib/product-overview/interactive-demo";
import { scrollToSection } from "@/lib/product-overview/polish-classes";
import { cn } from "@/lib/utils";

export function MeasurableImprovementSection() {
  const { view, selectPhase } = useInteractiveDemo();
  const scenario = getInteractiveDemoScenario();
  const {
    company,
    stage,
    effectiveScore,
    completedImprovement,
    projectedFinalScore,
    roadmapCompletionPercent,
    phase2,
    showNextPhaseIntro,
  } = view;
  const locked = stage !== "phase1_completed";

  return (
    <section
      id="product-overview-measurable-improvement"
      className="scroll-mt-[var(--demo-shell-height,9rem)] border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Measurable Improvement
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Completed work increases the effective StackScore
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Prospects see that StackScore is not merely a report generator — approved and completed
              phases produce measurable technology maturity gains.
            </p>
          </div>
        </OfferReveal>

        <OfferReveal delayMs={80}>
          <div
            className={cn(
              "mt-8 grid gap-4 sm:grid-cols-3",
              locked && "opacity-70",
            )}
          >
            {[
              ["Initial StackScore", scenario.scoreProgression.initialScore],
              ["Phase 1 improvement", `+${scenario.scoreProgression.phase1Improvement}`],
              ["Current effective StackScore", effectiveScore],
            ].map(([label, value]) => (
              <Card key={label as string} className="border-border/70 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground">{label as string}</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                    {value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </OfferReveal>

        {locked ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Simulate Phase 1 completion in Implementation Progress to unlock the score transition.
          </p>
        ) : (
          <>
            <OfferReveal delayMs={120}>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Previous score", scenario.scoreProgression.initialScore],
                  ["Phase improvement", `+${completedImprovement}`],
                  ["Projected after roadmap", projectedFinalScore],
                  ["Roadmap completion", `${roadmapCompletionPercent}%`],
                ].map(([label, value]) => (
                  <Card key={label as string} className="border-border/70">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">{label as string}</p>
                      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </OfferReveal>

            <OfferReveal delayMs={160}>
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-foreground">
                  Before-and-after pillar comparisons
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {scenario.scoreProgression.pillarBeforeAfter.map((pillar) => (
                    <div
                      key={pillar.id}
                      className="rounded-xl border border-border/70 bg-muted/10 px-4 py-3"
                    >
                      <p className="text-sm font-medium text-foreground">{pillar.label}</p>
                      <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
                        {pillar.before}
                        <span className="mx-2 text-muted-foreground">→</span>
                        {pillar.afterPhase1}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </OfferReveal>

            {showNextPhaseIntro && phase2 ? (
              <OfferReveal delayMs={200}>
                <Card className="mt-8 border-primary/30 bg-primary/5 shadow-sm">
                  <CardContent className="space-y-4 p-6">
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                      Phase 1 complete · Next recommended phase
                    </p>
                    <h3 className="text-2xl font-semibold text-foreground">
                      Phase {phase2.phaseNumber} — {phase2.name}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      With foundational visibility and recovery in place, {company.name} can now
                      modernize networking and standardize lifecycle policies — still as an
                      independently approvable phase.
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      Expected improvement · +{phase2.stackScoreImprovement} points
                    </p>
                    <DemoInvestmentSummary
                      oneTimeInvestment={phase2.oneTimeInvestment}
                      monthlyRecurringInvestment={phase2.monthlyRecurringInvestment}
                      showMonthlyRecurring={phase2.showMonthlyRecurring}
                      monthlyRecurringLabel={phase2.monthlyRecurringLabel}
                      compact
                    />
                    {!phase2.showMonthlyRecurring ? (
                      <p className="text-sm text-muted-foreground">New monthly recurring · None</p>
                    ) : null}
                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                      <Button
                        type="button"
                        className="h-11 px-6"
                        onClick={() => {
                          selectPhase(phase2.id);
                          scrollToSection("product-overview-roadmap");
                        }}
                      >
                        Preview Phase 2
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 px-6"
                        onClick={() => scrollToSection("product-overview-budget")}
                      >
                        Continue Exploring the Platform
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </OfferReveal>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
