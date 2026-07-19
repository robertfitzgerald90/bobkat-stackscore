import { OfferCtaPanel } from "@/components/assessment-offer/offer-cta-panel";
import { ProductOverviewAssessmentCta } from "@/components/product-overview/product-overview-assessment-cta";
import { ServicesCtaLink } from "@/components/services/services-cta-link";

export function ProductOverviewFinalCta() {
  return (
    <OfferCtaPanel
      headline="Ready to Build Your Technology Strategy?"
      supportingText="Every StackScore engagement begins with a comprehensive Technology Maturity Assessment that transforms uncertainty into a measurable roadmap for improvement."
      className="border-t border-border/70 bg-gradient-to-b from-muted/20 to-background"
    >
      <ProductOverviewAssessmentCta
        label="Purchase Your Technology Assessment"
        placement="product_overview_final_cta"
        className="h-12 w-full px-8 text-base sm:w-auto"
      />
      <ServicesCtaLink
        cta="generalConsultation"
        label="Schedule a Discovery Call"
        variant="outline"
        placement="product_overview_final_cta"
        className="h-12 w-full px-8 text-base sm:w-auto"
      />
    </OfferCtaPanel>
  );
}
