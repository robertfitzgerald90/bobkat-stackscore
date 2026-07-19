"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { PRESENTATION_SECTIONS } from "@/lib/product-overview/presentation-sections";
import { cn } from "@/lib/utils";

export function ProductPresentationMode() {
  const {
    presentationActive,
    presentationPaused,
    presentationStep,
    presentationSectionProgress,
    pausePresentation,
    resumePresentation,
    nextPresentationStep,
    previousPresentationStep,
    exitPresentation,
  } = useProductOverview();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const section = PRESENTATION_SECTIONS[presentationStep];
  const overallProgress =
    ((presentationStep + presentationSectionProgress / 100) / PRESENTATION_SECTIONS.length) * 100;

  useEffect(() => {
    if (!presentationActive || !section) return;

    const updateRect = () => {
      const element = document.getElementById(section.sectionId);
      if (element) setTargetRect(element.getBoundingClientRect());
    };

    updateRect();
    const resizeObserver = new ResizeObserver(updateRect);
    const element = document.getElementById(section.sectionId);
    if (element) resizeObserver.observe(element);

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [presentationActive, section]);

  useEffect(() => {
    if (!presentationActive || !section) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        exitPresentation();
      }
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        if (presentationPaused) resumePresentation();
        else pausePresentation();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextPresentationStep();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previousPresentationStep();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    exitPresentation,
    nextPresentationStep,
    pausePresentation,
    presentationActive,
    presentationPaused,
    previousPresentationStep,
    resumePresentation,
    section,
  ]);

  if (!presentationActive || !section) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="false"
      aria-labelledby="presentation-title"
    >
      <div className="absolute inset-0 bg-[#08162b]/40 backdrop-blur-[1px] motion-reduce:backdrop-blur-none" />

      {targetRect ? (
        <div
          className="absolute rounded-2xl ring-4 ring-primary ring-offset-4 ring-offset-transparent transition-all duration-500 motion-reduce:transition-none"
          style={{
            top: targetRect.top - 10,
            left: targetRect.left - 10,
            width: targetRect.width + 20,
            height: targetRect.height + 20,
            boxShadow: "0 0 0 9999px rgba(8, 22, 43, 0.45)",
          }}
        />
      ) : null}

      <div className="pointer-events-auto absolute inset-x-0 top-0 border-b border-white/10 bg-[#08162b]/90 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/80">
              Presentation Mode
            </p>
            <h2 id="presentation-title" className="truncate text-sm font-semibold sm:text-base">
              {section.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-white/70 sm:inline">
              Step {presentationStep + 1} of {PRESENTATION_SECTIONS.length}
            </span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8"
              onClick={presentationPaused ? resumePresentation : pausePresentation}
            >
              {presentationPaused ? (
                <>
                  <Play className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Pause
                </>
              )}
            </Button>
            <Button type="button" size="sm" variant="secondary" className="h-8" onClick={exitPresentation}>
              <X className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Exit
            </Button>
          </div>
        </div>
        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-primary transition-all duration-300 motion-reduce:transition-none"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="h-0.5 bg-white/5">
          <div
            className="h-full bg-primary/60 transition-all duration-200 motion-reduce:transition-none"
            style={{ width: `${presentationSectionProgress}%` }}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-4 top-24 mx-auto max-w-2xl rounded-xl border border-white/10 bg-[#08162b]/85 px-4 py-3 text-center text-sm text-white/90 backdrop-blur-md sm:top-28">
        {section.narrative}
        <p className="mt-2 text-xs text-white/60">
          You can interact with the page at any time. Presentation controls stay available above.
        </p>
      </div>

      <div className="pointer-events-auto absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#08162b]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-3 sm:px-6">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={previousPresentationStep}
            disabled={presentationStep === 0}
            aria-label="Previous section"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={nextPresentationStep}>
            Next
            <ChevronRight className="ml-1.5 h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProductPresentationLauncher({
  className,
}: {
  className?: string;
}) {
  const { startPresentation, presentationActive, tourActive } = useProductOverview();

  return (
    <Button
      type="button"
      variant="default"
      className={cn("h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm", className)}
      onClick={() => startPresentation(0)}
      disabled={presentationActive || tourActive}
    >
      <Maximize2 className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
      Start Presentation
    </Button>
  );
}
