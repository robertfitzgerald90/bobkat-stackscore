"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { PRODUCT_TOUR_STEPS } from "@/lib/product-overview/demo-partnership";
import { useReducedMotion } from "@/lib/product-overview/use-reduced-motion";
import { cn } from "@/lib/utils";

const SPOTLIGHT_PADDING = 24;
const TOUR_SPOTLIGHT_ATTR = "data-tour-spotlight";

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function measureSpotlight(sectionId: string): SpotlightRect | null {
  const element = document.getElementById(sectionId);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top - SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2,
  };
}

/**
 * Tour spotlight + keyboard handling.
 * Explanation content is rendered by FeaturePopoverHost beside the highlighted section.
 */
export function ProductGuidedTour() {
  const { tourActive, tourStep, presentationActive, skipTour } = useProductOverview();
  const reducedMotion = useReducedMotion();
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [spotlightVisible, setSpotlightVisible] = useState(false);
  const step = PRODUCT_TOUR_STEPS[tourStep];

  useEffect(() => {
    if (!tourActive || !step) return;

    document.querySelectorAll(`[${TOUR_SPOTLIGHT_ATTR}="true"]`).forEach((node) => {
      node.removeAttribute(TOUR_SPOTLIGHT_ATTR);
    });

    const element = document.getElementById(step.sectionId);
    if (element) {
      element.setAttribute(TOUR_SPOTLIGHT_ATTR, "true");
    }

    setSpotlightVisible(false);
    const revealTimer = window.setTimeout(
      () => {
        setSpotlight(measureSpotlight(step.sectionId));
        setSpotlightVisible(true);
      },
      reducedMotion ? 0 : 90,
    );

    const updateRect = () => {
      setSpotlight(measureSpotlight(step.sectionId));
    };

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.clearTimeout(revealTimer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      element?.removeAttribute(TOUR_SPOTLIGHT_ATTR);
    };
  }, [reducedMotion, step, tourActive, tourStep]);

  useEffect(() => {
    if (tourActive) return;
    document.querySelectorAll(`[${TOUR_SPOTLIGHT_ATTR}="true"]`).forEach((node) => {
      node.removeAttribute(TOUR_SPOTLIGHT_ATTR);
    });
  }, [tourActive]);

  useEffect(() => {
    if (!tourActive) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        skipTour();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [skipTour, tourActive]);

  if (!tourActive || presentationActive || !step) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden>
      {spotlight ? (
        <div
          className={cn(
            "absolute rounded-2xl border-2 border-primary",
            !reducedMotion && "tour-spotlight-ring",
            !reducedMotion &&
              "transition-[opacity,transform,top,left,width,height] duration-500 ease-out",
            spotlightVisible ? "opacity-100 scale-100" : "opacity-0 scale-[0.985]",
          )}
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow:
              "0 24px 60px -20px rgba(8, 47, 91, 0.35), 0 0 0 1px rgba(8, 47, 91, 0.08), 0 0 28px rgba(8, 47, 91, 0.22)",
          }}
        />
      ) : null}
    </div>
  );
}

export function ProductTourLauncher({ className }: { className?: string }) {
  const { startTour, tourActive, presentationActive } = useProductOverview();

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={() => startTour(0)}
      disabled={tourActive || presentationActive}
    >
      Take the 5 Minute Tour
    </Button>
  );
}
