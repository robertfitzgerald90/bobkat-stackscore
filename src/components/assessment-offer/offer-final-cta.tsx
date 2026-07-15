import Link from "next/link";
import { Lock } from "lucide-react";
import { AssessmentPurchaseButton } from "@/components/purchase/assessment-purchase-button";
import { buttonVariants } from "@/components/ui/button";
import { OfferCtaPanel } from "./offer-cta-panel";
import { cn } from "@/lib/utils";

export function OfferFinalCta() {
  return (
    <OfferCtaPanel
      eyebrow="Ready to get started?"
      headline="Start Your Technology Maturity Assessment"
      supportingText="Purchase your comprehensive Technology Maturity Assessment to establish your baseline, identify critical priorities, and receive a practical technology improvement roadmap."
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
          label="Purchase Assessment — $1,500"
          className="h-11 w-full px-8 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
          source="offer_final_cta"
        />
        <Link
          href="#assessment-inclusions"
          className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full px-8 text-base sm:w-auto")}
        >
          Learn More About the Assessment
        </Link>
      </div>
    </OfferCtaPanel>
  );
}
