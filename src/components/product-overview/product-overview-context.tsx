"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  trackProductOverviewConnectionHighlighted,
  trackProductOverviewPresentationCompleted,
  trackProductOverviewPresentationExited,
  trackProductOverviewPresentationStarted,
  trackProductOverviewReportPreviewed,
  trackProductOverviewSectionEngagement,
  trackProductOverviewTourCompleted,
  trackProductOverviewTourSkipped,
  trackProductOverviewTourStarted,
} from "@/lib/analytics/product-overview-events";
import { getDemoProjectById } from "@/lib/product-overview/demo-dashboard";
import {
  PRESENTATION_SECTIONS,
  PRESENTATION_STORAGE_KEY,
} from "@/lib/product-overview/presentation-sections";
import { scrollToSection } from "@/lib/product-overview/polish-classes";
import { recordSectionEngagement } from "@/lib/product-overview/section-engagement";
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

type PresentationProgress = {
  currentStep: number;
  completed: boolean;
};

type ProductOverviewContextValue = {
  detailPanel: DemoDetailPanel;
  highlight: ProductOverviewHighlight;
  tourActive: boolean;
  tourStep: number;
  presentationActive: boolean;
  presentationPaused: boolean;
  presentationStep: number;
  presentationSectionProgress: number;
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
  startPresentation: (fromStep?: number) => void;
  exitPresentation: () => void;
  pausePresentation: () => void;
  resumePresentation: () => void;
  nextPresentationStep: () => void;
  previousPresentationStep: () => void;
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

function readPresentationProgress(): PresentationProgress {
  if (typeof window === "undefined") return { currentStep: 0, completed: false };
  try {
    const raw = sessionStorage.getItem(PRESENTATION_STORAGE_KEY);
    if (!raw) return { currentStep: 0, completed: false };
    return JSON.parse(raw) as PresentationProgress;
  } catch {
    return { currentStep: 0, completed: false };
  }
}

function writePresentationProgress(progress: PresentationProgress) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PRESENTATION_STORAGE_KEY, JSON.stringify(progress));
}

export function ProductOverviewProvider({ children }: { children: React.ReactNode }) {
  const [detailPanel, setDetailPanel] = useState<DemoDetailPanel>(null);
  const [highlight, setHighlightState] = useState<ProductOverviewHighlight>({});
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [presentationActive, setPresentationActive] = useState(false);
  const [presentationPaused, setPresentationPaused] = useState(false);
  const [presentationStep, setPresentationStep] = useState(0);
  const [presentationSectionProgress, setPresentationSectionProgress] = useState(0);
  const presentationTimerRef = useRef<number | null>(null);
  const presentationProgressRef = useRef<number>(0);
  const nextPresentationStepRef = useRef<() => void>(() => {});

  useEffect(() => {
    const savedTour = readTourProgress();
    if (!savedTour.completed && savedTour.currentStep > 0) {
      setTourStep(savedTour.currentStep);
    }
    const savedPresentation = readPresentationProgress();
    if (!savedPresentation.completed && savedPresentation.currentStep > 0) {
      setPresentationStep(savedPresentation.currentStep);
    }
  }, []);

  const persistTourStep = useCallback((step: number, completed = false) => {
    setTourStep(step);
    writeTourProgress({ currentStep: step, completed });
  }, []);

  const persistPresentationStep = useCallback((step: number, completed = false) => {
    setPresentationStep(step);
    writePresentationProgress({ currentStep: step, completed });
  }, []);

  const clearPresentationTimer = useCallback(() => {
    if (presentationTimerRef.current !== null) {
      window.clearInterval(presentationTimerRef.current);
      presentationTimerRef.current = null;
    }
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
    scrollToSection(step.sectionId);
  }, []);

  const goToPresentationStep = useCallback(
    (stepIndex: number) => {
      const section = PRESENTATION_SECTIONS[stepIndex];
      if (!section) return;
      persistPresentationStep(stepIndex);
      recordSectionEngagement(section.sectionId);
      trackProductOverviewSectionEngagement(section.sectionId, 1);
      scrollToSection(section.sectionId);
      presentationProgressRef.current = 0;
      setPresentationSectionProgress(0);
    },
    [persistPresentationStep],
  );

  const endTour = useCallback(() => {
    setTourActive(false);
  }, []);

  const startTour = useCallback(
    (fromStep?: number) => {
      if (presentationActive) return;
      const step = fromStep ?? readTourProgress().currentStep ?? 0;
      setTourActive(true);
      persistTourStep(step);
      trackProductOverviewTourStarted(step);
      scrollToTourStep(step);
    },
    [persistTourStep, presentationActive, scrollToTourStep],
  );

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
    if (presentationActive) return;
    persistTourStep(0, false);
    setTourActive(true);
    trackProductOverviewTourStarted(0);
    scrollToTourStep(0);
  }, [persistTourStep, presentationActive, scrollToTourStep]);

  const exitPresentation = useCallback(() => {
    trackProductOverviewPresentationExited(presentationStep + 1);
    clearPresentationTimer();
    setPresentationActive(false);
    setPresentationPaused(false);
    setPresentationSectionProgress(0);
    presentationProgressRef.current = 0;
  }, [clearPresentationTimer, presentationStep]);

  const startPresentation = useCallback(
    (fromStep?: number) => {
      setTourActive(false);
      setDetailPanel(null);
      const step = fromStep ?? readPresentationProgress().currentStep ?? 0;
      setPresentationActive(true);
      setPresentationPaused(false);
      trackProductOverviewPresentationStarted(step);
      goToPresentationStep(step);
    },
    [goToPresentationStep],
  );

  const nextPresentationStep = useCallback(() => {
    const next = presentationStep + 1;
    if (next >= PRESENTATION_SECTIONS.length) {
      trackProductOverviewPresentationCompleted();
      persistPresentationStep(PRESENTATION_SECTIONS.length - 1, true);
      exitPresentation();
      return;
    }
    goToPresentationStep(next);
  }, [exitPresentation, goToPresentationStep, persistPresentationStep, presentationStep]);

  nextPresentationStepRef.current = nextPresentationStep;

  const previousPresentationStep = useCallback(() => {
    const prev = Math.max(presentationStep - 1, 0);
    goToPresentationStep(prev);
  }, [goToPresentationStep, presentationStep]);

  const pausePresentation = useCallback(() => {
    setPresentationPaused(true);
    clearPresentationTimer();
  }, [clearPresentationTimer]);

  const resumePresentation = useCallback(() => {
    setPresentationPaused(false);
  }, []);

  useEffect(() => {
    if (!presentationActive || presentationPaused) {
      clearPresentationTimer();
      return;
    }

    const section = PRESENTATION_SECTIONS[presentationStep];
    if (!section) return;

    const tickMs = 250;
    presentationTimerRef.current = window.setInterval(() => {
      presentationProgressRef.current += tickMs;
      const progress = Math.min(
        100,
        (presentationProgressRef.current / section.durationMs) * 100,
      );
      setPresentationSectionProgress(progress);

      if (presentationProgressRef.current >= section.durationMs) {
        nextPresentationStepRef.current();
      }
    }, tickMs);

    return clearPresentationTimer;
  }, [
    clearPresentationTimer,
    presentationActive,
    presentationPaused,
    presentationStep,
  ]);

  useEffect(() => {
    return () => {
      clearPresentationTimer();
    };
  }, [clearPresentationTimer]);

  const value = useMemo(
    () => ({
      detailPanel,
      highlight,
      tourActive,
      tourStep,
      presentationActive,
      presentationPaused,
      presentationStep,
      presentationSectionProgress,
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
      startPresentation,
      exitPresentation,
      pausePresentation,
      resumePresentation,
      nextPresentationStep,
      previousPresentationStep,
    }),
    [
      detailPanel,
      highlight,
      tourActive,
      tourStep,
      presentationActive,
      presentationPaused,
      presentationStep,
      presentationSectionProgress,
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
      startPresentation,
      exitPresentation,
      pausePresentation,
      resumePresentation,
      nextPresentationStep,
      previousPresentationStep,
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
