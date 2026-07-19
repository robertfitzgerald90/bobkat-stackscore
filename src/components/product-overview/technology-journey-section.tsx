"use client";

import { useState } from "react";
import { ArrowDown, ChevronRight } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { trackProductOverviewJourneyStageClicked } from "@/lib/analytics/product-overview-events";
import { JOURNEY_STAGES } from "@/lib/product-overview/demo-strategy";
import { cn } from "@/lib/utils";

export function TechnologyJourneySection() {
  const [activeStageId, setActiveStageId] = useState(JOURNEY_STAGES[0]?.id ?? "assess");
  const activeStage = JOURNEY_STAGES.find((stage) => stage.id === activeStageId) ?? JOURNEY_STAGES[0]!;

  return (
    <section
      id="product-overview-journey"
      className="scroll-mt-[var(--demo-shell-height,9rem)] border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Technology Journey
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              From assessment to measurable improvement
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              StackScore connects every step of the technology strategy lifecycle — so leaders
              always know where they stand, what to do next, and how progress is measured.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-10 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            className="flex min-w-max items-center gap-2 sm:gap-3"
            role="tablist"
            aria-label="StackScore methodology stages"
          >
            {JOURNEY_STAGES.map((stage, index) => {
              const isActive = stage.id === activeStageId;
              return (
                <div key={stage.id} className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="journey-stage-panel"
                    onClick={() => {
                      setActiveStageId(stage.id);
                      trackProductOverviewJourneyStageClicked(stage.id);
                    }}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive
                        ? "scale-105 border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border bg-background text-foreground hover:border-primary/30 hover:bg-muted/50",
                    )}
                  >
                    {stage.label}
                  </button>
                  {index < JOURNEY_STAGES.length - 1 ? (
                    <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <OfferReveal delayMs={120}>
          <div
            id="journey-stage-panel"
            role="tabpanel"
            aria-live="polite"
            className="mt-8 rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ArrowDown className="h-5 w-5 rotate-[-90deg]" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  {activeStage.label}
                </p>
                <p className="mt-3 text-lg leading-relaxed text-foreground">{activeStage.description}</p>
              </div>
            </div>
          </div>
        </OfferReveal>
      </div>
    </section>
  );
}
