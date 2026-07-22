"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/branding";
import {
  BOBKAT_IT_LOGO,
  bobkatLogoDimensionsForHeight,
  bobkatLogoHeightForPlacement,
  bobkatLogoSrc,
  type BobkatLogoPlacement,
} from "@/lib/branding/assets";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  showText?: boolean;
  variant?: "sidebar" | "default" | "stacked";
  collapsed?: boolean;
  className?: string;
  href?: string;
  placement?: BobkatLogoPlacement;
  priority?: boolean;
};

export function BrandLogo({
  size,
  showText = true,
  variant = "default",
  collapsed = false,
  className,
  href,
  placement = "default",
  priority = false,
}: BrandLogoProps) {
  const isSidebar = variant === "sidebar";
  const isStacked = variant === "stacked";
  const logoHeight = size ?? bobkatLogoHeightForPlacement(placement);
  const { width: logoWidth, height: displayHeight } = bobkatLogoDimensionsForHeight(logoHeight);
  const displayText = showText && !collapsed;

  const content = (
    <div
      className={cn(
        "flex items-center gap-3",
        isStacked && "flex-col gap-4 text-center",
        collapsed && "justify-center",
        className,
      )}
    >
      <Image
        src={bobkatLogoSrc()}
        alt={BOBKAT_IT_LOGO.alt}
        width={logoWidth}
        height={displayHeight}
        className="h-auto w-auto max-w-full shrink-0 object-contain"
        style={{ maxHeight: logoHeight }}
        priority={priority || placement === "header" || placement === "auth"}
      />
      {displayText ? (
        <div className={cn("min-w-0", isStacked && "space-y-0.5")}>
          <p
            className={cn(
              "truncate font-semibold leading-tight",
              isSidebar ? "text-sidebar-foreground" : "text-brand",
              isStacked && "text-xl",
            )}
          >
            {isStacked ? `Bobkat ${BRAND.productName}` : BRAND.productName}
          </p>
          {!isStacked ? (
            <p
              className={cn(
                "truncate text-xs",
                isSidebar ? "text-sidebar-foreground/70" : "text-muted-foreground",
              )}
            >
              {BRAND.companyName}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{BRAND.companyName}</p>
          )}
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-90" aria-label={BRAND.productName}>
        {content}
      </Link>
    );
  }

  return content;
}

/** Preferred export name for Bobkat IT corporate branding. */
export const BobkatLogo = BrandLogo;
