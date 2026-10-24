import Link from "next/link";
import { Lock } from "lucide-react";
import { OfferHeroBackground } from "@/components/assessment-offer/offer-hero-background";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { CornerBrackets } from "@/components/design-system/instrument/corner-brackets";
import { AssessmentExecutiveOverviewPreview } from "@/components/product-previews/assessment-executive-overview-preview";
import { AssessmentPurchaseButton } from "@/components/purchase/assessment-purchase-button";
import { buttonVariants } from "@/components/ui/button";
import type { AssessmentOfferAttribution } from "@/lib/assessment-offer/attribution";
import { assessmentExecutiveOverviewDemoData } from "@/lib/demo-data/assessment-executive-overview";
import { LEARN_PAGE_HERO } from "@/lib/learn-about-stackscore/content";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { MARKETING_HERO_TITLE } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";

type LearnHeroProps = {
  attribution?: AssessmentOfferAttribution;
};

export function LearnHero({ attribution }: LearnHeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-10 md:pb-20">
      <OfferHeroBackground tone="phosphor" />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <OfferReveal>
          <BrandLogo size={44} variant="stacked" placement="auth" className="mb-6 sm:mb-8" />
        </OfferReveal>

        <OfferReveal delayMs={60}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {LEARN_PAGE_HERO.eyebrow}
          </p>
          <h1 className={cn(MARKETING_HERO_TITLE, "mt-4 max-w-4xl")}>
            {LEARN_PAGE_HERO.titleLead}{" "}
            <span className="marketing-text-gradient">{LEARN_PAGE_HERO.titleAccent}</span>
          </h1>
        </OfferReveal>

        <OfferReveal delayMs={120}>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            {LEARN_PAGE_HERO.description}
          </p>
          <p className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            {LEARN_PAGE_HERO.priceLine}
          </p>
        </OfferReveal>

        <OfferReveal delayMs={180} className="mt-8 flex w-full flex-col items-center gap-3 sm:mt-10">
          <AssessmentPurchaseButton
            label="Purchase Technology Maturity Assessment — $1,500"
            className="h-11 w-full px-8 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
            source="learn_hero"
            attribution={attribution}
          />
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center">
            <TechnologySnapshotLink
              label={SERVICES_CTA_DESTINATIONS.snapshot.label}
              className="h-11 w-full px-6 text-base sm:w-auto"
              prospectId={attribution?.prospectId}
              campaignId={attribution?.campaignId}
              placement="learn_hero_snapshot"
            />
            <a
              href={SERVICES_CTA_DESTINATIONS.generalConsultation.href}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 w-full px-6 text-base sm:w-auto",
              )}
            >
              Book a Consultation
            </a>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Secure checkout powered by Stripe
          </p>
          <Link
            href="#how-stackscore-works"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            See how StackScore works
          </Link>
        </OfferReveal>

        <div className="mt-10 w-full max-w-4xl sm:mt-12">
          <OfferReveal delayMs={240} variant="image">
            <CornerBrackets corners="four">
              <AssessmentExecutiveOverviewPreview data={assessmentExecutiveOverviewDemoData} />
            </CornerBrackets>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Sample executive view — demonstration data only, not a real customer.
            </p>
          </OfferReveal>
        </div>
      </div>
    </section>
  );
}
