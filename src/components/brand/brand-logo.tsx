import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/branding";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  showText?: boolean;
  variant?: "sidebar" | "default" | "stacked";
  className?: string;
  href?: string;
};

export function BrandLogo({
  size = 40,
  showText = true,
  variant = "default",
  className,
  href,
}: BrandLogoProps) {
  const isSidebar = variant === "sidebar";
  const isStacked = variant === "stacked";

  const content = (
    <div
      className={cn(
        "flex items-center gap-3",
        isStacked && "flex-col gap-4 text-center",
        className,
      )}
    >
      <Image
        src="/branding/bobkat-it-logo-navy.png"
        alt={`${BRAND.companyName} logo`}
        width={size}
        height={size}
        className="shrink-0 rounded-md"
        priority
      />
      {showText ? (
        <div className={cn("min-w-0", isStacked && "space-y-0.5")}>
          <p
            className={cn(
              "truncate font-semibold leading-tight",
              isSidebar ? "text-white" : "text-brand",
              isStacked && "text-xl",
            )}
          >
            {isStacked ? `Bobkat ${BRAND.productName}` : BRAND.productName}
          </p>
          {!isStacked ? (
            <p
              className={cn(
                "truncate text-xs",
                isSidebar ? "text-white/70" : "text-muted-foreground",
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
      <Link href={href} className="transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
