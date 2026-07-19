"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { PRODUCT_TOUR_STEPS } from "@/lib/product-overview/demo-partnership";
import { useReducedMotion } from "@/lib/product-overview/use-reduced-motion";
import { cn } from "@/lib/utils";

const SPOTLIGHT_PADDING = 32;
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

export function ProductGuidedTour() {
  const {
    tourActive,
    tourStep,
    presentationActive,
    nextTourStep,
    previousTourStep,
    skipTour,
    restartTour,
  } = useProductOverview();
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

  const progress = ((tourStep + 1) / PRODUCT_TOUR_STEPS.length) * 100;
  const isLastStep = tourStep === PRODUCT_TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {/*
        Soft contextual veil. The active section is elevated above this layer
        (see [data-tour-spotlight] in globals.css) so it stays full brightness.
      */}
      <button
        type="button"
        aria-label="Dismiss tour"
        className="absolute inset-0 cursor-default border-0 bg-black/35 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
        onClick={skipTour}
      />

      {spotlight ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-[55] rounded-2xl border-2 border-primary",
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
              "0 24px 60px -20px rgba(8, 47, 91, 0.45), 0 0 0 1px rgba(8, 47, 91, 0.1), 0 0 36px rgba(8, 47, 91, 0.32)",
          }}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[70] mx-auto max-w-lg sm:inset-x-auto sm:right-6 sm:top-24 sm:bottom-auto sm:max-w-md">
        <div className="pointer-events-auto rounded-2xl border border-border/70 bg-background p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Step {step.stepNumber} of {PRODUCT_TOUR_STEPS.length}
              </p>
              <h3 id="tour-title" className="mt-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={skipTour} aria-label="Skip tour">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <div>
              <p className="font-medium text-foreground">What this feature is</p>
              <p className="mt-1 text-muted-foreground">{step.featureDescription}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Why it matters</p>
              <p className="mt-1 text-muted-foreground">{step.whyItMatters}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Business value</p>
              <p className="mt-1 text-muted-foreground">{step.businessValue}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={previousTourStep} disabled={tourStep === 0}>
              Previous
            </Button>
            <Button type="button" size="sm" onClick={nextTourStep}>
              {isLastStep ? "Finish Tour" : "Next"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={skipTour}>
              Skip
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={restartTour}>
              Restart
            </Button>
          </div>
        </div>
      </div>
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
