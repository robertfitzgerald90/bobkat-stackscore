"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { trackProductOverviewAssessmentCtaClicked } from "@/lib/analytics/product-overview-events";
import { trackServiceCtaClick } from "@/lib/analytics/marketing-events";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { cn } from "@/lib/utils";

export function ProductOverviewAssessmentCta({
  label,
  placement,
  variant = "outline",
  className,
  onBeforeNavigate,
}: {
  label: string;
  placement: string;
  variant?: "default" | "outline";
  className?: string;
  onBeforeNavigate?: () => void;
}) {
  const destination = SERVICES_CTA_DESTINATIONS.purchaseAssessment;

  return (
    <Link
      href={destination.href}
      className={cn(buttonVariants({ variant }), className)}
      onClick={() => {
        onBeforeNavigate?.();
        trackServiceCtaClick({
          ctaKey: "purchaseAssessment",
          linkType: "internal",
          placement,
        });
        trackProductOverviewAssessmentCtaClicked(placement);
      }}
    >
      {label}
    </Link>
  );
}
