"use client";

import Link from "next/link";
import { OfferCtaPanel } from "@/components/assessment-offer/offer-cta-panel";
import { ProductOverviewAssessmentCta } from "@/components/product-overview/product-overview-assessment-cta";
import { buttonVariants } from "@/components/ui/button";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
import { trackProductOverviewFinalCtaClicked } from "@/lib/analytics/product-overview-events";
import {
  trackCalBookingClick,
  trackServiceCtaClick,
} from "@/lib/analytics/marketing-events";
import { ENGAGEMENT_NEXT_STEPS } from "@/lib/product-overview/demo-partnership";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { cn } from "@/lib/utils";

function DiscoveryCallCta({ placement }: { placement: string }) {
  const destination = SERVICES_CTA_DESTINATIONS.generalConsultation;

  return (
    <Link
      href={destination.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "outline" }), "h-12 w-full px-8 text-base sm:w-auto")}
      onClick={() => {
        trackServiceCtaClick({
          ctaKey: "generalConsultation",
          linkType: "cal_com",
          placement,
        });
        trackCalBookingClick({ ctaKey: "generalConsultation", placement });
        trackProductOverviewFinalCtaClicked("discovery_call", placement);
      }}
    >
      Schedule a Discovery Call
    </Link>
  );
}

export function ProductOverviewFinalCta() {
  return (
    <section id="product-overview-final-cta" className="border-t border-border/70">
      <OfferCtaPanel
        headline="Ready to See Your Technology This Clearly?"
        supportingText="Every engagement begins with a Technology Maturity Assessment that becomes the foundation for your organization's long-term technology strategy."
        className="bg-gradient-to-b from-muted/20 to-background px-4 py-16 sm:px-6 sm:py-20"
      >
        <ProductOverviewAssessmentCta
          label="Purchase Your Technology Assessment"
          placement="product_overview_premium_final_cta"
          className="h-12 w-full px-8 text-base sm:w-auto"
        />
        <DiscoveryCallCta placement="product_overview_premium_final_cta" />
      </OfferCtaPanel>

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <h3 className="text-center text-lg font-semibold text-foreground">What happens next</h3>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENGAGEMENT_NEXT_STEPS.map((item) => (
            <li
              key={item.step}
              className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Step {item.step}
              </p>
              <p className="mt-2 font-medium text-foreground">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
