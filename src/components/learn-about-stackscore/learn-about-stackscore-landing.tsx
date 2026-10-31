import { AssessmentOfferViewTracker } from "@/components/analytics/assessment-offer-view-tracker";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { OfferNav } from "@/components/assessment-offer/offer-nav";
import { StackScoreAppShowcase } from "@/components/marketing/stackscore-app-showcase";
import { PublicPageShell } from "@/components/public/public-page-shell";
import type { AssessmentOfferAttribution } from "@/lib/assessment-offer/attribution";
import { LearnContinuedImprovement } from "./learn-continued-improvement";
import { LearnConversion } from "./learn-conversion";
import { LearnDeliverables } from "./learn-deliverables";
import { LearnHero } from "./learn-hero";
import { LearnHowItWorks } from "./learn-how-it-works";
import { LearnRecommendations } from "./learn-recommendations";

type LearnAboutStackScoreLandingProps = {
  attribution?: AssessmentOfferAttribution;
};

/**
 * Public product page: Learn About StackScore / Technology Maturity Assessment offer.
 * Route: `/assessment-offer`
 */
export function LearnAboutStackScoreLanding({
  attribution,
}: LearnAboutStackScoreLandingProps) {
  return (
    <PublicPageShell className="funnel-instrument">
      <AssessmentOfferViewTracker />
      <OfferNav />
      <main>
        <LearnHero attribution={attribution} />
        <LearnHowItWorks />
        <StackScoreAppShowcase />
        <LearnRecommendations />
        <LearnDeliverables />
        <LearnContinuedImprovement />
        <LearnConversion attribution={attribution} />
      </main>
      <OfferFooter />
    </PublicPageShell>
  );
}
