import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Card, CardContent } from "@/components/ui/card";
import { CLIENT_SUCCESS_OUTCOMES } from "@/lib/product-overview/demo-partnership";

export function ClientSuccessOutcomesSection() {
  return (
    <section
      id="product-overview-success-outcomes"
      className="scroll-mt-[var(--demo-shell-height,9rem)] border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Measurable Outcomes
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              What ongoing partnership delivers
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Representative outcomes from organizations using StackScore for continuous technology
              strategy — illustrative demo metrics, not individual customer claims.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CLIENT_SUCCESS_OUTCOMES.map((outcome, index) => (
            <OfferReveal key={outcome.id} delayMs={index * 40}>
              <Card className="border-border/70 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">{outcome.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{outcome.value}</p>
                  {outcome.detail ? (
                    <p className="mt-2 text-xs text-muted-foreground">{outcome.detail}</p>
                  ) : null}
                </CardContent>
              </Card>
            </OfferReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
