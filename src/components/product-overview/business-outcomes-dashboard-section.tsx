"use client";

import { ArrowRight } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Card, CardContent } from "@/components/ui/card";
import { DEMO_BUSINESS_OUTCOME_KPIS } from "@/lib/product-overview/demo-execution";

export function BusinessOutcomesDashboardSection() {
  return (
    <section
      id="product-overview-outcomes"
      className="scroll-mt-[var(--demo-shell-height,9rem)] border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Business Outcomes
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Technology Progress You Can Measure
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              StackScore connects every initiative to measurable business outcomes — so leadership
              can see progress, not just activity.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {DEMO_BUSINESS_OUTCOME_KPIS.map((kpi, index) => (
            <OfferReveal key={kpi.id} delayMs={index * 40}>
              <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <p className="text-2xl font-semibold tabular-nums text-foreground">
                      {kpi.currentValue}
                    </p>
                    {kpi.targetValue ? (
                      <>
                        <ArrowRight className="h-4 w-4 text-primary" aria-hidden />
                        <p className="text-2xl font-semibold tabular-nums text-primary">
                          {kpi.targetValue}
                        </p>
                      </>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </OfferReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
