import Image from "next/image";
import { bobkatLogoDimensionsForHeight, bobkatLogoSrc } from "@/lib/branding/assets";
import { cn } from "@/lib/utils";

type CustomerPortalWatermarkProps = {
  className?: string;
};

/**
 * Decorative Bobkat IT logo watermark for the customer portal shell.
 * Uses the authentic rebrand asset (`new-bobkat-it-logo.png`).
 *
 * SS-UX-003-FIX: Absolutely positioned, flex-centered layer inside the customer
 * content column — full logo visible via object-fit: contain; no flow impact.
 */
export function CustomerPortalWatermark({ className }: CustomerPortalWatermarkProps) {
  const { width, height } = bobkatLogoDimensionsForHeight(420);

  return (
    <div className={cn("customer-portal-watermark", className)} aria-hidden="true">
      <Image
        src={bobkatLogoSrc()}
        alt=""
        width={width}
        height={height}
        className="object-contain object-center"
        sizes="(max-width: 768px) 224px, 416px"
        priority={false}
      />
    </div>
  );
}
