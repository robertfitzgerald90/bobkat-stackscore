"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  PanelLeft,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { TipReportPreview } from "@/components/technology-improvement-plan/tip-report-preview";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { BRAND } from "@/lib/branding";
import { formatGeneratedDate } from "@/lib/pdf/types";
import {
  countReadyReadinessItems,
  evaluateTipReportReadiness,
  isTipReportReadyForGeneration,
} from "@/lib/technology-improvement-plan/preview-readiness";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import type { TipPlanDetail } from "@/lib/technology-improvement-plan/types";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

const ZOOM_STEPS = [0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5] as const;
const DEFAULT_ZOOM_INDEX = 3;

type TipPreviewWorkspaceProps = {
  plan: TipPlanDetail;
  isAdmin: boolean;
  executiveSummary: string;
  onExecutiveSummaryChange: (value: string) => void;
  downloadUrl: string;
  saving: boolean;
  generating: boolean;
  onPrevious: () => void;
  onSaveDraft: () => Promise<void>;
  onGenerate: () => void;
};

function collectPreviewPages(root: HTMLElement): HTMLElement[] {
  const pages: HTMLElement[] = [];
  const cover = root.querySelector(".tip-report-cover");
  if (cover instanceof HTMLElement) pages.push(cover);

  const body = root.querySelector(".report-body-executive");
  if (!(body instanceof HTMLElement)) return pages;

  let buffer: HTMLElement[] = [];
  const flush = () => {
    if (buffer.length > 0) {
      pages.push(buffer[0]);
      buffer = [];
    }
  };

  for (const child of Array.from(body.children)) {
    if (!(child instanceof HTMLElement)) continue;
    if (child.classList.contains("report-page-break")) {
      flush();
      continue;
    }
    buffer.push(child);
  }
  flush();

  return pages;
}

function usePreviewPages(previewRef: RefObject<HTMLDivElement | null>) {
  const [pages, setPages] = useState<HTMLElement[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const refreshPages = useCallback(() => {
    const root = previewRef.current;
    if (!root) return;
    const nextPages = collectPreviewPages(root);
    setPages(nextPages);
    setCurrentPage((current) => Math.min(current, Math.max(0, nextPages.length - 1)));
  }, [previewRef]);

  useEffect(() => {
    refreshPages();
    const root = previewRef.current;
    if (!root) return;

    const observer = new ResizeObserver(() => refreshPages());
    observer.observe(root);
    return () => observer.disconnect();
  }, [previewRef, refreshPages]);

  const scrollToPage = useCallback(
    (index: number) => {
      const page = pages[index];
      const scrollContainer = previewRef.current?.closest("[data-tip-preview-scroll]");
      if (!page || !(scrollContainer instanceof HTMLElement)) return;

      const containerTop = scrollContainer.getBoundingClientRect().top;
      const pageTop = page.getBoundingClientRect().top;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollTop + (pageTop - containerTop) - 12,
        behavior: "smooth",
      });
      setCurrentPage(index);
    },
    [pages, previewRef],
  );

  return {
    pages,
    currentPage,
    setCurrentPage,
    scrollToPage,
    refreshPages,
    pageCount: Math.max(pages.length, 1),
  };
}

export function TipPreviewWorkspace({
  plan,
  isAdmin,
  executiveSummary,
  onExecutiveSummaryChange,
  downloadUrl,
  saving,
  generating,
  onPrevious,
  onSaveDraft,
  onGenerate,
}: TipPreviewWorkspaceProps) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [fitWidth, setFitWidth] = useState(true);
  const [fitWidthScale, setFitWidthScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const readinessItems = useMemo(
    () => evaluateTipReportReadiness(plan, executiveSummary),
    [plan, executiveSummary],
  );
  const readyForGeneration = isTipReportReadyForGeneration(readinessItems);
  const readyCount = countReadyReadinessItems(readinessItems);

  const { currentPage, scrollToPage, pageCount, refreshPages } = usePreviewPages(previewRef);

  const manualZoom = ZOOM_STEPS[zoomIndex] ?? 1;
  const effectiveZoom = fitWidth ? fitWidthScale : manualZoom;

  const updateFitWidthScale = useCallback(() => {
    const scrollEl = scrollRef.current;
    const previewEl = previewRef.current?.querySelector(".report-document-executive");
    if (!(scrollEl instanceof HTMLElement) || !(previewEl instanceof HTMLElement)) return;

    const available = scrollEl.clientWidth - 32;
    const natural = previewEl.scrollWidth;
    if (natural <= 0 || available <= 0) return;

    setFitWidthScale(Math.min(1, available / natural));
  }, []);

  useEffect(() => {
    updateFitWidthScale();
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const observer = new ResizeObserver(() => updateFitWidthScale());
    observer.observe(scrollEl);
    return () => observer.disconnect();
  }, [updateFitWidthScale, plan, executiveSummary]);

  useEffect(() => {
    refreshPages();
  }, [plan, executiveSummary, refreshPages]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === workspaceRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!workspaceRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await workspaceRef.current.requestFullscreen();
  };

  const goToPreviousPage = () => {
    const next = Math.max(0, currentPage - 1);
    scrollToPage(next);
  };

  const goToNextPage = () => {
    const next = Math.min(pageCount - 1, currentPage + 1);
    scrollToPage(next);
  };

  const preparedDate = plan.generatedAt
    ? formatGeneratedDate(new Date(plan.generatedAt))
    : formatGeneratedDate(new Date(plan.updatedAt));

  const summaryPanel = (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Plan Summary
        </p>
        <h3 className="mt-1 text-base font-semibold leading-snug">{plan.clientName}</h3>
        {plan.assessmentName ? (
          <p className="mt-1 text-xs text-muted-foreground">{plan.assessmentName}</p>
        ) : null}
      </div>

      <dl className="grid gap-3 text-sm">
        <SummaryRow
          label="Current StackScore"
          value={String(plan.currentScore)}
          valueClassName={getScoreTextColorClass(plan.currentScore)}
        />
        <SummaryRow
          label="Projected StackScore"
          value={String(plan.projectedScore)}
          valueClassName={getScoreTextColorClass(plan.projectedScore)}
        />
        <SummaryRow
          label="Expected Improvement"
          value={`+${plan.selectionSummary.projectedScoreImprovement} pts`}
        />
        <SummaryRow
          label="Est. Implementation Timeline"
          value={plan.selectionSummary.estimatedTimeline}
        />
        <SummaryRow
          label="Client Investment"
          value={formatCurrency(plan.selectionSummary.clientInvestmentTotal)}
          highlight
        />
        <SummaryRow
          label="Included Recommendations"
          value={String(plan.selectionSummary.includedCount)}
        />
        <SummaryRow
          label="Deferred Recommendations"
          value={String(plan.selectionSummary.deferredCount)}
        />
        <SummaryRow
          label="Excluded Recommendations"
          value={String(plan.selectionSummary.excludedCount)}
        />
        <SummaryRow label="Plan Version" value={`v${plan.version}`} />
        <SummaryRow
          label="Generated Date"
          value={plan.generatedAt ? preparedDate : "Pending final generation"}
        />
        <SummaryRow label="Prepared By" value={BRAND.companyName} />
      </dl>

      <div className="rounded-lg border border-border bg-card/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Report Readiness
          </p>
          <Badge variant={readyForGeneration ? "success" : "secondary"}>
            {readyCount}/{readinessItems.length}
          </Badge>
        </div>
        <ul className="mt-3 space-y-2">
          {readinessItems.map((item) => (
            <li key={item.id} className="flex gap-2 text-xs">
              {item.ready ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              ) : (
                <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0">
                <p className={cn("font-medium", item.ready ? "text-foreground" : "text-muted-foreground")}>
                  {item.label}
                </p>
                <p className="text-muted-foreground">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div
      ref={workspaceRef}
      className={cn(
        "flex min-h-[min(720px,calc(100vh-12rem))] flex-col overflow-hidden rounded-xl border border-border bg-background",
        isFullscreen && "min-h-screen rounded-none border-0",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">Executive Report Review</h3>
          <p className="text-xs text-muted-foreground">
            Validate content and layout before generating the final deliverable.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <PanelLeft className="mr-2 h-4 w-4" />
          Summary
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          className={cn(
            "border-b border-border bg-surface-card/40 p-4 lg:block lg:overflow-y-auto lg:border-b-0 lg:border-r",
            sidebarOpen ? "block" : "hidden",
          )}
        >
          {summaryPanel}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-3 py-2">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={goToPreviousPage}
                disabled={currentPage <= 0}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[5.5rem] text-center text-xs text-muted-foreground">
                Page {Math.min(currentPage + 1, pageCount)} of {pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={goToNextPage}
                disabled={currentPage >= pageCount - 1}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="hidden h-5 w-px bg-border sm:block" />

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  setFitWidth(false);
                  setZoomIndex((index) => Math.max(0, index - 1));
                }}
                disabled={fitWidth || zoomIndex <= 0}
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="min-w-[3rem] text-center text-xs text-muted-foreground">
                {Math.round(effectiveZoom * 100)}%
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  setFitWidth(false);
                  setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1));
                }}
                disabled={fitWidth || zoomIndex >= ZOOM_STEPS.length - 1}
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="button"
              variant={fitWidth ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setFitWidth(true);
                updateFitWidthScale();
              }}
            >
              Fit Width
            </Button>

            <div className="ml-auto flex items-center gap-1">
              <Button type="button" variant="outline" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <Minimize2 className="mr-2 h-4 w-4" />
                ) : (
                  <Maximize2 className="mr-2 h-4 w-4" />
                )}
                {isFullscreen ? "Exit Full Screen" : "Full Screen"}
              </Button>
              <a href={downloadUrl} className={buttonClassName({ variant: "outline", size: "sm" })}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </a>
            </div>
          </div>

          <div
            ref={scrollRef}
            data-tip-preview-scroll
            className="min-h-0 flex-1 overflow-auto bg-muted/30 p-3 sm:p-4"
          >
            <div
              className="mx-auto origin-top transition-transform duration-150"
              style={{
                transform: `scale(${effectiveZoom})`,
                width: fitWidth ? `${100 / effectiveZoom}%` : undefined,
              }}
            >
              <div ref={previewRef}>
                <TipReportPreview
                  plan={plan}
                  isAdmin={isAdmin}
                  isEditable={plan.isEditable}
                  executiveSummary={executiveSummary}
                  onExecutiveSummaryChange={onExecutiveSummaryChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="flex flex-col gap-2 border-t border-border bg-surface-card/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={onPrevious} disabled={saving || generating}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {!readyForGeneration ? (
            <p className="text-xs text-muted-foreground sm:mr-2">
              Complete required checklist items to generate.
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => void onSaveDraft()}
            disabled={!plan.isEditable || saving || generating}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Draft"
            )}
          </Button>
          <a
            href={downloadUrl}
            className={buttonClassName({ variant: "outline" })}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </a>
          <Button
            type="button"
            onClick={onGenerate}
            disabled={!plan.isEditable || !readyForGeneration || saving || generating}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate Final Plan"
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
  highlight = false,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", highlight && "rounded-md bg-primary/5 px-2 py-1.5 -mx-2")}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-right font-medium tabular-nums", valueClassName)}>{value}</dd>
    </div>
  );
}
