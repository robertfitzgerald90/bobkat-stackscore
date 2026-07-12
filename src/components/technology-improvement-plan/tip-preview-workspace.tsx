"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { useTipReportPreviewControls } from "@/components/technology-improvement-plan/use-tip-report-preview-controls";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { BRAND } from "@/lib/branding";
import { formatGeneratedDate } from "@/lib/pdf/types";
import {
  countReadyReadinessItems,
  evaluateTipReportReadiness,
  isTipReportReadyForGeneration,
} from "@/lib/technology-improvement-plan/preview-readiness";
import {
  canGoToNextPage,
  canGoToPreviousPage,
  canZoomIn,
  canZoomOut,
  isEditableTarget,
} from "@/lib/technology-improvement-plan/tip-preview-controls";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import type { TipPlanDetail } from "@/lib/technology-improvement-plan/types";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const contentKey = useMemo(
    () => `${plan.id}:${plan.version}:${executiveSummary}`,
    [plan.id, plan.version, executiveSummary],
  );

  const {
    currentPage,
    totalPages,
    fitMode,
    effectiveZoom,
    documentLoading,
    documentError,
    documentReady,
    activePageIndex,
    goToPreviousPage,
    goToNextPage,
    zoomIn,
    zoomOut,
    resetZoom,
    enableFitWidth,
  } = useTipReportPreviewControls({
    previewRef,
    scrollRef,
    contentKey,
  });

  const readinessItems = useMemo(
    () => evaluateTipReportReadiness(plan, executiveSummary),
    [plan, executiveSummary],
  );
  const readyForGeneration = isTipReportReadyForGeneration(readinessItems);
  const readyCount = countReadyReadinessItems(readinessItems);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === workspaceRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (event.key === "ArrowLeft") {
        if (documentReady && canGoToPreviousPage(currentPage)) {
          event.preventDefault();
          goToPreviousPage();
        }
        return;
      }

      if (event.key === "ArrowRight") {
        if (documentReady && canGoToNextPage(currentPage, totalPages)) {
          event.preventDefault();
          goToNextPage();
        }
        return;
      }

      if ((event.ctrlKey || event.metaKey) && (event.key === "+" || event.key === "=")) {
        if (documentReady && canZoomIn(effectiveZoom, fitMode)) {
          event.preventDefault();
          zoomIn();
        }
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "-") {
        if (documentReady && canZoomOut(effectiveZoom, fitMode)) {
          event.preventDefault();
          zoomOut();
        }
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "0") {
        if (documentReady) {
          event.preventDefault();
          resetZoom();
        }
      }
    };

    workspace.addEventListener("keydown", onKeyDown);
    return () => workspace.removeEventListener("keydown", onKeyDown);
  }, [
    currentPage,
    documentReady,
    effectiveZoom,
    fitMode,
    goToNextPage,
    goToPreviousPage,
    resetZoom,
    totalPages,
    zoomIn,
    zoomOut,
  ]);

  const toggleFullscreen = async () => {
    if (!workspaceRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await workspaceRef.current.requestFullscreen();
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
      tabIndex={-1}
      role="region"
      aria-label="Executive report preview workspace"
      className={cn(
        "flex min-h-[min(720px,calc(100vh-12rem))] flex-col overflow-hidden rounded-xl border border-border bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
                disabled={!documentReady || !canGoToPreviousPage(currentPage)}
                aria-label="Previous page"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span
                className="min-w-[5.5rem] text-center text-xs text-muted-foreground"
                aria-live="polite"
                aria-atomic="true"
              >
                {documentReady
                  ? `Page ${currentPage} of ${totalPages}`
                  : documentLoading
                    ? "Loading…"
                    : "—"}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={goToNextPage}
                disabled={!documentReady || !canGoToNextPage(currentPage, totalPages)}
                aria-label="Next page"
                title="Next page"
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
                onClick={zoomOut}
                disabled={!documentReady || !canZoomOut(effectiveZoom, fitMode)}
                aria-label="Zoom out"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span
                className="min-w-[3rem] text-center text-xs text-muted-foreground tabular-nums"
                aria-live="polite"
              >
                {documentReady ? `${Math.round(effectiveZoom * 100)}%` : "—"}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={zoomIn}
                disabled={!documentReady || !canZoomIn(effectiveZoom, fitMode)}
                aria-label="Zoom in"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="button"
              variant={fitMode === "fit-width" ? "secondary" : "outline"}
              size="sm"
              onClick={enableFitWidth}
              disabled={!documentReady}
              aria-pressed={fitMode === "fit-width"}
              title="Fit report width to preview area"
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
            className="relative min-h-0 flex-1 overflow-auto bg-muted/30 p-3 sm:p-4"
          >
            {documentLoading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                Loading report preview…
              </div>
            ) : null}

            {documentError ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 px-4 text-center">
                <p className="text-sm font-medium text-destructive">Preview unavailable</p>
                <p className="text-sm text-muted-foreground">{documentError}</p>
              </div>
            ) : null}

            <div
              className={cn(
                "mx-auto origin-top transition-transform duration-150",
                (documentLoading || documentError) && "pointer-events-none invisible absolute opacity-0",
              )}
              style={{
                transform: `scale(${effectiveZoom})`,
                transformOrigin: "top center",
                width: fitMode === "fit-width" ? `${100 / effectiveZoom}%` : undefined,
              }}
            >
              <div ref={previewRef}>
                <TipReportPreview
                  plan={plan}
                  isAdmin={isAdmin}
                  isEditable={plan.isEditable}
                  executiveSummary={executiveSummary}
                  onExecutiveSummaryChange={onExecutiveSummaryChange}
                  activePageIndex={activePageIndex}
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
          <a href={downloadUrl} className={buttonClassName({ variant: "outline" })}>
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
