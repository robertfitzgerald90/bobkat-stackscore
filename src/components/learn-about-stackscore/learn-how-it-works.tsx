import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { LEARN_PROCESS_STEPS } from "@/lib/learn-about-stackscore/content";
import { MARKETING_FEATURE_CARD, MARKETING_ICON_WELL_MD } from "@/lib/marketing/tokens";
import { LearnSectionShell } from "./learn-section-shell";

export function LearnHowItWorks() {
  return (
    <LearnSectionShell
      id="how-stackscore-works"
      eyebrow="How StackScore works"
      title="From assessment to clear next steps"
      description="A straightforward path that matches how customers use StackScore today — assess, understand maturity, review recommendations, and plan improvements."
      alt
    >
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {LEARN_PROCESS_STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <OfferReveal key={step.step} delayMs={index * 60}>
              <li className={MARKETING_FEATURE_CARD}>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
                    {step.step}
                  </span>
                  <div className={MARKETING_ICON_WELL_MD}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            </OfferReveal>
          );
        })}
      </ol>
    </LearnSectionShell>
  );
}
