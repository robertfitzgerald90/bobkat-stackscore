"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FeaturePopover } from "@/components/product-overview/feature-popover";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { shouldOpenFeaturePopover } from "@/lib/product-overview/demo-interaction";
import { PRODUCT_TOUR_STEPS } from "@/lib/product-overview/demo-partnership";
import {
  FEATURE_POPOVER_ANCHOR_ATTR,
  findDemoFeatureElement,
  type FeaturePopoverModel,
} from "@/lib/product-overview/feature-popover-types";
import { resolveFeaturePopoverModel } from "@/lib/product-overview/resolve-feature-popover";

function clearAnchorMarks() {
  document.querySelectorAll(`[${FEATURE_POPOVER_ANCHOR_ATTR}="true"]`).forEach((node) => {
    node.removeAttribute(FEATURE_POPOVER_ANCHOR_ATTR);
  });
}

function markAnchor(anchor: HTMLElement | null) {
  clearAnchorMarks();
  anchor?.setAttribute(FEATURE_POPOVER_ANCHOR_ATTR, "true");
}

export function FeaturePopoverHost() {
  const {
    demoProfile,
    detailPanel,
    detailAnchor,
    closeDetail,
    openDetail,
    tourActive,
    tourStep,
    presentationActive,
    nextTourStep,
    previousTourStep,
    skipTour,
    restartTour,
  } = useProductOverview();

  const tourStepConfig = PRODUCT_TOUR_STEPS[tourStep];
  const [tourAnchor, setTourAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!tourActive || presentationActive || !tourStepConfig) {
      setTourAnchor(null);
      return;
    }

    const sync = () => {
      setTourAnchor(document.getElementById(tourStepConfig.sectionId));
    };

    sync();
    const timer = window.setTimeout(sync, 120);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [presentationActive, tourActive, tourStep, tourStepConfig]);

  const detailModel = useMemo(() => {
    if (!detailPanel || tourActive || !shouldOpenFeaturePopover(detailPanel)) return null;
    return resolveFeaturePopoverModel(detailPanel, demoProfile);
  }, [demoProfile, detailPanel, tourActive]);

  const tourModel = useMemo<FeaturePopoverModel | null>(() => {
    if (!tourActive || presentationActive || !tourStepConfig) return null;
    return {
      title: tourStepConfig.title,
      description: tourStepConfig.featureDescription,
      whyItMatters: tourStepConfig.whyItMatters,
      businessValue: tourStepConfig.businessValue,
    };
  }, [presentationActive, tourActive, tourStepConfig]);

  useEffect(() => {
    if (tourActive && tourAnchor) {
      markAnchor(tourAnchor);
      return () => clearAnchorMarks();
    }
    if (detailPanel && detailAnchor) {
      markAnchor(detailAnchor);
      return () => clearAnchorMarks();
    }
    clearAnchorMarks();
  }, [detailAnchor, detailPanel, tourActive, tourAnchor]);

  const handleRelatedAction = useCallback(
    (action: NonNullable<FeaturePopoverModel["relatedActions"]>[number]) => {
      const nextAnchor =
        (action.featureKey ? findDemoFeatureElement(action.featureKey) : null) ?? detailAnchor;
      openDetail(action.panel, nextAnchor);
    },
    [detailAnchor, openDetail],
  );

  if (presentationActive) return null;

  if (tourActive && tourModel && tourAnchor && tourStepConfig) {
    const progress = ((tourStep + 1) / PRODUCT_TOUR_STEPS.length) * 100;
    return (
      <FeaturePopover
        open
        anchor={tourAnchor}
        model={tourModel}
        onClose={skipTour}
        closeOnOutsideClick={false}
        preferredPlacement={["right", "bottom", "left", "top"]}
        tourControls={{
          stepLabel: `Step ${tourStepConfig.stepNumber} of ${PRODUCT_TOUR_STEPS.length}`,
          progressPercent: progress,
          isFirst: tourStep === 0,
          isLast: tourStep === PRODUCT_TOUR_STEPS.length - 1,
          onPrevious: previousTourStep,
          onNext: nextTourStep,
          onSkip: skipTour,
          onRestart: restartTour,
        }}
      />
    );
  }

  if (detailPanel && detailModel && detailAnchor) {
    return (
      <FeaturePopover
        open
        anchor={detailAnchor}
        model={detailModel}
        onClose={closeDetail}
        onRelatedAction={handleRelatedAction}
      />
    );
  }

  return null;
}
