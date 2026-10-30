import Image from "next/image";
import { bobkatLogoDimensionsForHeight, bobkatLogoSrc } from "@/lib/branding/assets";
import { cn } from "@/lib/utils";

type CustomerPortalWatermarkProps = {
  className?: string;
};

/**
 * Decorative Bobkat IT logo watermark for the customer portal shell.
 * Uses the authentic rebrand asset (`new-bobkat-it-logo.png`).
 * `aria-hidden` + empty alt — purely decorative; does not capture pointer events.
 */
export function CustomerPortalWatermark({ className }: CustomerPortalWatermarkProps) {
  const { width, height } = bobkatLogoDimensionsForHeight(320);

  return (
    <div className={cn("customer-portal-watermark", className)} aria-hidden="true">
      <Image
        src={bobkatLogoSrc()}
        alt=""
        width={width}
        height={height}
        className="h-auto w-full max-w-full object-contain"
        sizes="(max-width: 768px) 220px, 420px"
        priority={false}
      />
    </div>
  );
}
