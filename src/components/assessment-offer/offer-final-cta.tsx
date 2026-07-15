import { Lock } from "lucide-react";
import { AssessmentPurchaseButton } from "@/components/purchase/assessment-purchase-button";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
import { OfferCtaPanel } from "./offer-cta-panel";

export function OfferFinalCta() {
  return (
    <OfferCtaPanel
      headline="Ready to Take Control of Your Technology?"
      supportingText="Whether you're looking to understand your current environment or build a long-term technology strategy, StackScore gives you the visibility, planning, and guidance needed to make smarter technology decisions."
      footnote={
        <>
          <p className="max-w-sm text-sm text-muted-foreground">
            Secure payment powered by Stripe.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            You&apos;ll receive immediate access after purchase.
          </p>
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground/80">
            <Lock className="h-3 w-3" />
            Encrypted checkout · No account required to purchase
          </p>
        </>
      }
    >
      <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center">
        <AssessmentPurchaseButton
          label="Purchase Technology Assessment"
          className="h-11 w-full px-8 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
          source="offer_final_cta"
        />
        <ServicesCtaLink
          cta="generalConsultation"
          label="Schedule a Discovery Call"
          variant="outline"
          className="h-11 w-full px-8 text-base sm:w-auto"
          placement="offer_final_cta_discovery"
        />
      </div>
    </OfferCtaPanel>
  );
}
