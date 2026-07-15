import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { OfferSectionHeader } from "@/components/assessment-offer/offer-section-header";
import { INVITATION_DISCOVER_FEATURES } from "@/lib/assessment-invitation/content";
import { INVITATION_SNAPSHOT_REPORT_SCREENSHOT } from "@/lib/assessment-invitation/screenshots";
import { InvitationProductScreenshot } from "./invitation-product-screenshot";

const columnClassName = "sm:grid-cols-2 lg:grid-cols-4";

export function InvitationDiscoverSection() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <OfferSectionHeader
          eyebrow="What you'll discover"
          title="A clearer picture of your technology environment"
          description="StackScore translates your technology landscape into business insights you can act on — starting with a free snapshot and growing into a full maturity assessment."
        />

        <div className={`grid gap-4 lg:gap-6 ${columnClassName}`}>
          {INVITATION_DISCOVER_FEATURES.map((feature, index) => {
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
          image={INVITATION_SNAPSHOT_REPORT_SCREENSHOT}
          caption="Receive an executive-ready snapshot of your organization's technology maturity in minutes."
          delayMs={220}
        />
      </div>
    </section>
  );
}
