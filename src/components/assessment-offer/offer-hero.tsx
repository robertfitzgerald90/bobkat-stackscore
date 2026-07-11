import { Lock } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AssessmentPurchaseButton } from "@/components/purchase/assessment-purchase-button";
import { BRAND } from "@/lib/branding";
import { OfferHeroBackground } from "./offer-hero-background";
import { OfferReveal } from "./offer-reveal";

export function OfferHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 md:pb-24 md:pt-16">
      <OfferHeroBackground />

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <OfferReveal>
          <BrandLogo size={44} variant="stacked" className="mb-8" />
        </OfferReveal>

        <OfferReveal delayMs={60}>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Know Exactly Where Your Technology Stands
          </h1>
        </OfferReveal>

        <OfferReveal delayMs={120}>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:mt-6">
            The {BRAND.reportTitle} gives growing businesses a clear picture of technology maturity,
            prioritized risks, and an executive-ready path forward — powered by {BRAND.productName}{" "}
            from {BRAND.companyName}.
          </p>
        </OfferReveal>

        <OfferReveal delayMs={180} className="mt-8 flex w-full max-w-md flex-col items-center gap-3 sm:mt-10">
          <AssessmentPurchaseButton
            label="Start My Assessment"
            className="h-11 w-full px-8 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
          />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            Secure checkout powered by Stripe
          </p>
        </OfferReveal>
      </div>
    </section>
  );
}
