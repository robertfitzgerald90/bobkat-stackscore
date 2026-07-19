import { CheckCircle2 } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { InteractiveDemoButton } from "@/components/interactive-demo/interactive-demo-button";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
import { DEMO_EXPLORE_AREAS, DEMO_SHORT_DISCLAIMER } from "@/lib/interactive-demo/content";
import { cn } from "@/lib/utils";

type DemoStackscoreExperienceSectionProps = {
  placement: string;
  returnTo?: string;
  className?: string;
};

export function DemoStackscoreExperienceSection({
  placement,
  returnTo,
  className,
}: DemoStackscoreExperienceSectionProps) {
  return (
    <section
      className={cn(
        "border-t border-border/60 bg-background px-4 py-16 sm:px-6 sm:py-20 md:py-24",
        className,
      )}
      aria-labelledby="stackscore-demo-experience-heading"
    >
      <div className="mx-auto max-w-6xl">
        <OfferReveal>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                StackScore Client Portal
              </p>
              <h2
                id="stackscore-demo-experience-heading"
                className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                See the StackScore Client Experience in Action
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Explore the type of portal, reporting, recommendations, and planning tools clients
                receive through StackScore — using realistic sample data before you purchase.
              </p>

              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2" aria-label="Key demo areas">
                {DEMO_EXPLORE_AREAS.slice(0, 8).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <InteractiveDemoButton
                  label="Explore the Interactive Demo"
                  placement={placement}
                  returnTo={returnTo}
                  variant="default"
                  className="h-11 px-6 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
                />
                <ServicesCtaLink
                  cta="purchaseAssessment"
                  label="Purchase Your Assessment"
                  variant="outline"
                  className="h-11 px-6 text-base sm:w-auto"
                  placement={`${placement}_assessment`}
                />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{DEMO_SHORT_DISCLAIMER}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-primary/[0.08] via-card to-muted/30 p-3 shadow-md sm:p-4">
              <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
                <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden />
                  <span className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden />
                  <span className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden />
                  <p className="ml-2 text-xs font-medium text-muted-foreground">
                    StackScore · Client Portal Preview
                  </p>
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Overall StackScore
                      </p>
                      <p className="mt-1 text-4xl font-semibold tabular-nums text-foreground">
                        68
                        <span className="text-lg font-medium text-muted-foreground"> / 100</span>
                      </p>
                    </div>
                    <p className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Sample data
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {["Identity", "Endpoint", "Cloud", "Backup"].map((pillar) => (
                      <div
                        key={pillar}
                        className="rounded-lg border border-border/60 bg-muted/20 px-2 py-3 text-center"
                      >
                        <p className="text-[0.65rem] text-muted-foreground">{pillar}</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums">72</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-3 text-sm text-muted-foreground">
                    Dashboard · Roadmap · Investment · Quarterly Reviews
                  </div>
                </div>
              </div>
            </div>
          </div>
        </OfferReveal>
      </div>
    </section>
  );
}
