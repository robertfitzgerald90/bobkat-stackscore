"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import type {
  AssessmentOfferShowcaseSection,
  OfferShowcaseScreenshot,
} from "@/lib/assessment-offer/content";
import { OfferReveal } from "./offer-reveal";
import { PRODUCT_SCREENSHOT_CLASS } from "./product-screenshot-styles";
import { cn } from "@/lib/utils";

export function ProductScreenshot({
  image,
  priority = false,
  sizes,
  className,
}: {
  image: OfferShowcaseScreenshot;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      quality={100}
      draggable={false}
      sizes={sizes}
      className={cn("h-auto w-full select-none", PRODUCT_SCREENSHOT_CLASS, className)}
    />
  );
}

type AssessmentFeatureShowcaseProps = {
  section: AssessmentOfferShowcaseSection;
  index: number;
  priority?: boolean;
};

export function AssessmentFeatureShowcase({
  section,
  index,
  priority = false,
}: AssessmentFeatureShowcaseProps) {
  const imageFirst = section.imagePosition === "left";
  const imageSizes = "(min-width: 1024px) 40vw, 100vw";

  const copyBlock = (
    <div
      className={cn(
        "order-1 max-w-md space-y-6",
        imageFirst ? "lg:order-2 lg:justify-self-end" : "lg:order-1 lg:justify-self-start",
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{section.eyebrow}</p>
        <h3 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem] lg:text-[1.85rem] lg:leading-tight">
          {section.heading}
        </h3>
        <p className="mt-5 max-w-[34ch] text-[0.95rem] leading-7 text-muted-foreground sm:max-w-[38ch]">
          {section.description}
        </p>
      </div>

      {section.outcomes.length > 0 ? (
        <div>
          {section.outcomesLabel ? (
            <p className="text-sm font-medium text-foreground">{section.outcomesLabel}</p>
          ) : null}
          <ul
            className={cn("grid gap-2.5", section.outcomesLabel ? "mt-3" : undefined)}
            aria-label={`${section.heading} ${section.outcomesLabel ?? "highlights"}`}
          >
            {section.outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );

  const imageBlock = (
    <div
      className={cn(
        "order-2 w-full min-w-0",
        imageFirst ? "lg:order-1" : "lg:order-2",
      )}
    >
      <ProductScreenshot image={section.image} priority={priority} sizes={imageSizes} />
    </div>
  );

  return (
    <OfferReveal delayMs={index * 60}>
      <article id={section.id} className="scroll-mt-24">
        <div
          className={cn(
            "grid items-center gap-12 lg:gap-14 xl:gap-16",
            imageFirst ? "lg:grid-cols-[1.62fr_1fr]" : "lg:grid-cols-[1fr_1.62fr]",
          )}
        >
          {copyBlock}
          {imageBlock}
        </div>
      </article>
    </OfferReveal>
  );
}
