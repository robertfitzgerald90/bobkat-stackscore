"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { DemoConversionCta } from "@/components/interactive-demo/demo-conversion-cta";
import { DemoEntryScreen } from "@/components/interactive-demo/demo-entry-screen";
import { DemoHeader } from "@/components/interactive-demo/demo-header";
import { DemoSessionBootstrap } from "@/components/interactive-demo/demo-session-bootstrap";
import { AssessmentPreviewSection } from "@/components/product-overview/assessment-preview-section";
import { DemoPersonalizationLauncher, DemoPersonalizationWizard } from "@/components/product-overview/demo-personalization-wizard";
import { DemoJourneyOverviewSection } from "@/components/product-overview/demo-journey-overview-section";
import {
  InteractiveDemoProvider,
} from "@/components/product-overview/interactive-demo-context";
import { FeaturePopoverHost } from "@/components/product-overview/feature-popover-host";
import {
  ProductOverviewProvider,
  useProductOverview,
} from "@/components/product-overview/product-overview-context";
import { ProductGuidedTour, ProductTourLauncher } from "@/components/product-overview/product-guided-tour";
import { ProductOverviewFinalCta } from "@/components/product-overview/product-overview-final-cta";
import { ProductOverviewHero } from "@/components/product-overview/product-overview-hero";
import { ProductOverviewNav } from "@/components/product-overview/product-overview-nav";
import { ProductOverviewSectionTracker } from "@/components/product-overview/product-overview-section-tracker";
import { ProductOverviewSkipLink } from "@/components/product-overview/product-overview-skip-link";
import { ProductOverviewTrustStrip } from "@/components/product-overview/product-overview-trust-strip";
import { ProductOverviewViewTracker } from "@/components/product-overview/product-overview-view-tracker";
import {
  ProductPresentationLauncher,
  ProductPresentationMode,
} from "@/components/product-overview/product-presentation-mode";
import { SectionLoadingSkeleton } from "@/components/product-overview/section-loading-skeleton";
import type { DemoDeepLinkSection } from "@/lib/interactive-demo/routes";

const AssessmentSection = dynamic(
  () =>
    import("@/components/product-overview/assessment-section").then((module) => ({
      default: module.AssessmentSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const PhasedRoadmapSection = dynamic(
  () =>
    import("@/components/product-overview/phased-roadmap-section").then((module) => ({
      default: module.PhasedRoadmapSection,
    })),
  { loading: () => <SectionLoadingSkeleton minHeight="min-h-[32rem]" /> },
);

const PhaseProposalSection = dynamic(
  () =>
    import("@/components/product-overview/phase-proposal-section").then((module) => ({
      default: module.PhaseProposalSection,
    })),
  { loading: () => <SectionLoadingSkeleton minHeight="min-h-[28rem]" /> },
);

const ImplementationProgressSection = dynamic(
  () =>
    import("@/components/product-overview/implementation-progress-section").then((module) => ({
      default: module.ImplementationProgressSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const MeasurableImprovementSection = dynamic(
  () =>
    import("@/components/product-overview/measurable-improvement-section").then((module) => ({
      default: module.MeasurableImprovementSection,
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

const ExecutiveReportLibrarySection = dynamic(
  () =>
    import("@/components/product-overview/executive-report-library-section").then((module) => ({
      default: module.ExecutiveReportLibrarySection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

const QuarterlyReviewSection = dynamic(
  () =>
    import("@/components/product-overview/quarterly-review-section").then((module) => ({
      default: module.QuarterlyReviewSection,
    })),
  { loading: () => <SectionLoadingSkeleton /> },
);

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

function ProductOverviewContent({
  initialSection,
}: {
  initialSection?: DemoDeepLinkSection;
}) {
  const { openDetail, presentationActive } = useProductOverview();

  return (
    <div className="min-w-0 overflow-x-clip bg-background pb-24 lg:pb-0">
      <Suspense fallback={null}>
        <DemoSessionBootstrap sectionSlug={initialSection} />
      </Suspense>
      <Suspense fallback={null}>
        <DemoEntryScreen />
      </Suspense>
      <ProductOverviewSkipLink />
      <ProductOverviewViewTracker />
      <ProductOverviewSectionTracker />
      <DemoHeader />
      <ProductOverviewNav />
      <main id="product-overview-main">
        <ProductOverviewHero
          onOpenDetail={openDetail}
          tourLauncher={
            <>
              <DemoPersonalizationLauncher className="h-11 px-6 text-base" />
              <ProductTourLauncher className="h-11 px-8 text-base" />
              <ProductPresentationLauncher className="h-11 px-6 text-base md:hidden" />
            </>
          }
        />

        <DemoJourneyOverviewSection />

        <Suspense fallback={<SectionLoadingSkeleton />}>
          {/* Guided phased-roadmap journey */}
          <AssessmentSection />
          <PhasedRoadmapSection />
          <PhaseProposalSection />
          <ImplementationProgressSection />
          <MeasurableImprovementSection />
          <BudgetPlanningSection />
          <ExecutiveReportLibrarySection />
          <QuarterlyReviewSection />

          {/* Enrichment sections retained below the guided story */}
          <AssessmentPreviewSection />
          <TechnologyTimelineSection />
          <TechnologyJourneySection />
          <CurrentFutureStateSection />
          <RecommendationsWorkspaceSection />
          <BusinessValueSection />
          <ProjectsWorkspaceSection />
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
      <FeaturePopoverHost />
      <DemoPersonalizationWizard />
      <ProductGuidedTour />
      <ProductPresentationMode />
      {!presentationActive ? <DemoConversionCta /> : null}
    </div>
  );
}

export function ProductOverviewExperience({
  initialSection,
}: {
  initialSection?: DemoDeepLinkSection;
} = {}) {
  return (
    <ProductOverviewProvider>
      <InteractiveDemoProvider>
        <ProductOverviewContent initialSection={initialSection} />
      </InteractiveDemoProvider>
    </ProductOverviewProvider>
  );
}
