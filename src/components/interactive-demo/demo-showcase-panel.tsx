import { CheckCircle2 } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { InteractiveDemoButton } from "@/components/interactive-demo/interactive-demo-button";
import { ServicesCtaLink } from "@/components/services/services-cta-link";
import {
  DEMO_EXPLORE_AREAS,
  DEMO_SHORT_DISCLAIMER,
} from "@/lib/interactive-demo/content";
import { cn } from "@/lib/utils";

type DemoShowcasePanelProps = {
  placement: string;
  returnTo?: string;
  className?: string;
  heading?: string;
  supportingCopy?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  demoPrimary?: boolean;
};

export function DemoShowcasePanel({
  placement,
  returnTo,
  className,
  heading = "Don’t Just Read About StackScore. Experience It.",
  supportingCopy = "Explore a fully interactive demonstration of the StackScore client portal and see how technology scores, recommendations, projects, roadmaps, investment planning, and ongoing strategic reviews come together in one experience.",
  primaryLabel = "Launch Interactive Demo",
  secondaryLabel = "Get My Assessment",
  demoPrimary = true,
}: DemoShowcasePanelProps) {
  return (
    <section
      className={cn(
        "border-t border-border/60 bg-muted/30 px-4 py-16 sm:px-6 sm:py-20 md:py-24",
        className,
      )}
      aria-labelledby="demo-showcase-heading"
    >
      <div className="mx-auto max-w-6xl">
        <OfferReveal>
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Interactive Demo
              </p>
              <h2
                id="demo-showcase-heading"
                className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                {heading}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {supportingCopy}
              </p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Areas you can explore">
                {DEMO_EXPLORE_AREAS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <InteractiveDemoButton
                  label={primaryLabel}
                  placement={placement}
                  returnTo={returnTo}
                  variant={demoPrimary ? "default" : "outline"}
                  className="h-11 px-6 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
                />
                <ServicesCtaLink
                  cta="purchaseAssessment"
                  label={secondaryLabel}
                  variant={demoPrimary ? "outline" : "default"}
                  className="h-11 px-6 text-base sm:w-auto"
                  placement={`${placement}_assessment`}
                />
              </div>

              <p className="mt-4 text-xs text-muted-foreground">{DEMO_SHORT_DISCLAIMER}</p>
            </div>

            <DemoPreviewFrame />
          </div>
        </OfferReveal>
      </div>
    </section>
  );
}

function DemoPreviewFrame() {
  const previewItems = [
    { label: "StackScore", value: "68 / 100" },
    { label: "Pillars tracked", value: "8" },
    { label: "Active phase", value: "Phase 1" },
    { label: "Initiatives", value: "12" },
  ] as const;

  return (
    <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-primary/[0.07] via-card to-muted/40 p-3 shadow-md sm:p-4">
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden />
          <p className="ml-2 truncate text-xs font-medium text-muted-foreground">
            stackscore.bobkatit.com / client-portal
          </p>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Sample Client Portal
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              Executive technology visibility
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Scores, recommendations, roadmaps, and investment planning — connected in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {previewItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border/60 bg-muted/20 px-3 py-3"
              >
                <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-dashed border-primary/25 bg-primary/[0.04] px-3 py-3 text-xs text-muted-foreground">
            Preview uses fictional sample data for demonstration.
          </div>
        </div>
      </div>
    </div>
  );
}
