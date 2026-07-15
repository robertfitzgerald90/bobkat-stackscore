"use client";

import {
  ASSESSMENT_OFFER_SHOWCASE_INTRO,
  ASSESSMENT_OFFER_SHOWCASE_SECTIONS,
} from "@/lib/assessment-offer/content";
import { AssessmentFeatureShowcase } from "./assessment-feature-showcase";
import { OfferReveal } from "./offer-reveal";
import { cn } from "@/lib/utils";

export function AssessmentOfferShowcase() {
  return (
    <div>
      <section className="px-4 pb-12 pt-4 sm:px-6 sm:pb-16 md:pb-20">
        <div className="mx-auto max-w-6xl">
          <OfferReveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {ASSESSMENT_OFFER_SHOWCASE_INTRO.eyebrow}
            </p>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {ASSESSMENT_OFFER_SHOWCASE_INTRO.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
              {ASSESSMENT_OFFER_SHOWCASE_INTRO.description}
            </p>
          </OfferReveal>
        </div>
      </section>

      {ASSESSMENT_OFFER_SHOWCASE_SECTIONS.map((section, index) => {
        const isMuted = index > 0 && index % 2 === 1;

        return (
          <section
            key={section.id}
            className={cn(
              "px-4 py-16 sm:px-6 sm:py-20 md:py-24",
              isMuted && "bg-muted/40",
            )}
          >
            <div className="mx-auto max-w-6xl">
              <AssessmentFeatureShowcase
                section={section}
                index={index}
                priority={index === 0}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
