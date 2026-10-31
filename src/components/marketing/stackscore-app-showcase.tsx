import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { AppShowcaseFrame } from "@/components/marketing/app-showcase-frame";
import {
  STACKSCORE_APP_SHOWCASE_CAPTION,
  STACKSCORE_APP_SHOWCASE_SECTIONS,
} from "@/lib/marketing/app-showcase";
import { MARKETING_SECTION, MARKETING_SECTION_ALT } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";

type StackScoreAppShowcaseProps = {
  /** Anchor id for “See how StackScore works” style deep links. */
  id?: string;
  className?: string;
};

/**
 * SS-WEB-004 — three authentic StackScore 2.0 application screenshots.
 * Shared by `/assessment-offer` and `/assessment-invitation`.
 */
export function StackScoreAppShowcase({
  id = "how-stackscore-works",
  className,
}: StackScoreAppShowcaseProps) {
  return (
    <div id={id} className={cn("scroll-mt-20", className)}>
      {STACKSCORE_APP_SHOWCASE_SECTIONS.map((section, index) => {
        const alt = index % 2 === 1;
        return (
          <section
            key={section.id}
            id={section.id}
            className={cn(alt ? MARKETING_SECTION_ALT : MARKETING_SECTION, "scroll-mt-20")}
          >
            <div className="mx-auto max-w-6xl">
              <OfferReveal className="mx-auto max-w-3xl text-center">
                <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                  {section.heading}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {section.description}
                </p>
              </OfferReveal>

              <OfferReveal delayMs={120} variant="image" className="mt-8 sm:mt-10 md:mt-12">
                <AppShowcaseFrame image={section.image} priority={index === 0} />
              </OfferReveal>
            </div>
          </section>
        );
      })}

      <p className="mx-auto max-w-3xl px-4 pb-4 text-center text-xs leading-relaxed text-muted-foreground sm:px-6">
        {STACKSCORE_APP_SHOWCASE_CAPTION}
      </p>
    </div>
  );
}
