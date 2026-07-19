"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ProductOverviewAssessmentCta } from "@/components/product-overview/product-overview-assessment-cta";
import { trackDemoAssessmentCtaClicked } from "@/lib/analytics/interactive-demo-events";
import {
  dismissDemoConversionCtaForSession,
  wasDemoConversionCtaDismissed,
} from "@/lib/interactive-demo/session";
import { cn } from "@/lib/utils";

type DemoConversionCtaProps = {
  disabled?: boolean;
};

export function DemoConversionCta({ disabled = false }: DemoConversionCtaProps) {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(wasDemoConversionCtaDismissed());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || dismissed || disabled) {
      setVisible(false);
      return;
    }

    const dashboard = document.getElementById("product-overview-dashboard");
    if (!dashboard) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry ? !entry.isIntersecting : false);
      },
      { threshold: 0.1 },
    );

    observer.observe(dashboard);
    return () => observer.disconnect();
  }, [disabled, dismissed, ready]);

  function handleDismiss() {
    dismissDemoConversionCtaForSession();
    setDismissed(true);
    setVisible(false);
  }

  if (!ready || dismissed || disabled || !visible) return null;

  return (
    <>
      <div
        className={cn(
          "fixed bottom-6 right-6 z-40 hidden w-[min(22rem,calc(100vw-3rem))] rounded-2xl border border-border/70 bg-background/95 p-4 shadow-lg backdrop-blur-md lg:block",
        )}
        role="region"
        aria-label="Assessment conversion"
      >
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Dismiss assessment prompt"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <p className="pr-8 text-sm font-medium text-foreground">
          Ready to see your technology data here?
        </p>
        <ProductOverviewAssessmentCta
          label="Get My Assessment"
          placement="demo_conversion_cta"
          className="mt-3 h-10 w-full px-4 text-sm"
          onBeforeNavigate={() => trackDemoAssessmentCtaClicked("demo_conversion_cta")}
        />
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden"
        role="region"
        aria-label="Assessment conversion"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            Ready to see your technology data here?
          </p>
          <ProductOverviewAssessmentCta
            label="Get My Assessment"
            placement="demo_conversion_cta_mobile"
            className="h-10 shrink-0 px-4 text-sm"
            onBeforeNavigate={() => trackDemoAssessmentCtaClicked("demo_conversion_cta_mobile")}
          />
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Dismiss assessment prompt"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </>
  );
}
