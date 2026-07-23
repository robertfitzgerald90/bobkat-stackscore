import Link from "next/link";
import { Lock } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AssessmentPurchaseButton } from "@/components/purchase/assessment-purchase-button";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import { AssessmentExecutiveOverviewPreview } from "@/components/product-previews/assessment-executive-overview-preview";
import { buttonVariants } from "@/components/ui/button";
import {
  buildAssessmentInvitationHref,
  type AssessmentOfferAttribution,
} from "@/lib/assessment-offer/attribution";
import { BRAND } from "@/lib/branding";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";
import { MARKETING_HERO_TITLE } from "@/lib/marketing/tokens";
import { assessmentExecutiveOverviewDemoData } from "@/lib/demo-data/assessment-executive-overview";
import { cn } from "@/lib/utils";
import { OfferHeroBackground } from "./offer-hero-background";
import { OfferReveal } from "./offer-reveal";

export function OfferHero({ attribution }: { attribution?: AssessmentOfferAttribution }) {
  const invitationHref = buildAssessmentInvitationHref(attribution);

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 md:pb-24 md:pt-12">
      <OfferHeroBackground />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center text-center">
        <OfferReveal>
          <BrandLogo size={44} variant="stacked" placement="auth" className="mb-6 sm:mb-8" />
        </OfferReveal>

        <OfferReveal delayMs={60}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {BRAND.reportTitle}
          </p>
          <h1 className={cn(MARKETING_HERO_TITLE, "mt-4")}>
            Know Exactly Where Your <span className="marketing-text-gradient">Technology</span> Stands
          </h1>
        </OfferReveal>

        <OfferReveal delayMs={120}>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            The {BRAND.reportTitle} gives growing businesses a clear picture of technology maturity,
            prioritized risks, and an executive-ready path forward — powered by {BRAND.productName}{" "}
            from {BRAND.companyName}.
          </p>
          <p className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            $1,500 one-time · Executive-ready deliverables included
          </p>
        </OfferReveal>

        <OfferReveal delayMs={180} className="mt-8 flex w-full flex-col items-center gap-3 sm:mt-10">
          <AssessmentPurchaseButton
            label="Purchase Technology Maturity Assessment — $1,500"
            className="h-11 w-full px-8 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
            source="offer_hero"
            attribution={attribution}
          />
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center">
            <Link
              href={invitationHref}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 w-full px-6 text-base sm:w-auto",
              )}
            >
              Start with a free invitation snapshot
            </Link>
            <TechnologySnapshotLink
              label="Free Technology Snapshot"
              className="h-11 w-full px-6 text-base sm:w-auto"
              prospectId={attribution?.prospectId}
              campaignId={attribution?.campaignId}
              placement="offer_hero_snapshot"
            />
          </div>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            Secure checkout powered by Stripe
          </p>
          <a
            href={BOBKAT_IT_URLS.technologyMaturityAssessment}
            className="text-sm font-medium text-primary hover:underline"
          >
            Learn more about the assessment on Bobkat IT
          </a>
        </OfferReveal>

        <OfferReveal delayMs={240} variant="image" className="mt-10 w-full sm:mt-12 md:mt-14 lg:mt-16">
          <AssessmentExecutiveOverviewPreview data={assessmentExecutiveOverviewDemoData} />
        </OfferReveal>
      </div>
    </section>
  );
}
