import { describe, expect, it } from "vitest";
import {
  canGoToNextPage,
  canGoToPreviousPage,
  canZoomIn,
  canZoomOut,
  clampZoom,
  computeFitWidthZoom,
  countReportPreviewPages,
  isEditableTarget,
  MAX_ZOOM,
  MIN_ZOOM,
} from "@/lib/technology-improvement-plan/tip-preview-controls";

describe("tip-preview-controls", () => {
  it("clamps zoom to configured bounds", () => {
    expect(clampZoom(0.2)).toBe(MIN_ZOOM);
    expect(clampZoom(3)).toBe(MAX_ZOOM);
    expect(clampZoom(1.05)).toBe(1.05);
  });

  it("computes fit-width zoom from container and document width", () => {
    expect(computeFitWidthZoom(900, 800, 32)).toBe(1);
    expect(computeFitWidthZoom(500, 800, 32)).toBe(0.59);
  });

  it("evaluates page navigation boundaries", () => {
    expect(canGoToPreviousPage(1)).toBe(false);
    expect(canGoToPreviousPage(2)).toBe(true);
    expect(canGoToNextPage(2, 4)).toBe(true);
    expect(canGoToNextPage(4, 4)).toBe(false);
  });

  it("allows zoom buttons to exit fit-width mode", () => {
    expect(canZoomOut(1, "fit-width")).toBe(true);
    expect(canZoomIn(1, "fit-width")).toBe(true);
    expect(canZoomOut(MIN_ZOOM, "manual")).toBe(false);
    expect(canZoomIn(MAX_ZOOM, "manual")).toBe(false);
  });

  it("counts preview pages from the DOM", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <div data-report-preview-page></div>
      <div data-report-preview-page></div>
      <div data-report-preview-page></div>
    `;
    expect(countReportPreviewPages(root)).toBe(3);
  });

  it("detects editable keyboard targets", () => {
    const input = document.createElement("input");
    expect(isEditableTarget(input)).toBe(true);
    expect(isEditableTarget(document.createElement("div"))).toBe(false);
  });
});
