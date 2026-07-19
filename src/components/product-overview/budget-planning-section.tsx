"use client";

import { useMemo, useState } from "react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackProductOverviewBudgetPeriodChanged } from "@/lib/analytics/product-overview-events";
import { DEMO_BUDGET_PERIODS } from "@/lib/product-overview/demo-execution";
import { formatDemoCurrency } from "@/lib/product-overview/demo-dashboard";
import type { DemoBudgetPeriodId } from "@/lib/product-overview/types";

export function BudgetPlanningSection() {
  const [periodId, setPeriodId] = useState<DemoBudgetPeriodId>("current-year");
  const period = useMemo(
    () => DEMO_BUDGET_PERIODS.find((item) => item.id === periodId) ?? DEMO_BUDGET_PERIODS[0]!,
    [periodId],
  );
  const maxCategoryAmount = Math.max(...period.categories.map((category) => category.amount));

  return (
    <section
      id="product-overview-budget"
      className="scroll-mt-36 border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Budget Planning
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Technology Investment Dashboard
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Align technology spending with your strategic roadmap — from annual plans to
              multi-year investment visibility.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Budget period">
          {DEMO_BUDGET_PERIODS.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={periodId === item.id ? "default" : "outline"}
              onClick={() => {
                setPeriodId(item.id);
                trackProductOverviewBudgetPeriodChanged(item.id);
              }}
              aria-pressed={periodId === item.id}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <OfferReveal delayMs={100}>
          <div className="mt-6 grid gap-4 transition-opacity duration-300 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Annual Budget", period.annual.planned],
              ["Approved", period.annual.approved],
              ["Committed", period.annual.committed],
              ["Remaining", period.annual.remaining],
            ].map(([label, value]) => (
              <Card key={label as string} className="border-border/70 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{label as string}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {formatDemoCurrency(value as number)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </OfferReveal>

        <OfferReveal delayMs={150}>
          <Card className="mt-6 border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Investment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {period.categories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{category.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatDemoCurrency(category.amount)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${(category.amount / maxCategoryAmount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </OfferReveal>
      </div>
    </section>
  );
}
