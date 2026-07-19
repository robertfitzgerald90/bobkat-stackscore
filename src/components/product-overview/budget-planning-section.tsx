"use client";

import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { RoadmapStatusBadge } from "@/components/client-roadmap/roadmap-status-badge";
import { DemoInvestmentSummary } from "@/components/product-overview/demo-investment-summary";
import { useInteractiveDemo } from "@/components/product-overview/interactive-demo-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCurrency,
  formatMonthlyCurrency,
  getManagedItCatalogPriceLabel,
  getStrategicConsultingMonthlyLabel,
} from "@/lib/product-overview/interactive-demo";

export function BudgetPlanningSection() {
  const { view } = useInteractiveDemo();
  const { phases, totalOneTimeInvestment, totalMonthlyRecurring, company } = view;

  return (
    <section
      id="product-overview-budget"
      className="scroll-mt-[var(--demo-shell-height,9rem)] border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Budget & Investment
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Investment by phase — not one inflated total
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {company.name} can understand cash flow by seeing when one-time implementation work and
              new monthly services begin. One-time and recurring investments are never combined into
              a false grand total.
            </p>
          </div>
        </OfferReveal>

        <OfferReveal delayMs={80}>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {phases.map((phase) => (
              <Card key={phase.id} className="border-border/70 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-lg">
                      Phase {phase.phaseNumber} — {phase.name}
                    </CardTitle>
                    <RoadmapStatusBadge status={phase.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {phase.timeline} · {phase.initiativeCount} initiatives
                  </p>
                </CardHeader>
                <CardContent>
                  <DemoInvestmentSummary
                    oneTimeInvestment={phase.oneTimeInvestment}
                    monthlyRecurringInvestment={phase.monthlyRecurringInvestment}
                    showMonthlyRecurring={phase.showMonthlyRecurring}
                    monthlyRecurringLabel={phase.monthlyRecurringLabel}
                    compact
                  />
                  {!phase.showMonthlyRecurring ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      No new monthly recurring investment in this phase.
                    </p>
                  ) : null}
                  {phase.monthlyRecurringLabel === "strategic_consulting_included" ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Advisory work is covered under Strategic IT Consulting (
                      {getStrategicConsultingMonthlyLabel()}).
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </OfferReveal>

        <OfferReveal delayMs={120}>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Total One-Time Implementation Investment
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                  {formatCurrency(totalOneTimeInvestment)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Total New Monthly Recurring Investment
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                  {formatMonthlyCurrency(totalMonthlyRecurring)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Includes Managed IT ({getManagedItCatalogPriceLabel()}) and Strategic IT Consulting
                  where applicable. Annualized figures are shown only when explicitly labeled.
                </p>
              </CardContent>
            </Card>
          </div>
        </OfferReveal>

        <OfferReveal delayMs={160}>
          <Card className="mt-8 border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Budget timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">At approval — </span>
                  Phase 1 one-time implementation investment is authorized independently.
                </li>
                <li>
                  <span className="font-medium text-foreground">During implementation — </span>
                  Project delivery work proceeds against the approved phase scope.
                </li>
                <li>
                  <span className="font-medium text-foreground">Once services go live — </span>
                  New monthly Managed IT investment begins for supported devices.
                </li>
                <li>
                  <span className="font-medium text-foreground">Later phases — </span>
                  Additional one-time work is approved separately as priorities allow.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Strategic IT Consulting retainer —{" "}
                  </span>
                  Ongoing living execution plan reviews and business review cadence start at{" "}
                  {getStrategicConsultingMonthlyLabel()}.
                </li>
              </ol>
            </CardContent>
          </Card>
        </OfferReveal>
      </div>
    </section>
  );
}
