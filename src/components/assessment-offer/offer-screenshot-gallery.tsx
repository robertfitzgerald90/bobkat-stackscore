"use client";

import Image from "next/image";
import type { OfferShowcaseItem } from "@/lib/assessment-offer/content";
import { cn } from "@/lib/utils";
import { OfferBrowserFrame, OfferDocumentFrame } from "./offer-browser-frame";
import { OfferReveal } from "./offer-reveal";

function ShowcaseImage({
  item,
  priority = false,
  className,
}: {
  item: OfferShowcaseItem;
  priority?: boolean;
  className?: string;
}) {
  const isDocument = item.frame === "document";

  return (
    <Image
      src={item.imageSrc}
      alt={item.caption}
      width={item.imageWidth}
      height={item.imageHeight}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      quality={90}
      className={cn(
        "transition-transform duration-700 ease-out group-hover:scale-[1.015]",
        isDocument
          ? "h-full w-full object-contain object-center"
          : "h-full w-full object-cover object-top",
        className,
      )}
      sizes={
        priority
          ? "(max-width: 1024px) 100vw, 960px"
          : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
      }
    />
  );
}

function ShowcaseCard({
  item,
  featured = false,
  delayMs = 0,
}: {
  item: OfferShowcaseItem;
  featured?: boolean;
  delayMs?: number;
}) {
  const isDocument = item.frame === "document";

  return (
    <OfferReveal delayMs={delayMs} className={featured ? "lg:col-span-2" : undefined}>
      <figure className="group min-w-0 space-y-4">
        {isDocument ? (
          <OfferDocumentFrame className={featured ? "lg:scale-[1.01]" : undefined}>
            <ShowcaseImage item={item} priority={featured} />
          </OfferDocumentFrame>
        ) : (
          <OfferBrowserFrame className={featured ? "lg:scale-[1.01]" : undefined}>
            <ShowcaseImage item={item} priority={featured} />
          </OfferBrowserFrame>
        )}

        <figcaption className="space-y-1 px-1">
          <p className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
            {item.caption}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
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
        <OfferReveal className="mb-12 text-center md:mb-16">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Inside StackScore
          </p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            What You&apos;ll Receive
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            From executive dashboards to prioritized recommendations and a personalized technology
            roadmap, every StackScore assessment is designed to help you make confident technology
            decisions.
          </p>
        </OfferReveal>

        {featured ? (
          <div className="mb-8 lg:mb-10">
            <ShowcaseCard item={featured} featured delayMs={80} />
          </div>
        ) : null}

        <div className="grid gap-8 sm:grid-cols-2 lg:gap-10">
          {rest.map((item, index) => (
            <ShowcaseCard key={item.id} item={item} delayMs={120 + index * 60} />
          ))}
        </div>
      </div>
    </section>
  );
}
