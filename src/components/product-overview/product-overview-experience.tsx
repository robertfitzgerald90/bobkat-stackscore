"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { DemoModeBanner } from "@/components/product-overview/demo-mode-banner";
import { DemoDashboard } from "@/components/product-overview/demo-dashboard";
import { MetricDetailDrawer } from "@/components/product-overview/metric-detail-drawer";
import {
  ProductOverviewProvider,
  useProductOverview,
} from "@/components/product-overview/product-overview-context";
import { ProductGuidedTour, ProductTourLauncher } from "@/components/product-overview/product-guided-tour";
import { ProductOverviewFinalCta } from "@/components/product-overview/product-overview-final-cta";
import { ProductOverviewHeader } from "@/components/product-overview/product-overview-header";
import { ProductOverviewHero } from "@/components/product-overview/product-overview-hero";
import { ProductOverviewNav } from "@/components/product-overview/product-overview-nav";
import { ProductOverviewSectionTracker } from "@/components/product-overview/product-overview-section-tracker";
import { ProductOverviewSkipLink } from "@/components/product-overview/product-overview-skip-link";
import { ProductOverviewStickyCta } from "@/components/product-overview/product-overview-sticky-cta";
import { ProductOverviewTrustStrip } from "@/components/product-overview/product-overview-trust-strip";
import { ProductOverviewViewTracker } from "@/components/product-overview/product-overview-view-tracker";
import {
  ProductPresentationLauncher,
  ProductPresentationMode,
} from "@/components/product-overview/product-presentation-mode";
import { SectionLoadingSkeleton } from "@/components/product-overview/section-loading-skeleton";

const TechnologyTimelineSection = dynamic(
  () =>
    import("@/components/product-overview/technology-timeline-section").then((module) => ({
      default: module.TechnologyTimelineSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const TechnologyJourneySection = dynamic(
  () =>
    import("@/components/product-overview/technology-journey-section").then((module) => ({
      default: module.TechnologyJourneySection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const AssessmentSection = dynamic(
  () =>
    import("@/components/product-overview/assessment-section").then((module) => ({
      default: module.AssessmentSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const CurrentFutureStateSection = dynamic(
  () =>
    import("@/components/product-overview/current-future-state-section").then((module) => ({
      default: module.CurrentFutureStateSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const RecommendationsWorkspaceSection = dynamic(
  () =>
    import("@/components/product-overview/recommendations-workspace-section").then((module) => ({
      default: module.RecommendationsWorkspaceSection,
    })),
  { loading: () => <SectionLoadingSkeleton minHeight="min-h-[32rem]" /> },
);

const RoadmapExperienceSection = dynamic(
  () =>
    import("@/components/product-overview/roadmap-experience-section").then((module) => ({
      default: module.RoadmapExperienceSection,
    })),
  { loading: () => <SectionLoadingSkeleton minHeight="min-h-[32rem]" /> },
);

const BusinessValueSection = dynamic(
  () =>
    import("@/components/product-overview/business-value-section").then((module) => ({
      default: module.BusinessValueSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const ProjectsWorkspaceSection = dynamic(
  () =>
    import("@/components/product-overview/projects-workspace-section").then((module) => ({
      default: module.ProjectsWorkspaceSection,
    })),
  { loading: () => <SectionLoadingSkeleton minHeight="min-h-[32rem]" /> },
);

const QuarterlyReviewSection = dynamic(
  () =>
    import("@/components/product-overview/quarterly-review-section").then((module) => ({
      default: module.QuarterlyReviewSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const ExecutiveReportLibrarySection = dynamic(
  () =>
    import("@/components/product-overview/executive-report-library-section").then((module) => ({
      default: module.ExecutiveReportLibrarySection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const BudgetPlanningSection = dynamic(
  () =>
    import("@/components/product-overview/budget-planning-section").then((module) => ({
      default: module.BudgetPlanningSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const BusinessOutcomesDashboardSection = dynamic(
  () =>
    import("@/components/product-overview/business-outcomes-dashboard-section").then((module) => ({
      default: module.BusinessOutcomesDashboardSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const ContinuousImprovementSection = dynamic(
  () =>
    import("@/components/product-overview/continuous-improvement-section").then((module) => ({
      default: module.ContinuousImprovementSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const ClientCollaborationSection = dynamic(
  () =>
    import("@/components/product-overview/client-collaboration-section").then((module) => ({
      default: module.ClientCollaborationSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const StrategicPlanningSection = dynamic(
  () =>
    import("@/components/product-overview/strategic-planning-section").then((module) => ({
      default: module.StrategicPlanningSection,
    })),
  { loading: () => <SectionLoadingSkeleton minHeight="min-h-[32rem]" /> },
);

const ExecutiveDecisionCenterSection = dynamic(
  () =>
    import("@/components/product-overview/executive-decision-center-section").then((module) => ({
      default: module.ExecutiveDecisionCenterSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const AiInsightsPreviewSection = dynamic(
  () =>
    import("@/components/product-overview/ai-insights-preview-section").then((module) => ({
      default: module.AiInsightsPreviewSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const ClientSuccessOutcomesSection = dynamic(
  () =>
    import("@/components/product-overview/client-success-outcomes-section").then((module) => ({
      default: module.ClientSuccessOutcomesSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const WhyClientsLoveSection = dynamic(
  () =>
    import("@/components/product-overview/why-clients-love-section").then((module) => ({
      default: module.WhyClientsLoveSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const StackscoreEcosystemSection = dynamic(
  () =>
    import("@/components/product-overview/stackscore-ecosystem-section").then((module) => ({
      default: module.StackscoreEcosystemSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const PlatformOverviewMapSection = dynamic(
  () =>
    import("@/components/product-overview/platform-overview-map-section").then((module) => ({
      default: module.PlatformOverviewMapSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

function ProductOverviewContent() {
  const { detailPanel, openDetail, closeDetail, presentationActive } = useProductOverview();

  return (
    <div className="min-w-0 overflow-x-clip bg-background pb-20 sm:pb-0">
      <ProductOverviewSkipLink />
      <ProductOverviewViewTracker />
      <ProductOverviewSectionTracker />
      <ProductOverviewHeader />
      <ProductOverviewNav />
      <main id="product-overview-main">
        <ProductOverviewHero
          onOpenDetail={openDetail}
          tourLauncher={
            <>
              <ProductTourLauncher className="h-11 px-8 text-base" />
              <ProductPresentationLauncher className="h-11 px-6 text-base md:hidden" />
            </>
          }
        />
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
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_24px_80px_-40px_rgba(8,47,91,0.25)] transition-shadow duration-300 motion-reduce:transition-none hover:shadow-[0_28px_90px_-36px_rgba(8,47,91,0.3)]">
              <DemoDashboard onOpenDetail={openDetail} />
            </div>
          </div>
        </section>

        <Suspense fallback={<SectionLoadingSkeleton />}>
          <TechnologyTimelineSection />
          <TechnologyJourneySection />
          <AssessmentSection />
          <CurrentFutureStateSection />
          <RecommendationsWorkspaceSection />
          <RoadmapExperienceSection />
          <BusinessValueSection />
          <ProjectsWorkspaceSection />
          <QuarterlyReviewSection />
          <ExecutiveReportLibrarySection />
          <BudgetPlanningSection />
          <BusinessOutcomesDashboardSection />
          <ContinuousImprovementSection />
          <ClientCollaborationSection />
          <StrategicPlanningSection />
          <ExecutiveDecisionCenterSection />
          <AiInsightsPreviewSection />
          <ClientSuccessOutcomesSection />
          <WhyClientsLoveSection />
          <StackscoreEcosystemSection />
          <PlatformOverviewMapSection />
        </Suspense>

        <ProductOverviewTrustStrip />
        <ProductOverviewFinalCta />
      </main>
      <OfferFooter />
      <MetricDetailDrawer panel={detailPanel} onClose={closeDetail} />
      <ProductGuidedTour />
      <ProductPresentationMode />
      {!presentationActive ? <ProductOverviewStickyCta /> : null}
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
