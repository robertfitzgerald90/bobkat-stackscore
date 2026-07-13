import type { ReactNode } from "react";
import type { OfferFeature } from "@/lib/assessment-offer/content";
import { OfferReveal } from "./offer-reveal";
import { OfferSectionHeader } from "./offer-section-header";

type OfferFeatureGridProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  features: OfferFeature[];
  columns?: 2 | 3 | 4;
  sectionClassName?: string;
  afterContent?: ReactNode;
};

const columnClassName: Record<NonNullable<OfferFeatureGridProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function OfferFeatureGrid({
  id,
  eyebrow,
  title,
  description,
  features,
  columns = 3,
  sectionClassName = "bg-muted/40 px-4 py-16 sm:px-6 sm:py-20 md:py-24",
  afterContent,
}: OfferFeatureGridProps) {
  return (
    <section id={id} className={sectionClassName}>
      <div className="mx-auto max-w-6xl">
        <OfferSectionHeader eyebrow={eyebrow} title={title} description={description} />

        <div className={`grid gap-4 lg:gap-6 ${columnClassName[columns]}`}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <OfferReveal key={feature.title} delayMs={index * 50}>
                <div className="group h-full rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </OfferReveal>
            );
          })}
        </div>

        {afterContent}
      </div>
    </section>
  );
}
