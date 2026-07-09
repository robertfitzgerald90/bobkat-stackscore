import {
  OFFER_SHOWCASE_FEATURES,
  OFFER_SHOWCASE_HERO,
} from "@/lib/assessment-offer/content";
import { OfferFeatures } from "./offer-features";
import { OfferFinalCta } from "./offer-final-cta";
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
      <footer className="border-t border-border/60 px-4 py-8 text-center text-xs text-muted-foreground sm:px-6">
        Powered by Bobkat IT · StackScore
      </footer>
    </div>
  );
}
