import { Lock } from "lucide-react";
import { AssessmentPurchaseButton } from "@/components/purchase/assessment-purchase-button";
import { OfferCtaPanel } from "./offer-cta-panel";

export function OfferFinalCta() {
  return (
    <OfferCtaPanel
      headline="Ready to see where you stand?"
      supportingText="Get the full picture of your technology maturity with executive deliverables your leadership team can trust."
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
      <AssessmentPurchaseButton
        label="Start My Assessment"
        className="h-11 w-full px-8 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
      />
    </OfferCtaPanel>
  );
}
