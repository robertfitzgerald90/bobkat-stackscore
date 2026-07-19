"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  trackProductOverviewConnectionHighlighted,
  trackProductOverviewReportPreviewed,
  trackProductOverviewTourCompleted,
  trackProductOverviewTourSkipped,
  trackProductOverviewTourStarted,
} from "@/lib/analytics/product-overview-events";
import { getDemoProjectById } from "@/lib/product-overview/demo-dashboard";
import {
  PRODUCT_TOUR_STEPS,
  TOUR_STORAGE_KEY,
} from "@/lib/product-overview/demo-partnership";
import { getDemoConnectionByPillarId } from "@/lib/product-overview/demo-strategy";
import type { DemoDetailPanel, ProductOverviewHighlight } from "@/lib/product-overview/types";

type TourProgress = {
  currentStep: number;
  completed: boolean;
};

type ProductOverviewContextValue = {
  detailPanel: DemoDetailPanel;
  highlight: ProductOverviewHighlight;
  tourActive: boolean;
  tourStep: number;
  openDetail: (panel: DemoDetailPanel) => void;
  closeDetail: () => void;
  setHighlight: (highlight: ProductOverviewHighlight) => void;
  clearHighlight: () => void;
  openConnectedPillar: (pillarId: string, source?: string) => void;
  openConnectedRecommendation: (recommendationId: string, source?: string) => void;
  openConnectedRoadmapInitiative: (initiativeId: string, source?: string) => void;
  openConnectedProject: (projectId: string, source?: string) => void;
  openReport: (reportId: string, source?: string) => void;
  isHighlighted: (ids: {
    pillarId?: string;
    recommendationId?: string;
    roadmapInitiativeId?: string;
    projectId?: string;
    reportId?: string;
  }) => boolean;
  startTour: (fromStep?: number) => void;
  nextTourStep: () => void;
  previousTourStep: () => void;
  skipTour: () => void;
  restartTour: () => void;
  endTour: () => void;
};

const ProductOverviewContext = createContext<ProductOverviewContextValue | null>(null);

function readTourProgress(): TourProgress {
  if (typeof window === "undefined") return { currentStep: 0, completed: false };
  try {
    const raw = sessionStorage.getItem(TOUR_STORAGE_KEY);
    if (!raw) return { currentStep: 0, completed: false };
    return JSON.parse(raw) as TourProgress;
  } catch {
    return { currentStep: 0, completed: false };
  }
}

function writeTourProgress(progress: TourProgress) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(progress));
}

export function ProductOverviewProvider({ children }: { children: React.ReactNode }) {
  const [detailPanel, setDetailPanel] = useState<DemoDetailPanel>(null);
  const [highlight, setHighlightState] = useState<ProductOverviewHighlight>({});
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    const saved = readTourProgress();
    if (!saved.completed && saved.currentStep > 0) {
      setTourStep(saved.currentStep);
    }
  }, []);

  const persistTourStep = useCallback((step: number, completed = false) => {
    setTourStep(step);
    writeTourProgress({ currentStep: step, completed });
  }, []);

  const setHighlight = useCallback((next: ProductOverviewHighlight) => {
    setHighlightState(next);
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightState({});
  }, []);

  const openDetail = useCallback((panel: DemoDetailPanel) => {
    setDetailPanel(panel);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailPanel(null);
  }, []);

  const openConnectedPillar = useCallback((pillarId: string, source = "pillar") => {
    const connection = getDemoConnectionByPillarId(pillarId);
    setHighlightState({
      pillarId,
      recommendationId: connection?.recommendationId,
      roadmapInitiativeId: connection?.roadmapInitiativeId,
    });
    setDetailPanel({ type: "assessmentPillar", pillarId });
    trackProductOverviewConnectionHighlighted(source);
  }, []);

  const openConnectedRecommendation = useCallback((recommendationId: string, source = "recommendation") => {
    setHighlightState((current) => ({
      ...current,
      recommendationId,
    }));
    setDetailPanel({ type: "recommendation", recommendationId });
    trackProductOverviewConnectionHighlighted(source);
  }, []);

  const openConnectedRoadmapInitiative = useCallback(
    (initiativeId: string, source = "roadmap") => {
      setHighlightState((current) => ({
        ...current,
        roadmapInitiativeId: initiativeId,
      }));
      setDetailPanel({ type: "roadmapInitiative", initiativeId });
      trackProductOverviewConnectionHighlighted(source);
    },
    [],
  );

  const openConnectedProject = useCallback((projectId: string, source = "project") => {
    const project = getDemoProjectById(projectId);
    if (!project) return;

    setHighlightState({
      projectId,
      pillarId: project.pillarId,
      recommendationId: project.relatedRecommendationId,
      roadmapInitiativeId: project.relatedRoadmapInitiativeId,
    });
    setDetailPanel({ type: "projectExecution", projectId });
    trackProductOverviewConnectionHighlighted(source);
  }, []);

  const openReport = useCallback((reportId: string, source = "report") => {
    setHighlightState((current) => ({ ...current, reportId }));
    setDetailPanel({ type: "report", reportId });
    trackProductOverviewReportPreviewed(reportId);
    trackProductOverviewConnectionHighlighted(source);
  }, []);

  const isHighlighted = useCallback(
    (ids: {
      pillarId?: string;
      recommendationId?: string;
      roadmapInitiativeId?: string;
      projectId?: string;
      reportId?: string;
    }) => {
      if (ids.pillarId && highlight.pillarId === ids.pillarId) return true;
      if (ids.recommendationId && highlight.recommendationId === ids.recommendationId) return true;
      if (ids.roadmapInitiativeId && highlight.roadmapInitiativeId === ids.roadmapInitiativeId) {
        return true;
      }
      if (ids.projectId && highlight.projectId === ids.projectId) return true;
      if (ids.reportId && highlight.reportId === ids.reportId) return true;
      return false;
    },
    [highlight],
  );

  const scrollToTourStep = useCallback((stepIndex: number) => {
    const step = PRODUCT_TOUR_STEPS[stepIndex];
    if (!step) return;
    document.getElementById(step.sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  const startTour = useCallback(
    (fromStep?: number) => {
      const step = fromStep ?? readTourProgress().currentStep ?? 0;
      setTourActive(true);
      persistTourStep(step);
      trackProductOverviewTourStarted(step);
      scrollToTourStep(step);
    },
    [persistTourStep, scrollToTourStep],
  );

  const endTour = useCallback(() => {
    setTourActive(false);
  }, []);

  const nextTourStep = useCallback(() => {
    const next = Math.min(tourStep + 1, PRODUCT_TOUR_STEPS.length - 1);
    if (next === tourStep) {
      trackProductOverviewTourCompleted();
      persistTourStep(next, true);
      setTourActive(false);
      return;
    }
    persistTourStep(next);
    scrollToTourStep(next);
  }, [persistTourStep, scrollToTourStep, tourStep]);

  const previousTourStep = useCallback(() => {
    const prev = Math.max(tourStep - 1, 0);
    persistTourStep(prev);
    scrollToTourStep(prev);
  }, [persistTourStep, scrollToTourStep, tourStep]);

  const skipTour = useCallback(() => {
    trackProductOverviewTourSkipped(tourStep + 1);
    persistTourStep(tourStep, true);
    setTourActive(false);
  }, [persistTourStep, tourStep]);

  const restartTour = useCallback(() => {
    persistTourStep(0, false);
    setTourActive(true);
    trackProductOverviewTourStarted(0);
    scrollToTourStep(0);
  }, [persistTourStep, scrollToTourStep]);

  const value = useMemo(
    () => ({
      detailPanel,
      highlight,
      tourActive,
      tourStep,
      openDetail,
      closeDetail,
      setHighlight,
      clearHighlight,
      openConnectedPillar,
      openConnectedRecommendation,
      openConnectedRoadmapInitiative,
      openConnectedProject,
      openReport,
      isHighlighted,
      startTour,
      nextTourStep,
      previousTourStep,
      skipTour,
      restartTour,
      endTour,
    }),
    [
      detailPanel,
      highlight,
      tourActive,
      tourStep,
      openDetail,
      closeDetail,
      setHighlight,
      clearHighlight,
      openConnectedPillar,
      openConnectedRecommendation,
      openConnectedRoadmapInitiative,
      openConnectedProject,
      openReport,
      isHighlighted,
      startTour,
      nextTourStep,
      previousTourStep,
      skipTour,
      restartTour,
      endTour,
    ],
  );

  return (
    <ProductOverviewContext.Provider value={value}>{children}</ProductOverviewContext.Provider>
  );
}

export function useProductOverview() {
  const context = useContext(ProductOverviewContext);
  if (!context) {
    throw new Error("useProductOverview must be used within ProductOverviewProvider");
  }
  return context;
}
