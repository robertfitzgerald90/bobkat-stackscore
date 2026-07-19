"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { PRODUCT_TOUR_STEPS } from "@/lib/product-overview/demo-partnership";

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
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const step = PRODUCT_TOUR_STEPS[tourStep];

  useEffect(() => {
    if (!tourActive || !step) return;

    const updateRect = () => {
      const element = document.getElementById(step.sectionId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [tourActive, step]);

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
      <div className="absolute inset-0 bg-black/60" aria-hidden onClick={skipTour} />

      {targetRect ? (
        <div
          className="pointer-events-none absolute rounded-xl ring-4 ring-primary ring-offset-4 ring-offset-transparent transition-all duration-300 motion-reduce:transition-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          }}
        />
      ) : null}

      <div className="absolute inset-x-4 bottom-4 mx-auto max-w-lg sm:inset-x-auto sm:right-6 sm:top-24 sm:bottom-auto sm:max-w-md">
        <div className="rounded-2xl border border-border/70 bg-background p-6 shadow-2xl">
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
