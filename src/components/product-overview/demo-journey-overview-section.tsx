"use client";

import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { DemoModeBanner } from "@/components/product-overview/demo-mode-banner";
import { useInteractiveDemo } from "@/components/product-overview/interactive-demo-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { scrollToSection } from "@/lib/product-overview/polish-classes";

export function DemoJourneyOverviewSection() {
  const { view, resetInteractiveDemo } = useInteractiveDemo();
  const { company, assessment, effectiveScore } = view;

  return (
    <section
      id="product-overview-dashboard"
      className="scroll-mt-[var(--demo-shell-height,9rem)] border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Interactive StackScore Experience
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {company.name}
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              {company.industry} · {company.employeeCount} employees · {company.locationCount}{" "}
              location · {company.managedDeviceCount} managed devices
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Explore how {company.name} moves from reactive technology management to a structured,
              measurable technology strategy — one independently approvable phase at a time.
            </p>
          </div>
        </OfferReveal>

        <DemoModeBanner />

        <OfferReveal delayMs={80}>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Assessment Status
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">Complete</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current StackScore
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                  {effectiveScore}
                  <span className="text-base font-normal text-muted-foreground"> / 100</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Roadmap Status
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {assessment.phaseCount}-phase roadmap generated
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Available Improvement
                </p>
                <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
                  +{assessment.availableImprovement} points
                </p>
              </div>
            </CardContent>
          </Card>
        </OfferReveal>

        <OfferReveal delayMs={120}>
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Primary technology concerns</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {company.primaryConcerns.map((concern) => (
                <li
                  key={concern}
                  className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground"
                >
                  {concern}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                className="h-11 px-6"
                onClick={() => scrollToSection("product-overview-roadmap")}
              >
                Explore the Living Execution Plan
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 px-6"
                onClick={() => scrollToSection("product-overview-assessment")}
              >
                Review Assessment Results
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-11 px-6"
                onClick={resetInteractiveDemo}
              >
                Restart Demo
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Interactive Demo — simulated approvals and progress update local session state only. No
              real proposals, payments, or client records are created.
            </p>
          </div>
        </OfferReveal>
      </div>
    </section>
  );
}
