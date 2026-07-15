"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { TechnologyProgressPreview } from "@/components/product-previews/technology-progress-preview";
import { TechnologyMaturityProfilePreview } from "@/components/product-previews/technology-maturity-profile-preview";
import type {
  AssessmentOfferShowcaseSection,
  OfferShowcaseScreenshot,
} from "@/lib/assessment-offer/content";
import { technologyProgressSummaryDemoData } from "@/lib/demo-data/technology-progress-summary";
import { technologyMaturityProfileDemoData } from "@/lib/demo-data/technology-maturity-profile";
import { OfferReveal } from "./offer-reveal";
import {
  PRODUCT_SCREENSHOT_CLASS,
  STACKED_PRODUCT_SCREENSHOT_CLASS,
} from "./product-screenshot-styles";
import { cn } from "@/lib/utils";

function sectionGridClass(
  section: AssessmentOfferShowcaseSection,
  imageFirst: boolean,
  emphasis: NonNullable<AssessmentOfferShowcaseSection["imageEmphasis"]> | "default",
) {
  if (section.preview === "technology-progress" && imageFirst) {
    return "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]";
  }

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
      className={cn("h-auto w-full select-none", className)}
    />
  );
}

function ShowcaseHeader({ section }: { section: AssessmentOfferShowcaseSection }) {
  const isWideCopy = section.layout === "stacked" || section.layout === "feature-split";

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{section.eyebrow}</p>
      <h3 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem] lg:text-[1.85rem] lg:leading-tight">
        {section.heading}
      </h3>
      <p
        className={cn(
          "mt-5 text-[0.95rem] leading-7 text-muted-foreground",
          isWideCopy ? "max-w-[52ch]" : "max-w-[34ch] sm:max-w-[38ch]",
        )}
      >
        {section.description}
      </p>
    </div>
  );
}

function ShowcaseOutcomes({
  section,
  layout = "inline",
}: {
  section: AssessmentOfferShowcaseSection;
  layout?: "inline" | "grid";
}) {
  if (section.outcomes.length === 0) return null;

  return (
    <div>
      {section.outcomesLabel ? (
        <p className="text-sm font-medium text-foreground">{section.outcomesLabel}</p>
      ) : null}
      <ul
        className={cn(
          "grid gap-2.5",
          layout === "grid" ? "mt-4 gap-3 sm:grid-cols-2 lg:grid-cols-3" : section.outcomesLabel ? "mt-3" : undefined,
        )}
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
  );
}

function ShowcaseCopy({ section, centered = false }: { section: AssessmentOfferShowcaseSection; centered?: boolean }) {
  return (
    <div
      className={cn(
        "space-y-6",
        section.layout === "stacked" || section.layout === "feature-split"
          ? "max-w-3xl"
          : centered
            ? "max-w-md lg:max-w-none"
            : "max-w-md",
      )}
    >
      <ShowcaseHeader section={section} />
      <ShowcaseOutcomes section={section} layout="inline" />
    </div>
  );
}

function ShowcasePreview({
  section,
  priority = false,
}: {
  section: AssessmentOfferShowcaseSection;
  priority?: boolean;
}) {
  if (section.preview === "technology-progress") {
    return <TechnologyProgressPreview data={technologyProgressSummaryDemoData} />;
  }

  if (section.preview === "technology-maturity-profile") {
    return <TechnologyMaturityProfilePreview data={technologyMaturityProfileDemoData} />;
  }

  if (!section.image) {
    return null;
  }

  return (
    <ProductScreenshot
      image={section.image}
      priority={priority}
      sizes={
        section.layout === "stacked"
          ? "(min-width: 1280px) 1280px, 100vw"
          : section.imageEmphasis === "compact"
            ? "(min-width: 1024px) 32vw, 100vw"
            : section.imageEmphasis === "emphasized"
              ? "(min-width: 1024px) 50vw, 100vw"
              : "(min-width: 1024px) 44vw, 100vw"
      }
      className={section.layout === "stacked" ? STACKED_PRODUCT_SCREENSHOT_CLASS : PRODUCT_SCREENSHOT_CLASS}
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
  const isFeatureSplit = section.layout === "feature-split";
  const isStacked = section.layout === "stacked";
  const isGridOutcomes = section.outcomesLayout === "grid";
  const imageFirst = section.imagePosition === "left";
  const emphasis = section.imageEmphasis ?? "default";

  if (isFeatureSplit) {
    const previewFirst = imageFirst;

    return (
      <article id={section.id} className="scroll-mt-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12 xl:gap-14">
          <OfferReveal
            delayMs={index * 40}
            className={cn("order-1 min-w-0", previewFirst ? "lg:order-2" : "lg:order-1")}
          >
            <div className="lg:flex lg:min-h-full lg:items-center">
              <ShowcaseCopy section={section} centered />
            </div>
          </OfferReveal>

          <OfferReveal
            delayMs={index * 40 + 80}
            variant="image"
            className={cn("order-2 min-w-0", previewFirst ? "lg:order-1" : "lg:order-2")}
          >
            <ShowcasePreview section={section} priority={priority} />
          </OfferReveal>
        </div>
      </article>
    );
  }

  if (isStacked) {
    return (
      <article id={section.id} className="scroll-mt-24">
        <div className="flex flex-col gap-10 lg:gap-12 xl:gap-16">
          <OfferReveal delayMs={index * 40}>
            <div className="max-w-3xl space-y-0">
              <ShowcaseHeader section={section} />
            </div>
          </OfferReveal>

          {isGridOutcomes ? (
            <OfferReveal delayMs={index * 40 + 40}>
              <div className="max-w-3xl">
                <ShowcaseOutcomes section={section} layout="grid" />
              </div>
            </OfferReveal>
          ) : (
            <OfferReveal delayMs={index * 40 + 40} className="max-w-3xl">
              <ShowcaseOutcomes section={section} layout="inline" />
            </OfferReveal>
          )}

          <OfferReveal delayMs={index * 40 + 100} variant="image" className="w-full min-w-0 pt-2 lg:pt-4">
            <ShowcasePreview section={section} priority={priority} />
            {section.imageCaption ? (
              <p className="mt-4 text-center text-sm text-muted-foreground">{section.imageCaption}</p>
            ) : null}
          </OfferReveal>
        </div>
      </article>
    );
  }

  const isProgressPreview = section.preview === "technology-progress";
  const copyBlock = (
    <OfferReveal
      delayMs={index * 40}
      className={cn("order-1", imageFirst ? "lg:order-2" : "lg:order-1")}
    >
      <div
        className={cn(
          imageFirst ? "lg:justify-self-end" : "lg:justify-self-start",
          isProgressPreview && imageFirst && "lg:flex lg:min-h-full lg:items-center",
        )}
      >
        <ShowcaseCopy section={section} centered={isProgressPreview} />
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
          !isProgressPreview && emphasis === "compact" && "mx-auto max-w-[78%] px-2 sm:px-4 lg:max-w-[76%]",
          !isProgressPreview && emphasis === "emphasized" && "lg:-mx-2 xl:-mx-4",
        )}
      >
        <ShowcasePreview section={section} priority={priority} />
      </div>
    </OfferReveal>
  );

  return (
    <article id={section.id} className="scroll-mt-24">
      <div
        className={cn(
          "grid items-center gap-12 lg:gap-14 xl:gap-16",
          sectionGridClass(section, imageFirst, emphasis),
        )}
      >
        {copyBlock}
        {imageBlock}
      </div>
    </article>
  );
}
