import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  clampZoom,
  computeFitWidthZoom,
  countReportPreviewPages,
  MAX_ZOOM,
  MIN_ZOOM,
  type PreviewFitMode,
  ZOOM_STEP,
} from "@/lib/technology-improvement-plan/tip-preview-controls";

type UseTipReportPreviewControlsOptions = {
  previewRef: RefObject<HTMLDivElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
  contentKey: string;
};

export function useTipReportPreviewControls({
  previewRef,
  scrollRef,
  contentKey,
}: UseTipReportPreviewControlsOptions) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [manualZoom, setManualZoom] = useState(1);
  const [fitMode, setFitMode] = useState<PreviewFitMode>("fit-width");
  const [fitWidthZoom, setFitWidthZoom] = useState(1);
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState<string | null>(null);

  const naturalWidthRef = useRef(0);
  const loadAttemptRef = useRef(0);
  const fitModeRef = useRef(fitMode);
  const fitWidthZoomRef = useRef(fitWidthZoom);

  fitModeRef.current = fitMode;
  fitWidthZoomRef.current = fitWidthZoom;

  const effectiveZoom = fitMode === "fit-width" ? fitWidthZoom : manualZoom;

  const measureDocument = useCallback(() => {
    const previewRoot = previewRef.current;
    const scrollEl = scrollRef.current;
    const documentEl = previewRoot?.querySelector(".report-document-executive");
    if (!(previewRoot instanceof HTMLElement) || !(documentEl instanceof HTMLElement)) {
      return false;
    }

    const pageCount = countReportPreviewPages(previewRoot);
    if (pageCount === 0) return false;

    naturalWidthRef.current = documentEl.offsetWidth;
    setTotalPages(pageCount);
    setCurrentPage((page) => Math.min(Math.max(1, page), pageCount));

    if (scrollEl instanceof HTMLElement && naturalWidthRef.current > 0) {
      setFitWidthZoom(
        computeFitWidthZoom(scrollEl.clientWidth, naturalWidthRef.current),
      );
    }

    return true;
  }, [previewRef, scrollRef]);

  const refreshDocument = useCallback(() => {
    setDocumentLoading(true);
    setDocumentError(null);
    loadAttemptRef.current += 1;
    const attemptId = loadAttemptRef.current;

    const tryMeasure = (retriesLeft: number) => {
      if (attemptId !== loadAttemptRef.current) return;

      if (measureDocument()) {
        setDocumentLoading(false);
        return;
      }

      if (retriesLeft <= 0) {
        setDocumentLoading(false);
        setDocumentError("Unable to load the report preview. Try refreshing the page.");
        return;
      }

      window.requestAnimationFrame(() => tryMeasure(retriesLeft - 1));
    };

    window.requestAnimationFrame(() => tryMeasure(8));
  }, [measureDocument]);

  useEffect(() => {
    refreshDocument();
  }, [contentKey, refreshDocument]);

  const updateFitWidthZoom = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!(scrollEl instanceof HTMLElement) || naturalWidthRef.current <= 0) return;
    setFitWidthZoom(computeFitWidthZoom(scrollEl.clientWidth, naturalWidthRef.current));
  }, [scrollRef]);

  useEffect(() => {
    if (fitMode !== "fit-width") return;
    updateFitWidthZoom();
    const scrollEl = scrollRef.current;
    if (!(scrollEl instanceof HTMLElement)) return;

    const observer = new ResizeObserver(() => updateFitWidthZoom());
    observer.observe(scrollEl);
    return () => observer.disconnect();
  }, [fitMode, updateFitWidthZoom, scrollRef, contentKey]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((page) => Math.max(1, page - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }, [totalPages]);

  const zoomIn = useCallback(() => {
    setFitMode("manual");
    setManualZoom((zoom) =>
      clampZoom(
        (fitModeRef.current === "fit-width" ? fitWidthZoomRef.current : zoom) + ZOOM_STEP,
      ),
    );
  }, []);

  const zoomOut = useCallback(() => {
    setFitMode("manual");
    setManualZoom((zoom) =>
      clampZoom(
        (fitModeRef.current === "fit-width" ? fitWidthZoomRef.current : zoom) - ZOOM_STEP,
      ),
    );
  }, []);

  const resetZoom = useCallback(() => {
    setFitMode("manual");
    setManualZoom(1);
  }, []);

  const enableFitWidth = useCallback(() => {
    setFitMode("fit-width");
    updateFitWidthZoom();
  }, [updateFitWidthZoom]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [currentPage, scrollRef]);

  const documentReady = !documentLoading && !documentError && totalPages > 0;

  return {
    currentPage,
    totalPages,
    manualZoom,
    fitMode,
    fitWidthZoom,
    effectiveZoom,
    documentLoading,
    documentError,
    documentReady,
    activePageIndex: documentLoading ? null : currentPage - 1,
    goToPreviousPage,
    goToNextPage,
    zoomIn,
    zoomOut,
    resetZoom,
    enableFitWidth,
    refreshDocument,
  };
}

export { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP };
