"use client";

import { OfferHeroBackground } from "@/components/assessment-offer/offer-hero-background";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { DemoDashboard } from "@/components/product-overview/demo-dashboard";
import { DemoDashboardPreview } from "@/components/product-overview/demo-dashboard-preview";
import { ProductOverviewAssessmentCta } from "@/components/product-overview/product-overview-assessment-cta";
import { Button } from "@/components/ui/button";
import { trackProductOverviewExploreClicked } from "@/lib/analytics/product-overview-events";
import { scrollToSection } from "@/lib/product-overview/polish-classes";
import type { DemoDetailPanel } from "@/lib/product-overview/types";

type ProductOverviewHeroProps = {
  onOpenDetail: (panel: DemoDetailPanel, anchor?: HTMLElement | null) => void;
  tourLauncher?: React.ReactNode;
};

export function ProductOverviewHero({ onOpenDetail, tourLauncher }: ProductOverviewHeroProps) {
  function scrollToDashboard() {
    trackProductOverviewExploreClicked("hero");
    scrollToSection("product-overview-dashboard", "start");
  }

  return (
    <section className="relative overflow-x-clip px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-10 md:pb-16">
      <OfferHeroBackground />

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-12">
        <div className="max-w-2xl lg:pt-2">
          <OfferReveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              The Technology Success Platform
            </p>
          </OfferReveal>

          <OfferReveal delayMs={60}>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
              Turn Technology Into a Clear, Measurable Business Strategy
            </h1>
          </OfferReveal>

          <OfferReveal delayMs={120}>
            <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              StackScore gives business leaders one place to understand their technology posture,
              prioritize improvements, track strategic initiatives, and measure progress over time.
            </p>
          </OfferReveal>

          <OfferReveal
            delayMs={180}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <Button size="lg" className="h-11 px-8 text-base shadow-md" onClick={scrollToDashboard}>
              Explore the Platform
            </Button>
            {tourLauncher}
            <ProductOverviewAssessmentCta
              label="Start Your Technology Assessment"
              placement="product_overview_hero"
              className="h-11 px-8 text-base"
            />
          </OfferReveal>

          <OfferReveal delayMs={240}>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Built for business leaders who need clarity, accountability, and a practical technology
              roadmap.
            </p>
          </OfferReveal>
        </div>

        <OfferReveal delayMs={300} variant="image" className="min-w-0 origin-top">
          <DemoDashboardPreview>
            <DemoDashboard
              compact
              readOnly
              onOpenDetail={(panel, anchor) => {
                scrollToDashboard();
                onOpenDetail(panel, anchor);
              }}
            />
          </DemoDashboardPreview>
        </OfferReveal>
      </div>
    </section>
  );
}
