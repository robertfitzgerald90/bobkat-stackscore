import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { LEARN_CONTINUED_IMPROVEMENT } from "@/lib/learn-about-stackscore/content";
import { MARKETING_FEATURE_CARD, MARKETING_ICON_WELL_MD } from "@/lib/marketing/tokens";
import { LearnSectionShell } from "./learn-section-shell";

export function LearnContinuedImprovement() {
  return (
    <LearnSectionShell
      id="continued-improvement"
      eyebrow={LEARN_CONTINUED_IMPROVEMENT.eyebrow}
      title={LEARN_CONTINUED_IMPROVEMENT.title}
      description={LEARN_CONTINUED_IMPROVEMENT.description}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {LEARN_CONTINUED_IMPROVEMENT.points.map((point, index) => {
          const Icon = point.icon;
          return (
            <OfferReveal key={point.title} delayMs={index * 70}>
              <div className={MARKETING_FEATURE_CARD}>
                <div className={MARKETING_ICON_WELL_MD}>
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {point.description}
                </p>
              </div>
            </OfferReveal>
          );
        })}
      </div>
    </LearnSectionShell>
  );
}
