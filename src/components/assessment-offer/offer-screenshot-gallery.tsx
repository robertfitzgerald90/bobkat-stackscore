"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type {
  OfferShowcaseFeature,
  OfferShowcaseHero,
  OfferShowcaseScreenshot,
} from "@/lib/assessment-offer/content";
import { OFFER_SHOWCASE_JOURNEY } from "@/lib/assessment-offer/content";
import { OfferBrowserFrame } from "./offer-browser-frame";
import { OfferReveal } from "./offer-reveal";

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
      className="h-full w-full select-none object-contain object-top"
    />
  );
}

function FeatureCard({
  feature,
  delayMs,
}: {
  feature: OfferShowcaseFeature;
  delayMs: number;
}) {
  return (
    <OfferReveal delayMs={delayMs}>
      <article className="flex h-full flex-col gap-4">
        <OfferBrowserFrame>
          <ShowcaseScreenshot
            image={feature.image}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 540px"
          />
        </OfferBrowserFrame>
        <div className="space-y-1.5 px-0.5">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {feature.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
        </div>
      </article>
    </OfferReveal>
  );
}

type OfferScreenshotGalleryProps = {
  hero: OfferShowcaseHero;
  features: OfferShowcaseFeature[];
};

export function OfferScreenshotGallery({ hero, features }: OfferScreenshotGalleryProps) {
  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <OfferReveal className="mb-8 text-center sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Inside StackScore
          </p>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            What You&apos;ll Receive
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            From executive dashboards to prioritized recommendations and a personalized
            technology roadmap, every StackScore assessment is designed to help you make confident
            technology decisions.
          </p>
        </OfferReveal>

        <OfferReveal delayMs={40} className="mb-8 sm:mb-10">
          <ol className="mx-auto flex max-w-3xl flex-col items-stretch gap-0 sm:flex-row sm:items-center sm:justify-center sm:gap-2">
            {OFFER_SHOWCASE_JOURNEY.map((step, index) => (
              <li key={step} className="flex flex-col items-center sm:flex-row sm:gap-2">
                <span className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-center text-xs font-medium text-foreground sm:text-[13px]">
                  {step}
                </span>
                {index < OFFER_SHOWCASE_JOURNEY.length - 1 ? (
                  <ChevronDown
                    className="my-1 h-4 w-4 shrink-0 text-muted-foreground/50 sm:hidden"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                ) : null}
                {index < OFFER_SHOWCASE_JOURNEY.length - 1 ? (
                  <span
                    className="hidden text-muted-foreground/40 sm:inline"
                    aria-hidden
                  >
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </OfferReveal>

        <OfferReveal delayMs={60} className="mb-8 sm:mb-10">
          <div className="space-y-4">
            <OfferBrowserFrame>
              <ShowcaseScreenshot
                image={hero.image}
                priority
                sizes="(max-width: 1024px) 100vw, 960px"
              />
            </OfferBrowserFrame>
            <div className="space-y-1.5 px-0.5 text-center sm:text-left">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {hero.title}
              </h3>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {hero.description}
              </p>
            </div>
          </div>
        </OfferReveal>

        <div className="grid gap-6 sm:grid-cols-2 sm:gap-7">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} delayMs={100 + index * 50} />
          ))}
        </div>
      </div>
    </section>
  );
}
