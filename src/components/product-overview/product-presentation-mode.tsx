"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutGrid,
  Maximize2,
  Pause,
  Play,
  Settings2,
  StickyNote,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { PRESENTATION_SECTIONS } from "@/lib/product-overview/presentation-sections";
import { cn } from "@/lib/utils";

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ProductPresentationMode() {
  const {
    presentationActive,
    presentationPaused,
    presentationStep,
    presentationSectionProgress,
    presentationSettings,
    pausePresentation,
    resumePresentation,
    nextPresentationStep,
    previousPresentationStep,
    exitPresentation,
    jumpToPresentationStep,
    setPresentationSettings,
    notifyPresentationInteraction,
  } = useProductOverview();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [showControls, setShowControls] = useState(true);

  const section = PRESENTATION_SECTIONS[presentationStep];
  const overallProgress =
    ((presentationStep + presentationSectionProgress / 100) / PRESENTATION_SECTIONS.length) * 100;

  const remainingMs = useMemo(() => {
    let total = 0;
    for (let index = presentationStep; index < PRESENTATION_SECTIONS.length; index += 1) {
      const current = PRESENTATION_SECTIONS[index]!;
      if (index === presentationStep) {
        total += current.durationMs * (1 - presentationSectionProgress / 100);
      } else {
        total += current.durationMs;
      }
    }
    return total;
  }, [presentationSectionProgress, presentationStep]);

  useEffect(() => {
    if (!presentationActive || !section) return;

    document.querySelectorAll('[data-tour-spotlight="true"]').forEach((node) => {
      node.removeAttribute("data-tour-spotlight");
    });

    const element = document.getElementById(section.sectionId);
    if (element) {
      element.setAttribute("data-tour-spotlight", "true");
    }

    const updateRect = () => {
      const target = document.getElementById(section.sectionId);
      if (target) setTargetRect(target.getBoundingClientRect());
    };

    updateRect();
    const resizeObserver = new ResizeObserver(updateRect);
    if (element) resizeObserver.observe(element);

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      element?.removeAttribute("data-tour-spotlight");
    };
  }, [presentationActive, section]);

  useEffect(() => {
    if (!presentationActive || !section) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !presentationSettings.kiosk) {
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
    presentationSettings.kiosk,
    previousPresentationStep,
    resumePresentation,
    section,
  ]);

  useEffect(() => {
    if (!presentationActive || !presentationSettings.pauseOnInteraction) return;

    const onInteract = () => notifyPresentationInteraction();
    window.addEventListener("pointerdown", onInteract, true);
    return () => window.removeEventListener("pointerdown", onInteract, true);
  }, [notifyPresentationInteraction, presentationActive, presentationSettings.pauseOnInteraction]);

  if (!presentationActive || !section) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="false"
      aria-labelledby="presentation-title"
    >
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] motion-reduce:backdrop-blur-none" />

      {targetRect ? (
        <div
          className="tour-spotlight-ring absolute z-[55] rounded-2xl border-2 border-primary transition-all duration-500 motion-reduce:transition-none motion-reduce:animate-none"
          style={{
            top: targetRect.top - 32,
            left: targetRect.left - 32,
            width: targetRect.width + 64,
            height: targetRect.height + 64,
            boxShadow:
              "0 24px 60px -20px rgba(8, 47, 91, 0.45), 0 0 36px rgba(8, 47, 91, 0.32)",
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden items-center gap-1 text-xs text-white/70 sm:inline-flex">
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              {formatDuration(remainingMs)} remaining
            </span>
            <Button type="button" size="sm" variant="secondary" className="h-8" onClick={() => setShowControls((v) => !v)}>
              <Settings2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Controls
            </Button>
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
            {!presentationSettings.kiosk ? (
              <Button type="button" size="sm" variant="secondary" className="h-8" onClick={exitPresentation}>
                <X className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Exit
              </Button>
            ) : null}
          </div>
        </div>
        <div className="h-1 bg-white/10">
          <div className="h-full bg-primary transition-all duration-300 motion-reduce:transition-none" style={{ width: `${overallProgress}%` }} />
        </div>
        <div className="h-0.5 bg-white/5">
          <div className="h-full bg-primary/60 transition-all duration-200 motion-reduce:transition-none" style={{ width: `${presentationSectionProgress}%` }} />
        </div>
      </div>

      {presentationSettings.showNotes ? (
        <div className="pointer-events-none absolute inset-x-4 top-24 mx-auto max-w-2xl rounded-xl border border-white/10 bg-[#08162b]/85 px-4 py-3 text-center text-sm text-white/90 backdrop-blur-md sm:top-28">
          {section.narrative}
          <p className="mt-2 text-xs text-white/60">
            Presenter notes · interact with the page anytime · controls stay available above
          </p>
        </div>
      ) : null}

      {showControls ? (
        <div className="pointer-events-auto absolute inset-x-4 bottom-24 mx-auto max-w-5xl rounded-xl border border-white/10 bg-[#08162b]/92 p-3 backdrop-blur-md sm:bottom-28">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-white/80">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={presentationSettings.manualAdvance}
                onChange={(event) => setPresentationSettings({ manualAdvance: event.target.checked })}
              />
              Manual advance
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={presentationSettings.loop}
                onChange={(event) => setPresentationSettings({ loop: event.target.checked })}
              />
              Loop
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={presentationSettings.kiosk}
                onChange={(event) => setPresentationSettings({ kiosk: event.target.checked })}
              />
              Kiosk mode
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={presentationSettings.showNotes}
                onChange={(event) => setPresentationSettings({ showNotes: event.target.checked })}
              />
              <StickyNote className="h-3.5 w-3.5" aria-hidden />
              Presenter notes
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={presentationSettings.pauseOnInteraction}
                onChange={(event) => setPresentationSettings({ pauseOnInteraction: event.target.checked })}
              />
              Pause on interaction
            </label>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PRESENTATION_SECTIONS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "min-w-[120px] rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                  index === presentationStep
                    ? "border-primary bg-primary/20 text-white"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
                )}
                onClick={() => jumpToPresentationStep(index)}
              >
                <LayoutGrid className="mb-1 h-3.5 w-3.5" aria-hidden />
                <span className="block font-medium">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="pointer-events-auto absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#08162b]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-3 sm:px-6">
          <Button type="button" size="sm" variant="secondary" onClick={previousPresentationStep} disabled={presentationStep === 0}>
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

export function ProductPresentationLauncher({ className }: { className?: string }) {
  const { startPresentation, presentationActive, tourActive, setPresentationSettings } = useProductOverview();

  return (
    <Button
      type="button"
      variant="default"
      className={cn("h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm", className)}
      onClick={() => {
        setPresentationSettings({ kiosk: false, loop: false, manualAdvance: false, showNotes: true });
        startPresentation(0);
      }}
      disabled={presentationActive || tourActive}
    >
      <Maximize2 className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
      Start Presentation
    </Button>
  );
}

export function ProductPresentationKioskLauncher({ className }: { className?: string }) {
  const { startPresentation, presentationActive, setPresentationSettings } = useProductOverview();

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={() => {
        setPresentationSettings({ kiosk: true, loop: true, manualAdvance: false, showNotes: true, pauseOnInteraction: true });
        startPresentation(0);
      }}
      disabled={presentationActive}
    >
      Kiosk Presentation
    </Button>
  );
}
