import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { OfferSectionHeader } from "@/components/assessment-offer/offer-section-header";
import { INVITATION_BENEFITS } from "@/lib/assessment-invitation/content";
import { INVITATION_JOURNEY_SCREENSHOT } from "@/lib/assessment-invitation/screenshots";
import { InvitationProductScreenshot } from "./invitation-product-screenshot";

export function InvitationWhySection() {
  return (
    <section id="why-stackscore" className="bg-muted/40 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <OfferSectionHeader
          eyebrow="Why organizations use StackScore"
          title="Technology clarity for business leaders"
          description="Built for owners and leadership teams who need practical insight — not another IT audit that sits in a drawer."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {INVITATION_BENEFITS.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <OfferReveal key={feature.title} delayMs={index * 50}>
                <div className="group h-full rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </OfferReveal>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-12 w-full max-w-7xl sm:mt-14 md:mt-16">
        <InvitationProductScreenshot
          image={INVITATION_JOURNEY_SCREENSHOT}
          caption="Every recommendation becomes a prioritized technology improvement roadmap."
          delayMs={180}
        />
      </div>
    </section>
  );
}
