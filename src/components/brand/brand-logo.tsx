"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/branding";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  showText?: boolean;
  variant?: "sidebar" | "default" | "stacked";
  collapsed?: boolean;
  className?: string;
  href?: string;
};

export function BrandLogo({
  size = 40,
  showText = true,
  variant = "default",
  collapsed = false,
  className,
  href,
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isSidebar = variant === "sidebar";
  const isStacked = variant === "stacked";
  const isMidnight =
    mounted && (resolvedTheme === "midnight" || resolvedTheme === "dark");
  const logoSrc = isMidnight || isSidebar
    ? "/branding/bobkat-it-logo.png"
    : "/branding/bobkat-it-logo-navy.png";
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
        src={logoSrc}
        alt={`${BRAND.companyName} logo`}
        width={size}
        height={size}
        className="shrink-0 rounded-md"
        priority
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
