import { MARKETING_PANEL, MARKETING_SECTION } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";
import { CornerBrackets } from "@/components/design-system/instrument/corner-brackets";
import { OfferReveal } from "./offer-reveal";

type OfferCtaPanelProps = {
  eyebrow?: string;
  headline: string;
  supportingText: string;
  children: React.ReactNode;
  footnote?: React.ReactNode;
  className?: string;
  /**
   * Adds the StackScore Instrument two-corner bracket motif. Opt-in only —
   * this panel is shared across several marketing landing pages, and only
   * the assessment-invitation / assessment-offer funnel has been moved to
   * the Instrument system so far.
   */
  bracketed?: boolean;
};

export function OfferCtaPanel({
  eyebrow,
  headline,
  supportingText,
  children,
  footnote,
  className,
  bracketed = false,
}: OfferCtaPanelProps) {
  const panel = (
    <div
      className={cn(
        MARKETING_PANEL,
        "overflow-visible px-6 pb-14 pt-12 text-center sm:px-12 sm:pb-20 sm:pt-16",
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
      ) : null}
      <h2
        className={cn(
          "text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl",
          eyebrow && "mt-4",
        )}
      >
        {headline}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
        {supportingText}
      </p>
      <div className="mt-10 flex max-w-full min-w-0 flex-col items-center gap-3 overflow-visible">
        {children}
      </div>
      {footnote ? <div className="mt-8">{footnote}</div> : null}
    </div>
  );

  return (
    <section className={cn(MARKETING_SECTION, className)}>
      <div className="mx-auto max-w-4xl">
        <OfferReveal>
          {bracketed ? (
            <CornerBrackets corners="two" className="overflow-visible">
              {panel}
            </CornerBrackets>
          ) : (
            panel
          )}
        </OfferReveal>
      </div>
    </section>
  );
}
