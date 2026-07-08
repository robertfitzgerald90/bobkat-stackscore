import { CheckCircle2 } from "lucide-react";
import { BRAND } from "@/lib/branding";
import { OFFER_WHY_POINTS } from "@/lib/assessment-offer/content";
import { OfferReveal } from "./offer-reveal";

export function OfferWhy() {
  return (
    <section className="border-y border-border/60 bg-muted/30 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <OfferReveal>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              Why {BRAND.productName}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              More than a questionnaire
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              StackScore is a structured technology maturity platform — built to give leadership
              teams clarity, confidence, and a practical plan. Not another generic IT audit that
              sits in a drawer.
            </p>
          </OfferReveal>

          <ul className="space-y-4">
            {OFFER_WHY_POINTS.map((point, index) => (
              <OfferReveal key={point.title} delayMs={index * 60}>
                <li className="flex gap-3 rounded-lg border border-border/50 bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground">{point.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {point.description}
                    </p>
                  </div>
                </li>
              </OfferReveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
