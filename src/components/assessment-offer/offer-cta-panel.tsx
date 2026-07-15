import { OfferReveal } from "./offer-reveal";

type OfferCtaPanelProps = {
  headline: string;
  supportingText: string;
  children: React.ReactNode;
  footnote?: React.ReactNode;
};

export function OfferCtaPanel({ headline, supportingText, children, footnote }: OfferCtaPanelProps) {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto max-w-4xl">
        <OfferReveal>
          <div className="rounded-3xl border border-primary/15 bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-transparent px-6 py-12 text-center shadow-[0_20px_50px_-20px_rgba(8,47,91,0.2)] sm:px-12 sm:py-14">
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              {headline}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
              {supportingText}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">{children}</div>
            {footnote ? <div className="mt-6">{footnote}</div> : null}
          </div>
        </OfferReveal>
      </div>
    </section>
  );
}
