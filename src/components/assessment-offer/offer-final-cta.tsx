import { Lock } from "lucide-react";
import { AssessmentPurchaseButton } from "@/components/purchase/assessment-purchase-button";
import { OfferReveal } from "./offer-reveal";

export function OfferFinalCta() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto max-w-3xl">
        <OfferReveal>
          <div className="rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/[0.06] to-transparent px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to see where you stand?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Get the full picture of your technology maturity with executive deliverables your
              leadership team can trust.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <AssessmentPurchaseButton
                label="Start My Assessment"
                className="h-11 w-full px-8 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
              />
              <p className="max-w-sm text-sm text-muted-foreground">
                Secure payment powered by Stripe.
              </p>
              <p className="text-xs text-muted-foreground">
                You&apos;ll receive immediate access after purchase.
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground/80">
                <Lock className="h-3 w-3" />
                Encrypted checkout · No account required to purchase
              </p>
            </div>
          </div>
        </OfferReveal>
      </div>
    </section>
  );
}
