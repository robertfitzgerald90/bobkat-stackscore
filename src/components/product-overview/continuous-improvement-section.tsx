"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { CONTINUOUS_IMPROVEMENT_LOOP } from "@/lib/product-overview/demo-partnership";
import { cn } from "@/lib/utils";

export function ContinuousImprovementSection() {
  const [activeId, setActiveId] = useState(CONTINUOUS_IMPROVEMENT_LOOP[0]?.id ?? "assess");
  const activeStage =
    CONTINUOUS_IMPROVEMENT_LOOP.find((stage) => stage.id === activeId) ??
    CONTINUOUS_IMPROVEMENT_LOOP[0]!;

  return (
    <section
      id="product-overview-continuous-improvement"
      className="scroll-mt-36 border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Continuous Improvement
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              StackScore never becomes stale
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              An ongoing improvement loop keeps your technology strategy current, measurable, and
              aligned with business priorities — quarter after quarter.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-10 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center gap-2" role="tablist" aria-label="Improvement loop stages">
            {CONTINUOUS_IMPROVEMENT_LOOP.map((stage, index) => {
              const isActive = stage.id === activeId;
              return (
                <div key={stage.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="improvement-loop-panel"
                    onClick={() => setActiveId(stage.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "scale-105 border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border bg-background text-foreground hover:border-primary/30",
                    )}
                  >
                    {stage.label}
                  </button>
                  {index < CONTINUOUS_IMPROVEMENT_LOOP.length - 1 ? (
                    <ChevronRight className="hidden h-4 w-4 text-muted-foreground sm:block" aria-hidden />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <OfferReveal delayMs={100}>
          <div
            id="improvement-loop-panel"
            role="tabpanel"
            aria-live="polite"
            className="mt-8 grid gap-4 md:grid-cols-3"
          >
            {[
              { label: "What happens", content: activeStage.whatHappens },
              { label: "Why it matters", content: activeStage.whyItMatters },
              { label: "Who benefits", content: activeStage.whoBenefits },
            ].map((block) => (
              <div key={block.label} className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{block.label}</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground">{block.content}</p>
              </div>
            ))}
          </div>
        </OfferReveal>
      </div>
    </section>
  );
}
