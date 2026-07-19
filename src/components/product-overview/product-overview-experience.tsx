"use client";

import { useState } from "react";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { DemoModeBanner } from "@/components/product-overview/demo-mode-banner";
import { DemoDashboard } from "@/components/product-overview/demo-dashboard";
import { MetricDetailDrawer } from "@/components/product-overview/metric-detail-drawer";
import { PhaseTeaserSection } from "@/components/product-overview/phase-teaser-section";
import { ProductOverviewCTA } from "@/components/product-overview/product-overview-cta";
import { ProductOverviewHeader } from "@/components/product-overview/product-overview-header";
import { ProductOverviewHero } from "@/components/product-overview/product-overview-hero";
import { ProductOverviewNav } from "@/components/product-overview/product-overview-nav";
import { ProductOverviewViewTracker } from "@/components/product-overview/product-overview-view-tracker";
import type { DemoDetailPanel } from "@/lib/product-overview/types";

export function ProductOverviewExperience() {
  const [detailPanel, setDetailPanel] = useState<DemoDetailPanel>(null);

  return (
    <div className="min-w-0 overflow-x-clip bg-background">
      <ProductOverviewViewTracker />
      <ProductOverviewHeader />
      <ProductOverviewNav
        onUpcomingClick={(itemId) => {
          document.getElementById(`product-overview-teaser-${itemId}`)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
      />
      <main>
        <ProductOverviewHero onOpenDetail={setDetailPanel} />
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
              <DemoDashboard onOpenDetail={setDetailPanel} />
            </div>
          </div>
        </section>
        <PhaseTeaserSection />
        <ProductOverviewCTA />
      </main>
      <OfferFooter />
      <MetricDetailDrawer panel={detailPanel} onClose={() => setDetailPanel(null)} />
    </div>
  );
}
