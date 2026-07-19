"use client";

import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { AssessmentSection } from "@/components/product-overview/assessment-section";
import { BusinessValueSection } from "@/components/product-overview/business-value-section";
import { CurrentFutureStateSection } from "@/components/product-overview/current-future-state-section";
import { DemoModeBanner } from "@/components/product-overview/demo-mode-banner";
import { DemoDashboard } from "@/components/product-overview/demo-dashboard";
import { MetricDetailDrawer } from "@/components/product-overview/metric-detail-drawer";
import { Phase3TeaserSection } from "@/components/product-overview/phase-3-teaser-section";
import { ProductOverviewCTA } from "@/components/product-overview/product-overview-cta";
import {
  ProductOverviewProvider,
  useProductOverview,
} from "@/components/product-overview/product-overview-context";
import { ProductOverviewHeader } from "@/components/product-overview/product-overview-header";
import { ProductOverviewHero } from "@/components/product-overview/product-overview-hero";
import { ProductOverviewNav } from "@/components/product-overview/product-overview-nav";
import { ProductOverviewViewTracker } from "@/components/product-overview/product-overview-view-tracker";
import { RecommendationsWorkspaceSection } from "@/components/product-overview/recommendations-workspace-section";
import { RoadmapExperienceSection } from "@/components/product-overview/roadmap-experience-section";
import { TechnologyJourneySection } from "@/components/product-overview/technology-journey-section";

function ProductOverviewContent() {
  const { detailPanel, openDetail, closeDetail } = useProductOverview();

  return (
    <div className="min-w-0 overflow-x-clip bg-background">
      <ProductOverviewViewTracker />
      <ProductOverviewHeader />
      <ProductOverviewNav />
      <main>
        <ProductOverviewHero onOpenDetail={openDetail} />
        <section
          id="product-overview-dashboard"
          className="scroll-mt-36 border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
        >
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Client Success Dashboard
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Experience StackScore from a client&apos;s perspective
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Explore Northstar Manufacturing&apos;s technology command center with realistic
                scores, priorities, projects, and executive planning signals.
              </p>
            </div>
            <DemoModeBanner />
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_24px_80px_-40px_rgba(8,47,91,0.25)]">
              <DemoDashboard onOpenDetail={openDetail} />
            </div>
          </div>
        </section>
        <TechnologyJourneySection />
        <AssessmentSection />
        <CurrentFutureStateSection />
        <RecommendationsWorkspaceSection />
        <RoadmapExperienceSection />
        <BusinessValueSection />
        <Phase3TeaserSection />
        <ProductOverviewCTA />
      </main>
      <OfferFooter />
      <MetricDetailDrawer panel={detailPanel} onClose={closeDetail} />
    </div>
  );
}

export function ProductOverviewExperience() {
  return (
    <ProductOverviewProvider>
      <ProductOverviewContent />
    </ProductOverviewProvider>
  );
}
