"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/branding";
import {
  BOBKAT_LOGO_PRESENTATION,
  bobkatLogoAssetForPresentation,
  bobkatLogoDimensionsForHeight,
  bobkatLogoDimensionsForWidth,
  bobkatLogoHeightForPlacement,
  bobkatLogoSrc,
  type BobkatLogoPlacement,
  type BobkatLogoPresentation,
} from "@/lib/branding/assets";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  showText?: boolean;
  /** Layout arrangement — independent of public presentation sizing. */
  variant?: "sidebar" | "default" | "stacked";
  /**
   * Public sizing variant (SS-BRAND-004-R2).
   * `hero` / `authentication` use the tight crop so CSS width ≈ visible wolf width.
   * `navigation` stays compact on the full master asset.
   */
  presentation?: BobkatLogoPresentation;
  collapsed?: boolean;
  className?: string;
  href?: string;
  placement?: BobkatLogoPlacement;
  priority?: boolean;
};

export function BrandLogo({
  size,
  showText,
  variant = "default",
  presentation,
  collapsed = false,
  className,
  href,
  placement = "default",
  priority = false,
}: BrandLogoProps) {
  const isSidebar = variant === "sidebar";
  const isStacked = variant === "stacked";
  const presentationConfig = presentation ? BOBKAT_LOGO_PRESENTATION[presentation] : null;
  const asset = bobkatLogoAssetForPresentation(presentation);
  const isProminent = presentation === "hero" || presentation === "authentication";

  const { width: logoWidth, height: displayHeight } = isProminent
    ? bobkatLogoDimensionsForWidth(presentationConfig!.widthDesktop, asset)
    : bobkatLogoDimensionsForHeight(
        size ?? bobkatLogoHeightForPlacement(placement),
        asset,
      );

  const logoHeight = displayHeight;
  const displayText =
    showText ?? (presentationConfig ? presentationConfig.showWordmarkDefault : true);
  const showWordmark = displayText && !collapsed;
  const glowClassName =
    presentationConfig?.glowClassName ??
    (placement === "auth"
      ? "rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18)_0%,transparent_68%)] p-2"
      : null);

  const content = (
    <div
      className={cn(
        "flex items-center gap-3",
        isStacked && "flex-col gap-4 text-center",
        isProminent && "flex-col items-center gap-0",
        collapsed && "justify-center",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center",
          glowClassName,
        )}
      >
        <Image
          src={bobkatLogoSrc(asset)}
          alt={asset.alt}
          width={logoWidth}
          height={displayHeight}
          className={cn(
            "shrink-0",
            presentationConfig?.widthClassName ??
              "h-auto w-auto max-w-full object-contain",
          )}
          style={isProminent ? undefined : { maxHeight: logoHeight }}
          priority={
            priority ||
            placement === "header" ||
            placement === "auth" ||
            isProminent
          }
        />
      </span>
      {showWordmark ? (
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
