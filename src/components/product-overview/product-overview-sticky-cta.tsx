"use client";

import { useEffect, useState } from "react";
import { ProductOverviewAssessmentCta } from "@/components/product-overview/product-overview-assessment-cta";
import { cn } from "@/lib/utils";

export function ProductOverviewStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dashboard = document.getElementById("product-overview-dashboard");
    if (!dashboard) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry ? !entry.isIntersecting : false);
      },
      { threshold: 0.1 },
    );

    observer.observe(dashboard);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-md transition-transform duration-300 motion-reduce:transition-none",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      role="region"
      aria-label="Quick actions"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row sm:px-6">
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          Ready to turn this clarity into your technology strategy?
        </p>
        <ProductOverviewAssessmentCta
          label="Purchase Technology Assessment"
          placement="product_overview_sticky_cta"
          className="h-10 w-full px-6 text-sm sm:w-auto"
        />
      </div>
    </div>
  );
}
