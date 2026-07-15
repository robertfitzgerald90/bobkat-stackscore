"use client";

import Image from "next/image";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { STACKED_PRODUCT_SCREENSHOT_CLASS } from "@/components/assessment-offer/product-screenshot-styles";
import type { InvitationScreenshot } from "@/lib/assessment-invitation/screenshots";
import { cn } from "@/lib/utils";

type InvitationProductScreenshotProps = {
  image: InvitationScreenshot;
  caption?: string;
  className?: string;
  priority?: boolean;
  delayMs?: number;
};

export function InvitationProductScreenshot({
  image,
  caption,
  className,
  priority = false,
  delayMs = 0,
}: InvitationProductScreenshotProps) {
  return (
    <OfferReveal delayMs={delayMs} variant="image" className={cn("w-full min-w-0", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        quality={100}
        draggable={false}
        sizes="(min-width: 1280px) 1280px, 100vw"
        className={cn("h-auto w-full select-none", STACKED_PRODUCT_SCREENSHOT_CLASS)}
      />
      {caption ? <p className="mt-4 text-center text-sm text-muted-foreground">{caption}</p> : null}
    </OfferReveal>
  );
}
