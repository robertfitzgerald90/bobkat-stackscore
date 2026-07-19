import { BarChart3, Lock, ShieldCheck, Users } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";

const TRUST_ITEMS = [
  {
    icon: BarChart3,
    title: "Eight-pillar maturity framework",
    description: "Executive-ready scoring across strategy, security, infrastructure, and operations.",
  },
  {
    icon: ShieldCheck,
    title: "Executive reporting built in",
    description: "Business reviews and leadership reports rendered from live platform data.",
  },
  {
    icon: Lock,
    title: "Security-conscious demo",
    description: "Read-only preview with isolated data — no authentication or client records required.",
  },
  {
    icon: Users,
    title: "Strategic IT Consulting partnership",
    description: "Technology advisory that turns assessments into measurable, ongoing improvement.",
  },
];

export function ProductOverviewTrustStrip() {
  return (
    <section
      id="product-overview-trust"
      aria-label="Platform trust signals"
      className="border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Built for Business Leaders
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Enterprise-grade technology strategy, presented with consulting credibility
            </h2>
          </div>
        </OfferReveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TRUST_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <OfferReveal key={item.title} delayMs={index * 50}>
                <div className="h-full rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md motion-reduce:transition-none">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </OfferReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
