import { OfferCtaPanel } from "@/components/assessment-offer/offer-cta-panel";
import { ProductOverviewAssessmentCta } from "@/components/product-overview/product-overview-assessment-cta";
import { ServicesCtaLink } from "@/components/services/services-cta-link";

export function ProductOverviewCTA() {
  return (
    <OfferCtaPanel
      headline="See What Your Technology Strategy Could Look Like"
      supportingText="Start with a Technology Maturity Assessment and turn your current environment into a prioritized, measurable improvement plan."
    >
      <ProductOverviewAssessmentCta
        label="Start Your Technology Assessment"
        placement="product_overview_footer"
        className="h-11 w-full px-8 text-base sm:w-auto"
      />
      <ServicesCtaLink
        cta="vcioOffer"
        label="Learn About Strategic IT Consulting"
        variant="outline"
        placement="product_overview_footer"
        className="h-11 w-full px-8 text-base sm:w-auto"
      />
    </OfferCtaPanel>
  );
}
