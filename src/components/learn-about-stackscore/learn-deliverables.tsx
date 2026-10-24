import { CheckCircle2 } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { LEARN_DELIVERABLE_GROUPS } from "@/lib/learn-about-stackscore/content";
import { MARKETING_ICON_WELL_MD, MARKETING_PANEL } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";
import { LearnSectionShell } from "./learn-section-shell";

export function LearnDeliverables() {
  return (
    <LearnSectionShell
      id="assessment-inclusions"
      eyebrow="Deliverables"
      title="What you receive"
      description="Clear separation between assessment deliverables, platform capabilities, and optional advisory services — based on how StackScore works today."
      alt
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {LEARN_DELIVERABLE_GROUPS.map((group, index) => {
          const Icon = group.icon;
          return (
            <OfferReveal key={group.id} delayMs={index * 70}>
              <article
                className={cn(
                  MARKETING_PANEL,
                  "flex h-full flex-col p-5 sm:p-6",
                  group.id === "included" && "border-primary/30",
                )}
              >
                <div className={MARKETING_ICON_WELL_MD}>
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                  {group.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {group.description}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </OfferReveal>
          );
        })}
      </div>
    </LearnSectionShell>
  );
}
