"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { PLATFORM_MAP_STEPS } from "@/lib/product-overview/demo-execution";
import { cn } from "@/lib/utils";

export function PlatformOverviewMapSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % PLATFORM_MAP_STEPS.length);
    }, 2800);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      id="product-overview-platform-map"
      className="scroll-mt-36 border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Complete Platform Overview
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              One platform for the entire technology lifecycle
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              From assessment to continuous improvement — every step connected, measurable, and
              accountable.
            </p>
          </div>
        </OfferReveal>

        <OfferReveal delayMs={100}>
          <div className="mt-10 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-start gap-2 px-1 sm:gap-3">
              {PLATFORM_MAP_STEPS.map((step, index) => {
                const isActive = index === activeIndex;
                return (
                  <div key={step.id} className="flex items-start gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "w-36 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-44",
                        isActive
                          ? "scale-105 border-primary bg-primary text-primary-foreground shadow-md"
                          : "border-border/70 bg-card text-foreground hover:border-primary/30",
                      )}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide">{step.label}</p>
                      <p
                        className={cn(
                          "mt-2 text-xs leading-relaxed",
                          isActive ? "text-primary-foreground/90" : "text-muted-foreground",
                        )}
                      >
                        {step.description}
                      </p>
                    </button>
                    {index < PLATFORM_MAP_STEPS.length - 1 ? (
                      <ChevronDown
                        className="mt-8 hidden h-4 w-4 shrink-0 rotate-[-90deg] text-muted-foreground sm:block"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </OfferReveal>
      </div>
    </section>
  );
}
