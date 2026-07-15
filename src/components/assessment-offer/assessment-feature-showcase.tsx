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

const PRODUCT_FIRST_SCREENSHOT_CLASS =
  "rounded-[20px] shadow-[0_14px_44px_-10px_rgba(8,47,91,0.38)]";

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
  const isProductFirst = section.layout === "product-first";
  const imageFirst = section.imagePosition === "left";
  const imageSizes = isProductFirst
    ? "(min-width: 1024px) 40vw, 100vw"
    : "(min-width: 1024px) 62vw, 100vw";
  const dualImageSizes = isProductFirst
    ? "(min-width: 1024px) 20vw, 50vw"
    : "(min-width: 1024px) 31vw, 50vw";
  const screenshotRadiusClass = isProductFirst ? PRODUCT_FIRST_SCREENSHOT_CLASS : "rounded-md";

  const copyBlock = (
    <div
      className={cn(
        "order-1 space-y-6",
        isProductFirst ? "lg:max-w-none lg:pr-2" : "lg:max-w-xl",
        imageFirst ? "lg:order-2" : "lg:order-1",
        !imageFirst && isProductFirst && "lg:pl-2",
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{section.eyebrow}</p>
        <h3
          className={cn(
            "mt-4 text-balance font-semibold tracking-tight text-foreground",
            isProductFirst
              ? "text-2xl sm:text-[1.75rem] lg:text-[1.85rem] lg:leading-tight"
              : "text-2xl sm:text-3xl lg:text-[2rem] lg:leading-tight",
          )}
        >
          {section.heading}
        </h3>
        <p
          className={cn(
            "mt-5 leading-relaxed text-muted-foreground",
            isProductFirst ? "text-[0.95rem] leading-7" : "text-base sm:text-[1.05rem] sm:leading-7",
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

  const mockupContent = section.images ? (
    <div
      className={cn(
        "grid",
        isProductFirst
          ? "gap-1.5 p-1.5 sm:gap-2 sm:p-2 lg:grid-cols-[1.4fr_1fr]"
          : "gap-3 p-4 sm:gap-4 sm:p-5 md:p-6 lg:grid-cols-2",
      )}
    >
      {section.images.map((image) => (
        <ShowcaseScreenshot
          key={image.src}
          image={image}
          priority={priority}
          sizes={dualImageSizes}
          className={screenshotRadiusClass}
        />
      ))}
    </div>
  ) : section.image ? (
    <div className={isProductFirst ? "p-1.5 sm:p-2" : "p-4 sm:p-5 md:p-6 lg:p-7"}>
      <ShowcaseScreenshot
        image={section.image}
        priority={priority}
        sizes={imageSizes}
        className={screenshotRadiusClass}
      />
    </div>
  ) : null;

  const imageBlock = (
    <div
      className={cn(
        "group/mockup relative order-2 w-full min-w-0",
        imageFirst ? "lg:order-1" : "lg:order-2",
        isProductFirst ? "lg:-my-2" : imageFirst ? "lg:-my-4 lg:-ml-2 xl:-ml-4" : "lg:-my-4 lg:-mr-2 xl:-mr-4",
      )}
    >
      <OfferBrowserFrame frameTitle={section.frameTitle} className="w-full">
        {mockupContent}
      </OfferBrowserFrame>
    </div>
  );

  return (
    <OfferReveal delayMs={index * 60}>
      <article id={section.id} className="scroll-mt-24">
        <div
          className={cn(
            "grid items-center",
            isProductFirst ? "gap-10 lg:gap-10 xl:gap-12" : "gap-10 lg:gap-14 xl:gap-16",
            imageFirst
              ? isProductFirst
                ? "lg:grid-cols-[1.68fr_1fr]"
                : "lg:grid-cols-[1.15fr_0.85fr]"
              : isProductFirst
                ? "lg:grid-cols-[1fr_1.68fr]"
                : "lg:grid-cols-[0.85fr_1.15fr]",
          )}
        >
          {copyBlock}
          {imageBlock}
        </div>
      </article>
    </OfferReveal>
  );
}
