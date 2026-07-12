"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  isCalComHref,
  trackCalBookingClick,
  trackServiceCtaClick,
} from "@/lib/analytics/marketing-events";
import { SERVICES_CTA_DESTINATIONS, type ServicesCtaKey } from "@/lib/services/cta";
import { cn } from "@/lib/utils";

export function ServicesCtaLink({
  cta,
  label,
  className,
  variant = "default",
  serviceId,
  placement,
}: {
  cta: ServicesCtaKey;
  label?: string;
  className?: string;
  variant?: "default" | "outline";
  serviceId?: string;
  placement?: string;
}) {
  const destination = SERVICES_CTA_DESTINATIONS[cta];
  const isExternal = destination.href.startsWith("http");
  const isCalCom = isCalComHref(destination.href);
  const classNames = cn(
    buttonVariants({ variant }),
    variant === "default" && "shadow-md transition-shadow hover:shadow-lg",
    className,
  );

  function handleClick() {
    trackServiceCtaClick({
      ctaKey: cta,
      linkType: isCalCom ? "cal_com" : "internal",
      serviceId,
      placement,
    });

    if (isCalCom) {
      trackCalBookingClick({ ctaKey: cta, placement });
    }
  }

  if (!isExternal) {
    return (
      <Link href={destination.href} className={classNames} onClick={handleClick}>
        {label ?? destination.label}
      </Link>
    );
  }

  return (
    <a href={destination.href} className={classNames} onClick={handleClick}>
      {label ?? destination.label}
      <ExternalLink className="ml-1.5 h-4 w-4" aria-hidden />
    </a>
  );
}
