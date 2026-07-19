"use client";

import { FileDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { trackProductOverviewPdfDownloaded } from "@/lib/analytics/product-overview-events";
import { cn } from "@/lib/utils";

export function ProductOverviewPdfButton({ className }: { className?: string }) {
  const { personalization } = useProductOverview();

  const href = `/api/product-overview/pdf?company=${encodeURIComponent(personalization.companyName)}&industry=${encodeURIComponent(personalization.industryId)}&employees=${personalization.employeeCount}&locations=${personalization.locationCount}`;

  return (
    <a
      href={href}
      className={cn(buttonVariants({ variant: "outline" }), className)}
      onClick={() => trackProductOverviewPdfDownloaded("product_overview_header")}
    >
      <FileDown className="mr-1.5 h-4 w-4" aria-hidden />
      Download Product Overview PDF
    </a>
  );
}
