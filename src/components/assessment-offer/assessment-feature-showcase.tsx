"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import type {
  AssessmentOfferShowcaseSection,
  OfferShowcaseScreenshot,
} from "@/lib/assessment-offer/content";
import { OfferBrowserFrame } from "./offer-browser-frame";
import { OfferReveal } from "./offer-reveal";
import { cn } from "@/lib/utils";

function ShowcaseScreenshot({
  image,
  priority = false,
  sizes,
}: {
  image: OfferShowcaseScreenshot;
  priority?: boolean;
  sizes: string;
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
      className="h-auto w-full select-none"
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
  const isHero = section.variant === "hero" || section.imagePosition === "full";
  const imageFirst = section.imagePosition === "left";
  const imageSizes = isHero
    ? "(min-width: 1280px) 1120px, 100vw"
    : "(min-width: 1024px) 58vw, 100vw";

  const copyBlock = (
    <div className={cn("space-y-6", imageFirst && !isHero && "lg:order-2")}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {section.eyebrow}
        </p>
        <h3
          className={cn(
            "mt-3 font-semibold tracking-tight text-foreground",
            isHero ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
          )}
        >
          {section.heading}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{section.description}</p>
      </div>

      {section.outcomes.length > 0 ? (
        <div>
          {section.outcomesLabel ? (
            <p className="text-sm font-medium text-foreground">{section.outcomesLabel}</p>
          ) : null}
          <ul
            className={cn("grid gap-3", section.outcomesLabel ? "mt-3" : undefined)}
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
    <div className={cn(imageFirst && !isHero && "lg:order-1")}>
      <OfferBrowserFrame>
        <ShowcaseScreenshot image={section.image} priority={priority} sizes={imageSizes} />
      </OfferBrowserFrame>
    </div>
  );

  return (
    <OfferReveal delayMs={index * 50}>
      <article id={section.id} className="scroll-mt-24">
        {isHero ? (
          <div className="space-y-8 lg:space-y-10">
            {copyBlock}
            {imageBlock}
          </div>
        ) : (
          <div
            className={cn(
              "grid items-center gap-8 lg:gap-12",
              imageFirst ? "lg:grid-cols-[3fr_2fr]" : "lg:grid-cols-[2fr_3fr]",
            )}
          >
            {copyBlock}
            {imageBlock}
          </div>
        )}
      </article>
    </OfferReveal>
  );
}
