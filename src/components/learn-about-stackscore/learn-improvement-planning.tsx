import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { LEARN_ROADMAP_PHASES } from "@/lib/learn-about-stackscore/content";
import { MARKETING_FEATURE_CARD } from "@/lib/marketing/tokens";
import { LearnSectionShell } from "./learn-section-shell";

export function LearnImprovementPlanning() {
  return (
    <LearnSectionShell
      id="improvement-planning"
      eyebrow="Improvement planning"
      title="Turn findings into a sequenced plan"
      description="Assessment results feed improvement planning in StackScore — so priorities can be organized into practical phases. Implementation work and consulting services are available separately through Bobkat IT when you need them."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {LEARN_ROADMAP_PHASES.map((phase, index) => (
          <OfferReveal key={phase.id} delayMs={index * 70}>
            <div className={MARKETING_FEATURE_CARD}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {phase.label}
              </p>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                {phase.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {phase.description}
              </p>
            </div>
          </OfferReveal>
        ))}
      </div>
      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground md:mx-auto md:text-center">
        Purchasing the assessment gives you the baseline, recommendations, and planning workspace.
        It does not automatically include managed implementation or an ongoing advisory retainer.
      </p>
    </LearnSectionShell>
  );
}
