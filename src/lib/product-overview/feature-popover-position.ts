import type { FeaturePopoverPlacement } from "@/lib/product-overview/feature-popover-types";

const GAP = 12;
const VIEWPORT_MARGIN = 12;

export type PopoverCoords = {
  top: number;
  left: number;
  placement: FeaturePopoverPlacement;
  width: number;
};

export function getFeaturePopoverWidth(viewportWidth: number): number {
  if (viewportWidth < 640) {
    return Math.max(260, viewportWidth - VIEWPORT_MARGIN * 2);
  }
  if (viewportWidth < 1024) {
    return Math.min(340, Math.max(280, viewportWidth * 0.42));
  }
  return Math.min(420, Math.max(320, viewportWidth * 0.28));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function candidateForPlacement(
  placement: FeaturePopoverPlacement,
  anchor: DOMRect,
  width: number,
  height: number,
): { top: number; left: number } {
  switch (placement) {
    case "right":
      return {
        left: anchor.right + GAP,
        top: anchor.top + (anchor.height - height) / 2,
      };
    case "left":
      return {
        left: anchor.left - GAP - width,
        top: anchor.top + (anchor.height - height) / 2,
      };
    case "bottom":
      return {
        left: anchor.left + (anchor.width - width) / 2,
        top: anchor.bottom + GAP,
      };
    case "top":
      return {
        left: anchor.left + (anchor.width - width) / 2,
        top: anchor.top - GAP - height,
      };
  }
}

function fitsViewport(
  top: number,
  left: number,
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  return (
    left >= VIEWPORT_MARGIN &&
    top >= VIEWPORT_MARGIN &&
    left + width <= viewportWidth - VIEWPORT_MARGIN &&
    top + height <= viewportHeight - VIEWPORT_MARGIN
  );
}

/**
 * Prefer right → bottom → left → top. Flip when colliding, then clamp.
 */
export function computeFeaturePopoverPosition(
  anchor: DOMRect,
  popoverHeight: number,
  preferred: FeaturePopoverPlacement[] = ["right", "bottom", "left", "top"],
): PopoverCoords {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = getFeaturePopoverWidth(viewportWidth);
  const height = Math.max(popoverHeight, 120);

  for (const placement of preferred) {
    const candidate = candidateForPlacement(placement, anchor, width, height);
    if (fitsViewport(candidate.top, candidate.left, width, height, viewportWidth, viewportHeight)) {
      return { ...candidate, placement, width };
    }
  }

  // Best-effort: pick first preferred, then clamp into the viewport.
  const fallbackPlacement = preferred[0] ?? "bottom";
  const fallback = candidateForPlacement(fallbackPlacement, anchor, width, height);
  return {
    top: clamp(fallback.top, VIEWPORT_MARGIN, viewportHeight - height - VIEWPORT_MARGIN),
    left: clamp(fallback.left, VIEWPORT_MARGIN, viewportWidth - width - VIEWPORT_MARGIN),
    placement: fallbackPlacement,
    width,
  };
}
