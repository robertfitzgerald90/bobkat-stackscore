"use client";

import {
  ASSESSMENT_OFFER_SHOWCASE_INTRO,
  ASSESSMENT_OFFER_SHOWCASE_SECTIONS,
} from "@/lib/assessment-offer/content";
import { AssessmentFeatureShowcase } from "./assessment-feature-showcase";
import { OfferProductWorkflow } from "./offer-product-workflow";
import { OfferReveal } from "./offer-reveal";
import { cn } from "@/lib/utils";

type SectionBackground = "default" | "panel" | "glow";

function sectionBackground(index: number): SectionBackground {
  const cycle = index % 3;
  if (cycle === 1) return "panel";
  if (cycle === 2) return "glow";
  return "default";
}

export function AssessmentOfferShowcase() {
  return (
    <div>
      <section className="px-4 pb-4 pt-2 sm:px-6 sm:pb-8">
        <div className="mx-auto max-w-6xl">
          <OfferReveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {ASSESSMENT_OFFER_SHOWCASE_INTRO.eyebrow}
            </p>
            <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {ASSESSMENT_OFFER_SHOWCASE_INTRO.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
              {ASSESSMENT_OFFER_SHOWCASE_INTRO.description}
            </p>
          </OfferReveal>
        </div>
      </section>

      {ASSESSMENT_OFFER_SHOWCASE_SECTIONS.map((section, index) => {
        const background = sectionBackground(index);

        return (
          <section
            key={section.id}
            className={cn(
              "relative px-4 py-[120px] sm:px-6 md:py-[140px] lg:py-[160px]",
              background === "panel" && "bg-muted/30",
              background === "glow" && "bg-gradient-to-b from-primary/[0.04] via-background to-background",
            )}
          >
            {background === "glow" ? (
              <div
                className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[70%] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(8,47,91,0.08)_0%,_transparent_72%)]"
                aria-hidden
              />
            ) : null}

            {background === "panel" ? (
              <div
                className={cn(
                  "mx-auto rounded-3xl border border-border/40 bg-background/60 px-4 py-12 sm:px-8 sm:py-14 md:px-10",
                  section.layout === "stacked" ? "max-w-7xl" : "max-w-6xl",
                )}
              >
                <AssessmentFeatureShowcase section={section} index={index} priority={index === 0} />
              </div>
            ) : (
              <div className={cn("mx-auto", section.layout === "stacked" ? "max-w-7xl" : "max-w-6xl")}>
                <AssessmentFeatureShowcase section={section} index={index} priority={index === 0} />
              </div>
            )}
          </section>
        );
      })}

      <OfferProductWorkflow />
    </div>
  );
}
