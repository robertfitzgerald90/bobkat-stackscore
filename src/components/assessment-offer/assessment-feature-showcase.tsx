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

function sectionGridClass(
  imageFirst: boolean,
  emphasis: NonNullable<AssessmentOfferShowcaseSection["imageEmphasis"]> | "default",
) {
  if (emphasis === "compact") {
    return imageFirst ? "lg:grid-cols-[1.35fr_1fr]" : "lg:grid-cols-[1fr_1.35fr]";
  }

  if (emphasis === "emphasized") {
    return imageFirst ? "lg:grid-cols-[2.15fr_1fr]" : "lg:grid-cols-[1fr_2.15fr]";
  }

  return imageFirst ? "lg:grid-cols-[1.75fr_1fr]" : "lg:grid-cols-[1fr_1.75fr]";
}

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

function ShowcaseCopy({ section }: { section: AssessmentOfferShowcaseSection }) {
  return (
    <div className={cn("space-y-6", section.layout === "stacked" ? "max-w-2xl" : "max-w-md")}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{section.eyebrow}</p>
        <h3 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem] lg:text-[1.85rem] lg:leading-tight">
          {section.heading}
        </h3>
        <p
          className={cn(
            "mt-5 text-[0.95rem] leading-7 text-muted-foreground",
            section.layout === "stacked" ? "max-w-[52ch]" : "max-w-[34ch] sm:max-w-[38ch]",
          )}
        >
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
  const isStacked = section.layout === "stacked";
  const imageFirst = section.imagePosition === "left";
  const emphasis = section.imageEmphasis ?? "default";
  const imageSizes = isStacked
    ? "(min-width: 1024px) 1100px, 100vw"
    : emphasis === "compact"
      ? "(min-width: 1024px) 32vw, 100vw"
      : emphasis === "emphasized"
        ? "(min-width: 1024px) 50vw, 100vw"
        : "(min-width: 1024px) 44vw, 100vw";

  if (isStacked) {
    return (
      <article id={section.id} className="scroll-mt-24">
        <div className="flex flex-col gap-12 lg:gap-16 xl:gap-20">
          <OfferReveal delayMs={index * 40}>
            <ShowcaseCopy section={section} />
          </OfferReveal>

          <OfferReveal delayMs={index * 40 + 80} variant="image">
            <div className="w-full min-w-0">
              <ProductScreenshot image={section.image} priority={priority} sizes={imageSizes} />
              {section.imageCaption ? (
                <p className="mt-4 text-center text-sm text-muted-foreground">{section.imageCaption}</p>
              ) : null}
            </div>
          </OfferReveal>
        </div>
      </article>
    );
  }

  const copyBlock = (
    <OfferReveal
      delayMs={index * 40}
      className={cn("order-1", imageFirst ? "lg:order-2" : "lg:order-1")}
    >
      <div
        className={cn(
          imageFirst ? "lg:justify-self-end" : "lg:justify-self-start",
        )}
      >
        <ShowcaseCopy section={section} />
      </div>
    </OfferReveal>
  );

  const imageBlock = (
    <OfferReveal
      delayMs={index * 40 + 80}
      variant="image"
      className={cn("order-2", imageFirst ? "lg:order-1" : "lg:order-2")}
    >
      <div
        className={cn(
          "w-full min-w-0",
          emphasis === "compact" && "mx-auto max-w-[78%] px-2 sm:px-4 lg:max-w-[76%]",
          emphasis === "emphasized" && "lg:-mx-2 xl:-mx-4",
        )}
      >
        <ProductScreenshot image={section.image} priority={priority} sizes={imageSizes} />
      </div>
    </OfferReveal>
  );

  return (
    <article id={section.id} className="scroll-mt-24">
      <div
        className={cn(
          "grid items-center gap-12 lg:gap-16 xl:gap-20",
          sectionGridClass(imageFirst, emphasis),
        )}
      >
        {copyBlock}
        {imageBlock}
      </div>
    </article>
  );
}
