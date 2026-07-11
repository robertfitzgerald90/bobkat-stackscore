import { OFFER_FEATURES } from "@/lib/assessment-offer/content";
import { OfferFeatureGrid } from "./offer-feature-grid";

export function OfferFeatures() {
  return (
    <OfferFeatureGrid
      eyebrow="What's included"
      title="Everything you need to move from insight to action"
      features={OFFER_FEATURES}
      columns={3}
    />
  );
}
