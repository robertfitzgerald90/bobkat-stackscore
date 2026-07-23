import type { ReactNode } from "react";
import type { OfferFeature } from "@/lib/assessment-offer/content";
import {
  MARKETING_FEATURE_CARD,
  MARKETING_ICON_WELL_MD,
  MARKETING_SECTION,
  MARKETING_SECTION_ALT,
} from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";
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
  alternateSurface?: boolean;
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
  sectionClassName,
  afterContent,
  alternateSurface = true,
}: OfferFeatureGridProps) {
  return (
    <section
      id={id}
      className={cn(
        alternateSurface ? MARKETING_SECTION_ALT : MARKETING_SECTION,
        sectionClassName,
      )}
    >
      <div className="relative mx-auto max-w-6xl">
        <OfferSectionHeader eyebrow={eyebrow} title={title} description={description} />

        <div className={`grid gap-5 lg:gap-6 ${columnClassName[columns]}`}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <OfferReveal key={feature.title} delayMs={index * 50}>
                <div className={MARKETING_FEATURE_CARD}>
                  <div className={cn(MARKETING_ICON_WELL_MD, "mb-5 text-primary")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground sm:text-lg">{feature.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
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
