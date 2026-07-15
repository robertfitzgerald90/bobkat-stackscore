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
      className={cn("h-auto w-full select-none", className)}
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
  const imageSizes = "(min-width: 1024px) 62vw, 100vw";
  const dualImageSizes = "(min-width: 1024px) 31vw, 50vw";

  const copyBlock = (
    <div className={cn("order-1 space-y-6 lg:max-w-xl", imageFirst ? "lg:order-2" : "lg:order-1")}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{section.eyebrow}</p>
        <h3 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2rem] lg:leading-tight">
          {section.heading}
        </h3>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-[1.05rem] sm:leading-7">
          {section.description}
        </p>
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

  const mockupContent = section.images ? (
    <div className="grid gap-3 p-4 sm:gap-4 sm:p-5 md:p-6 lg:grid-cols-2">
      {section.images.map((image) => (
        <ShowcaseScreenshot
          key={image.src}
          image={image}
          priority={priority}
          sizes={dualImageSizes}
          className="rounded-md"
        />
      ))}
    </div>
  ) : section.image ? (
    <div className="p-4 sm:p-5 md:p-6 lg:p-7">
      <ShowcaseScreenshot image={section.image} priority={priority} sizes={imageSizes} className="rounded-md" />
    </div>
  ) : null;

  const imageBlock = (
    <div
      className={cn(
        "group/mockup relative order-2 lg:-my-4",
        imageFirst ? "lg:order-1 lg:-ml-2 xl:-ml-4" : "lg:order-2 lg:-mr-2 xl:-mr-4",
      )}
    >
      <OfferBrowserFrame frameTitle={section.frameTitle}>{mockupContent}</OfferBrowserFrame>
    </div>
  );

  return (
    <OfferReveal delayMs={index * 60}>
      <article id={section.id} className="scroll-mt-24">
        <div
          className={cn(
            "grid items-center gap-10 lg:gap-14 xl:gap-16",
            imageFirst ? "lg:grid-cols-[1.15fr_0.85fr]" : "lg:grid-cols-[0.85fr_1.15fr]",
          )}
        >
          {copyBlock}
          {imageBlock}
        </div>
      </article>
    </OfferReveal>
  );
}
