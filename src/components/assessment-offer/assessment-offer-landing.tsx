import { DemoCompactPanel } from "@/components/interactive-demo/demo-compact-panel";
import { DemoStackscoreExperienceSection } from "@/components/interactive-demo/demo-stackscore-experience-section";
import { PublicPageShell } from "@/components/public/public-page-shell";
import type { AssessmentOfferAttribution } from "@/lib/assessment-offer/attribution";
import { AssessmentOfferShowcase } from "./assessment-offer-showcase";
import { OfferFeatures } from "./offer-features";
import { OfferFinalCta } from "./offer-final-cta";
import { OfferFooter } from "./offer-footer";
import { OfferHero } from "./offer-hero";
import { OfferNav } from "./offer-nav";
import { OfferTimeline } from "./offer-timeline";
import { OfferWhy } from "./offer-why";

export function AssessmentOfferLanding({
  attribution,
}: {
  attribution?: AssessmentOfferAttribution;
}) {
  return (
    <PublicPageShell>
      <OfferNav />
      <main>
        <OfferHero attribution={attribution} />
        <DemoStackscoreExperienceSection
          placement="stackscore_page"
          returnTo="/assessment-offer"
        />
        <AssessmentOfferShowcase />
        <OfferFeatures attribution={attribution} />
        <OfferTimeline />
        <OfferWhy />
        <section className="px-4 pb-6 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <DemoCompactPanel
              heading="Want to Explore It First?"
              copy="Take a guided look through the StackScore client experience before purchasing. The interactive demo shows the dashboards, recommendations, roadmap, improvement phases, and strategic tools included in the platform."
              placement="assessment_offer"
              returnTo="/assessment-offer"
              demoLabel="Launch Demo"
            />
          </div>
        </section>
        <OfferFinalCta attribution={attribution} />
      </main>
      <OfferFooter />
    </PublicPageShell>
  );
}
