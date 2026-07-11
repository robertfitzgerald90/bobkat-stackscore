import { BRAND } from "@/lib/branding";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { OfferSectionHeader } from "@/components/assessment-offer/offer-section-header";

export function InvitationAboutBobkat() {
  return (
    <section
      id="about-bobkat"
      className="border-y border-border/60 bg-muted/30 px-4 py-16 sm:px-6 sm:py-20 md:py-24"
    >
      <div className="mx-auto max-w-3xl text-center">
        <OfferSectionHeader
          eyebrow={`About ${BRAND.companyName}`}
          title="Practical technology guidance for growing organizations"
          className="mb-6 md:mb-8"
        />
        <OfferReveal delayMs={80}>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            {BRAND.companyName} helps organizations reduce complexity and increase capability
            through standardized technology, practical consulting, and repeatable operational
            excellence.
          </p>
        </OfferReveal>
      </div>
    </section>
  );
}
