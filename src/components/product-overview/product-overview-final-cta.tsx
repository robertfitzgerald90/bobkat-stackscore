"use client";

import Link from "next/link";
import { OfferCtaPanel } from "@/components/assessment-offer/offer-cta-panel";
import { useInteractiveDemo } from "@/components/product-overview/interactive-demo-context";
import { ProductOverviewAssessmentCta } from "@/components/product-overview/product-overview-assessment-cta";
import { buttonVariants } from "@/components/ui/button";
import {
  trackProductOverviewConsultingCtaClicked,
  trackProductOverviewFinalCtaClicked,
} from "@/lib/analytics/product-overview-events";
import {
  trackCalBookingClick,
  trackServiceCtaClick,
} from "@/lib/analytics/marketing-events";
import { getInteractiveDemoScenario } from "@/lib/product-overview/interactive-demo";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { cn } from "@/lib/utils";

const JOURNEY_STEPS = [
  "Assessment",
  "Roadmap",
  "Phase Approval",
  "Implementation",
  "Measurable Improvement",
  "Continuous Strategic Planning",
] as const;

function DiscoveryCallCta({ placement }: { placement: string }) {
  const destination = SERVICES_CTA_DESTINATIONS.generalConsultation;

  return (
    <Link
      href={destination.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "outline" }), "h-12 w-full px-8 text-base sm:w-auto")}
      onClick={() => {
        trackServiceCtaClick({
          ctaKey: "generalConsultation",
          linkType: "cal_com",
          placement,
        });
        trackCalBookingClick({ ctaKey: "generalConsultation", placement });
        trackProductOverviewFinalCtaClicked("discovery_call", placement);
      }}
    >
      Schedule a Discovery Call
    </Link>
  );
}

function ConsultingCta({ placement }: { placement: string }) {
  const destination = SERVICES_CTA_DESTINATIONS.vcioOffer;

  return (
    <Link
      href={destination.href}
      className={cn(buttonVariants({ variant: "ghost" }), "h-12 w-full px-8 text-base sm:w-auto")}
      onClick={() => {
        trackServiceCtaClick({
          ctaKey: "vcioOffer",
          linkType: "internal",
          placement,
        });
        trackProductOverviewConsultingCtaClicked(placement);
        trackProductOverviewFinalCtaClicked("strategic_consulting", placement);
      }}
    >
      Learn About Strategic IT Consulting
    </Link>
  );
}

export function ProductOverviewFinalCta() {
  const { view } = useInteractiveDemo();
  const scenario = getInteractiveDemoScenario();
  const { company, effectiveScore } = view;

  return (
    <section id="product-overview-final-cta" className="border-t border-border/70">
      <div className="border-b border-border/70 bg-muted/10 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Transformation Summary
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {company.name}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <p className="text-xs text-muted-foreground">Initial StackScore</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {scenario.scoreProgression.initialScore}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <p className="text-xs text-muted-foreground">Current score after Phase 1</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{effectiveScore}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <p className="text-xs text-muted-foreground">Projected after roadmap</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {scenario.scoreProgression.projectedFinalScore}
              </p>
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Technology improvement becomes manageable when it is broken into clear, independently
            approvable phases.
          </p>
          <ol className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-2 sm:gap-y-3">
            {JOURNEY_STEPS.map((step, index) => (
              <li
                key={step}
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-foreground"
              >
                <span className="rounded-full border border-border/70 bg-background px-3 py-1.5">
                  {step}
                </span>
                {index < JOURNEY_STEPS.length - 1 ? (
                  <span className="hidden text-muted-foreground sm:inline" aria-hidden>
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <OfferCtaPanel
        headline="Get Your Technology Maturity Assessment"
        supportingText="Understand your technology, approve the highest-priority improvements one phase at a time, measure the results, and continue improving through a living technology roadmap."
        className="bg-gradient-to-b from-muted/20 to-background px-4 py-16 sm:px-6 sm:py-20"
      >
        <ProductOverviewAssessmentCta
          label="Get Your Technology Maturity Assessment"
          placement="product_overview_premium_final_cta"
          className="h-12 w-full px-8 text-base sm:w-auto"
        />
        <Link
          href="/assessment-offer"
          className={cn(buttonVariants({ variant: "outline" }), "h-12 w-full px-8 text-base sm:w-auto")}
          onClick={() => trackProductOverviewFinalCtaClicked("assessment_options", "product_overview_premium_final_cta")}
        >
          Explore StackScore Assessment Options
        </Link>
        <DiscoveryCallCta placement="product_overview_premium_final_cta" />
        <ConsultingCta placement="product_overview_premium_final_cta" />
      </OfferCtaPanel>
    </section>
  );
}
