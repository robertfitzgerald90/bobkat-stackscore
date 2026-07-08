"use client";

import Image from "next/image";
import { useState } from "react";
import type { OfferShowcaseItem } from "@/lib/assessment-offer/content";
import { OfferBrowserFrame } from "./offer-browser-frame";
import { OFFER_SCREENSHOT_MOCKUPS } from "./offer-screenshot-mockups";
import { OfferReveal } from "./offer-reveal";

function ShowcaseCard({
  item,
  featured = false,
  delayMs = 0,
}: {
  item: OfferShowcaseItem;
  featured?: boolean;
  delayMs?: number;
}) {
  const Mockup = OFFER_SCREENSHOT_MOCKUPS[item.id as keyof typeof OFFER_SCREENSHOT_MOCKUPS];
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(item.imageSrc) && !imageFailed;

  return (
    <OfferReveal delayMs={delayMs} className={featured ? "lg:col-span-2" : undefined}>
      <figure className="group min-w-0 space-y-3">
        <OfferBrowserFrame className={featured ? "lg:scale-[1.01]" : undefined}>
          <div className="relative h-full min-h-0 w-full overflow-hidden rounded-md">
            {showImage && item.imageSrc ? (
              <Image
                src={item.imageSrc}
                alt={item.caption}
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                sizes={featured ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 1024px) 100vw, 33vw"}
                onError={() => setImageFailed(true)}
              />
            ) : Mockup ? (
              <Mockup />
            ) : null}
          </div>
        </OfferBrowserFrame>
        <figcaption className="text-center text-sm font-medium text-foreground">
          {item.caption}
        </figcaption>
      </figure>
    </OfferReveal>
  );
}

export function OfferScreenshotGallery({ items }: { items: OfferShowcaseItem[] }) {
  const [featured, ...rest] = items;

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <OfferReveal className="mb-10 text-center md:mb-14">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Inside StackScore
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            See what you&apos;re investing in
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            From executive dashboards to personalized recommendations — a complete technology
            maturity platform built for decision-makers.
          </p>
        </OfferReveal>

        {featured ? (
          <div className="mb-6 lg:mb-8">
            <ShowcaseCard item={featured} featured delayMs={80} />
          </div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 lg:gap-8">
          {rest.map((item, index) => (
            <ShowcaseCard key={item.id} item={item} delayMs={120 + index * 60} />
          ))}
        </div>
      </div>
    </section>
  );
}
