import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { LEARN_RECOMMENDATION_SAMPLES } from "@/lib/learn-about-stackscore/content";
import { MARKETING_PANEL } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";
import { LearnSectionShell } from "./learn-section-shell";

function priorityClass(priority: string) {
  if (priority === "Critical") return "border-destructive/40 bg-destructive/10 text-destructive";
  if (priority === "High") return "border-amber-500/40 bg-amber-500/10 text-amber-200";
  return "border-primary/30 bg-primary/10 text-primary";
}

export function LearnRecommendations() {
  return (
    <LearnSectionShell
      id="recommendations"
      eyebrow="Recommendations"
      title="Findings that turn into action"
      description="StackScore surfaces prioritized recommendations with business impact, recommended actions, and expected outcomes — so teams know what matters and why."
      alt
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {LEARN_RECOMMENDATION_SAMPLES.map((rec, index) => (
          <OfferReveal key={rec.id} delayMs={index * 70}>
            <article className={cn(MARKETING_PANEL, "flex h-full flex-col p-5 text-left sm:p-6")}>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide",
                    priorityClass(rec.priority),
                  )}
                >
                  {rec.priority}
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground">
                {rec.title}
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-foreground">Business impact</dt>
                  <dd className="mt-1 text-muted-foreground">{rec.businessImpact}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Recommended action</dt>
                  <dd className="mt-1 text-muted-foreground">{rec.recommendedAction}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Expected outcome</dt>
                  <dd className="mt-1 text-muted-foreground">{rec.expectedOutcome}</dd>
                </div>
              </dl>
            </article>
          </OfferReveal>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Illustrative samples based on common technology priorities. Your assessment produces
        recommendations for your environment.
      </p>
    </LearnSectionShell>
  );
}
