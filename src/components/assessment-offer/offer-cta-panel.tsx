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
      <div className="mx-auto max-w-3xl">
        <OfferReveal>
          <div className="rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/[0.06] to-transparent px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{headline}</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">{supportingText}</p>
            <div className="mt-8 flex flex-col items-center gap-3">{children}</div>
            {footnote ? <div className="mt-4">{footnote}</div> : null}
          </div>
        </OfferReveal>
      </div>
    </section>
  );
}
