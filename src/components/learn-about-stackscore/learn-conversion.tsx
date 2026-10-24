import Link from "next/link";
import { Lock } from "lucide-react";
import { OfferCtaPanel } from "@/components/assessment-offer/offer-cta-panel";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import { InteractiveDemoButton } from "@/components/interactive-demo/interactive-demo-button";
import { AssessmentPurchaseButton } from "@/components/purchase/assessment-purchase-button";
import { buttonVariants } from "@/components/ui/button";
import type { AssessmentOfferAttribution } from "@/lib/assessment-offer/attribution";
import { LEARN_CONVERSION_CTAS } from "@/lib/learn-about-stackscore/content";
import { cn } from "@/lib/utils";

type LearnConversionProps = {
  attribution?: AssessmentOfferAttribution;
};

export function LearnConversion({ attribution }: LearnConversionProps) {
  return (
    <OfferCtaPanel
      eyebrow="Next steps"
      headline="Choose how you want to begin"
      supportingText="Start with a free Technology Snapshot, purchase the full Technology Maturity Assessment, or book a consultation with Bobkat IT."
      bracketed
      footnote={
        <>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            Secure payment powered by Stripe.
          </p>
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground/80">
            <Lock className="h-3 w-3" aria-hidden />
            Encrypted checkout · No account required to purchase
          </p>
        </>
      }
    >
      <div className="flex w-full max-w-full min-w-0 flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
        <TechnologySnapshotLink
          label={LEARN_CONVERSION_CTAS.snapshot.label}
          className="h-11 w-full max-w-full px-6 text-base sm:w-auto"
          prospectId={attribution?.prospectId}
          campaignId={attribution?.campaignId}
          placement="learn_conversion_snapshot"
        />
        <AssessmentPurchaseButton
          label={LEARN_CONVERSION_CTAS.purchase.label}
          className="h-11 w-full max-w-full px-6 text-base sm:w-auto"
          source="learn_conversion"
          attribution={attribution}
        />
        <a
          href={LEARN_CONVERSION_CTAS.consultation.href}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 w-full max-w-full px-6 text-base sm:w-auto",
          )}
        >
          {LEARN_CONVERSION_CTAS.consultation.label}
        </a>
      </div>
      <div className="mt-4 flex justify-center">
        <InteractiveDemoButton
          label={LEARN_CONVERSION_CTAS.demo.label}
          placement="learn_conversion_demo"
          returnTo="/assessment-offer"
          variant="ghost"
          className="h-10 px-4 text-sm"
        />
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Prefer a guided walkthrough first?{" "}
        <Link href="/demo" className="text-primary underline-offset-4 hover:underline">
          Open the interactive demo
        </Link>
        .
      </p>
    </OfferCtaPanel>
  );
}
