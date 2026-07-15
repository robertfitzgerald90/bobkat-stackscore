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
  fit?: "full" | "contained";
};

export function InvitationProductScreenshot({
  image,
  caption,
  className,
  priority = false,
  delayMs = 0,
  fit = "full",
}: InvitationProductScreenshotProps) {
  const isContained = fit === "contained";

  return (
    <OfferReveal
      delayMs={delayMs}
      variant="image"
      className={cn(
        isContained ? "mx-auto flex w-full max-w-3xl flex-col items-center sm:max-w-4xl" : "w-full min-w-0",
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        quality={100}
        draggable={false}
        sizes={isContained ? `${image.width}px` : "(min-width: 1280px) 1280px, 100vw"}
        className={cn(
          "h-auto select-none",
          isContained ? "w-auto max-w-full" : "w-full",
          STACKED_PRODUCT_SCREENSHOT_CLASS,
        )}
      />
      {caption ? <p className="mt-4 max-w-2xl text-center text-sm text-muted-foreground">{caption}</p> : null}
    </OfferReveal>
  );
}
