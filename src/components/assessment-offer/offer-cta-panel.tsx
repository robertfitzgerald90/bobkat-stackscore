import { MARKETING_PANEL, MARKETING_SECTION } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";
import { OfferReveal } from "./offer-reveal";

type OfferCtaPanelProps = {
  eyebrow?: string;
  headline: string;
  supportingText: string;
  children: React.ReactNode;
  footnote?: React.ReactNode;
  className?: string;
};

export function OfferCtaPanel({
  eyebrow,
  headline,
  supportingText,
  children,
  footnote,
  className,
}: OfferCtaPanelProps) {
  return (
    <section className={cn(MARKETING_SECTION, className)}>
      <div className="mx-auto max-w-4xl">
        <OfferReveal>
          <div className={cn(MARKETING_PANEL, "px-6 py-12 text-center sm:px-12 sm:py-16")}>
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
            <div className="mt-10 flex flex-col items-center gap-3">{children}</div>
            {footnote ? <div className="mt-8">{footnote}</div> : null}
          </div>
        </OfferReveal>
      </div>
    </section>
  );
}
