import { AssessmentOfferShowcase } from "./assessment-offer-showcase";
import { OfferFeatures } from "./offer-features";
import { OfferFinalCta } from "./offer-final-cta";
import { OfferFooter } from "./offer-footer";
import { OfferHero } from "./offer-hero";
import { OfferNav } from "./offer-nav";
import { OfferTimeline } from "./offer-timeline";
import { OfferWhy } from "./offer-why";

export function AssessmentOfferLanding() {
  return (
    <div className="min-h-screen bg-background">
      <OfferNav />
      <main>
        <OfferHero />
        <AssessmentOfferShowcase />
        <OfferFeatures />
        <OfferTimeline />
        <OfferWhy />
        <OfferFinalCta />
      </main>
      <OfferFooter />
    </div>
  );
}
