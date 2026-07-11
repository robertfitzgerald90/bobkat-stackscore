import {
  OFFER_SHOWCASE_FEATURES,
  OFFER_SHOWCASE_HERO,
} from "@/lib/assessment-offer/content";
import { OfferFeatures } from "./offer-features";
import { OfferFinalCta } from "./offer-final-cta";
import { OfferFooter } from "./offer-footer";
import { OfferHero } from "./offer-hero";
import { OfferNav } from "./offer-nav";
import { OfferScreenshotGallery } from "./offer-screenshot-gallery";
import { OfferTimeline } from "./offer-timeline";
import { OfferWhy } from "./offer-why";

export function AssessmentOfferLanding() {
  return (
    <div className="min-h-screen bg-background">
      <OfferNav />
      <main>
        <OfferHero />
        <div className="py-12 sm:py-16">
          <OfferScreenshotGallery hero={OFFER_SHOWCASE_HERO} features={OFFER_SHOWCASE_FEATURES} />
        </div>
        <OfferFeatures />
        <OfferTimeline />
        <OfferWhy />
        <OfferFinalCta />
      </main>
      <OfferFooter />
    </div>
  );
}
