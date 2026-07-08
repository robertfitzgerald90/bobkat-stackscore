import { OFFER_FEATURES } from "@/lib/assessment-offer/content";
import { OfferReveal } from "./offer-reveal";

export function OfferFeatures() {
  return (
    <section className="bg-muted/40 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <OfferReveal className="mb-10 text-center md:mb-14">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            What&apos;s included
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            Everything you need to move from insight to action
          </h2>
        </OfferReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {OFFER_FEATURES.map((feature, index) => {
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
    </section>
  );
}
