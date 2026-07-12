export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 2;
export const ZOOM_STEP = 0.1;

export type PreviewFitMode = "manual" | "fit-width";

export function clampZoom(value: number): number {
  const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
  return Math.round(clamped * 100) / 100;
}

export function computeFitWidthZoom(
  containerWidth: number,
  documentWidth: number,
  paddingPx = 32,
): number {
  if (containerWidth <= 0 || documentWidth <= 0) return 1;
  const available = containerWidth - paddingPx;
  return clampZoom(available / documentWidth);
}

export function canGoToPreviousPage(currentPage: number): boolean {
  return currentPage > 1;
}

export function canGoToNextPage(currentPage: number, totalPages: number): boolean {
  return totalPages > 0 && currentPage < totalPages;
}

export function canZoomOut(zoom: number, fitMode: PreviewFitMode): boolean {
  if (fitMode === "fit-width") return true;
  return zoom > MIN_ZOOM + 1e-6;
}

export function canZoomIn(zoom: number, fitMode: PreviewFitMode): boolean {
  if (fitMode === "fit-width") return true;
  return zoom < MAX_ZOOM - 1e-6;
}

export function countReportPreviewPages(root: ParentNode): number {
  return root.querySelectorAll("[data-report-preview-page]").length;
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]'),
  );
}
