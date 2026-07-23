import { Lock } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AssessmentPurchaseButton } from "@/components/purchase/assessment-purchase-button";
import { AssessmentExecutiveOverviewPreview } from "@/components/product-previews/assessment-executive-overview-preview";
import { BRAND } from "@/lib/branding";
import { MARKETING_HERO_TITLE } from "@/lib/marketing/tokens";
import { assessmentExecutiveOverviewDemoData } from "@/lib/demo-data/assessment-executive-overview";
import { OfferHeroBackground } from "./offer-hero-background";
import { OfferReveal } from "./offer-reveal";

export function OfferHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 md:pb-24 md:pt-12">
      <OfferHeroBackground />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center text-center">
        <OfferReveal>
          <BrandLogo size={44} variant="stacked" placement="auth" className="mb-6 sm:mb-8" />
        </OfferReveal>

        <OfferReveal delayMs={60}>
          <h1 className={MARKETING_HERO_TITLE}>
            Know Exactly Where Your <span className="marketing-text-gradient">Technology</span> Stands
          </h1>
        </OfferReveal>

        <OfferReveal delayMs={120}>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            The {BRAND.reportTitle} gives growing businesses a clear picture of technology maturity,
            prioritized risks, and an executive-ready path forward — powered by {BRAND.productName}{" "}
            from {BRAND.companyName}.
          </p>
        </OfferReveal>

        <OfferReveal delayMs={180} className="mt-8 flex w-full flex-col items-center gap-3 sm:mt-10">
          <AssessmentPurchaseButton
            label="Start My Assessment"
            className="h-11 w-full px-8 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
            source="offer_hero"
          />
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            Secure checkout powered by Stripe
          </p>
        </OfferReveal>

        <OfferReveal delayMs={240} variant="image" className="mt-10 w-full sm:mt-12 md:mt-14 lg:mt-16">
          <AssessmentExecutiveOverviewPreview data={assessmentExecutiveOverviewDemoData} />
        </OfferReveal>
      </div>
    </section>
  );
}
