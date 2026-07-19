"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  trackProductOverviewConnectionHighlighted,
  trackProductOverviewDemoPersonalized,
  trackProductOverviewDemoReset,
  trackProductOverviewPresentationCompleted,
  trackProductOverviewPresentationExited,
  trackProductOverviewPresentationStarted,
  trackProductOverviewReportPreviewed,
  trackProductOverviewSectionEngagement,
  trackProductOverviewTourCompleted,
  trackProductOverviewTourSkipped,
  trackProductOverviewTourStarted,
} from "@/lib/analytics/product-overview-events";
import {
  buildDemoProfile,
  getDefaultProfile,
} from "@/lib/product-overview/demo-profiles";
import {
  getProfileConnectionByPillarId,
  getProfileProjectById,
} from "@/lib/product-overview/demo-profiles/lookups";
import { DEFAULT_PERSONALIZATION } from "@/lib/product-overview/demo-profiles/personalization";
import type {
  DemoPersonalization,
  DemoProfileBundle,
} from "@/lib/product-overview/demo-profiles/types";
import {
  PRESENTATION_SECTIONS,
  PRESENTATION_STORAGE_KEY,
} from "@/lib/product-overview/presentation-sections";
import { scrollToSection, scrollToTourTarget } from "@/lib/product-overview/polish-classes";
import { clearAllDemoSessionStorage } from "@/lib/product-overview/section-engagement";
import { recordSectionEngagement } from "@/lib/product-overview/section-engagement";
import {
  PRODUCT_TOUR_STEPS,
  TOUR_STORAGE_KEY,
} from "@/lib/product-overview/demo-partnership";
import type { DemoDetailPanel, ProductOverviewHighlight } from "@/lib/product-overview/types";

export type PresentationModeSettings = {
  loop: boolean;
  kiosk: boolean;
  showNotes: boolean;
  pauseOnInteraction: boolean;
  manualAdvance: boolean;
};

type TourProgress = {
  currentStep: number;
  completed: boolean;
};

type PresentationProgress = {
  currentStep: number;
  completed: boolean;
};

type ProductOverviewContextValue = {
  demoProfile: DemoProfileBundle;
  personalization: DemoPersonalization;
  personalizationWizardOpen: boolean;
  presentationSettings: PresentationModeSettings;
  detailPanel: DemoDetailPanel;
  highlight: ProductOverviewHighlight;
  tourActive: boolean;
  tourStep: number;
  presentationActive: boolean;
  presentationPaused: boolean;
  presentationStep: number;
  presentationSectionProgress: number;
  openPersonalizationWizard: () => void;
  closePersonalizationWizard: () => void;
  applyPersonalization: (input: DemoPersonalization) => void;
  resetDemo: () => void;
  startFresh: () => void;
  jumpToPresentationStep: (stepIndex: number) => void;
  setPresentationSettings: (settings: Partial<PresentationModeSettings>) => void;
  notifyPresentationInteraction: () => void;
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
  const [demoProfile, setDemoProfile] = useState<DemoProfileBundle>(() => getDefaultProfile());
  const [personalization, setPersonalization] =
    useState<DemoPersonalization>(DEFAULT_PERSONALIZATION);
  const [personalizationWizardOpen, setPersonalizationWizardOpen] = useState(false);
  const [presentationSettings, setPresentationSettingsState] = useState<PresentationModeSettings>({
    loop: false,
    kiosk: false,
    showNotes: true,
    pauseOnInteraction: true,
    manualAdvance: false,
  });
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
    const connection = getProfileConnectionByPillarId(demoProfile, pillarId);
    setHighlightState({
      pillarId,
      recommendationId: connection?.recommendationId,
      roadmapInitiativeId: connection?.roadmapInitiativeId,
    });
    setDetailPanel({ type: "assessmentPillar", pillarId });
    trackProductOverviewConnectionHighlighted(source);
  }, [demoProfile]);

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
    const project = getProfileProjectById(demoProfile, projectId);
    if (!project) return;

    setHighlightState({
      projectId,
      pillarId: project.pillarId,
      recommendationId: project.relatedRecommendationId,
      roadmapInitiativeId: project.relatedRoadmapInitiativeId,
    });
    setDetailPanel({ type: "projectExecution", projectId });
    trackProductOverviewConnectionHighlighted(source);
  }, [demoProfile]);

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
    // Delay slightly so layout settles before measuring for the spotlight.
    window.requestAnimationFrame(() => {
      scrollToTourTarget(step.sectionId);
    });
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

  const openPersonalizationWizard = useCallback(() => {
    setPersonalizationWizardOpen(true);
  }, []);

  const closePersonalizationWizard = useCallback(() => {
    setPersonalizationWizardOpen(false);
  }, []);

  const applyPersonalization = useCallback((input: DemoPersonalization) => {
    setPersonalization(input);
    setDemoProfile(buildDemoProfile(input));
    setDetailPanel(null);
    setHighlightState({});
    setPersonalizationWizardOpen(false);
    trackProductOverviewDemoPersonalized(input.industryId, input.businessGoal);
  }, []);

  const resetDemoState = useCallback(() => {
    clearAllDemoSessionStorage();
    setDetailPanel(null);
    setHighlightState({});
    setTourActive(false);
    setTourStep(0);
    setPresentationActive(false);
    setPresentationPaused(false);
    setPresentationStep(0);
    setPresentationSectionProgress(0);
    presentationProgressRef.current = 0;
    clearPresentationTimer();
  }, [clearPresentationTimer]);

  const resetDemo = useCallback(() => {
    resetDemoState();
    setPersonalization(DEFAULT_PERSONALIZATION);
    setDemoProfile(getDefaultProfile());
    trackProductOverviewDemoReset("reset_demo");
  }, [resetDemoState]);

  const startFresh = useCallback(() => {
    resetDemoState();
    setPersonalization(DEFAULT_PERSONALIZATION);
    setDemoProfile(getDefaultProfile());
    trackProductOverviewDemoReset("start_fresh");
    scrollToSection("product-overview-dashboard", "start");
  }, [resetDemoState]);

  const setPresentationSettings = useCallback((settings: Partial<PresentationModeSettings>) => {
    setPresentationSettingsState((current) => ({ ...current, ...settings }));
  }, []);

  const notifyPresentationInteraction = useCallback(() => {
    if (presentationActive && presentationSettings.pauseOnInteraction && !presentationPaused) {
      setPresentationPaused(true);
      clearPresentationTimer();
    }
  }, [
    clearPresentationTimer,
    presentationActive,
    presentationPaused,
    presentationSettings.pauseOnInteraction,
  ]);

  const jumpToPresentationStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= PRESENTATION_SECTIONS.length) return;
      goToPresentationStep(stepIndex);
    },
    [goToPresentationStep],
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
      if (presentationSettings.loop || presentationSettings.kiosk) {
        goToPresentationStep(0);
        return;
      }
      exitPresentation();
      return;
    }
    goToPresentationStep(next);
  }, [
    exitPresentation,
    goToPresentationStep,
    persistPresentationStep,
    presentationSettings.kiosk,
    presentationSettings.loop,
    presentationStep,
  ]);

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
    if (!presentationActive || presentationPaused || presentationSettings.manualAdvance) {
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
    presentationSettings.manualAdvance,
  ]);

  useEffect(() => {
    return () => {
      clearPresentationTimer();
    };
  }, [clearPresentationTimer]);

  const value = useMemo(
    () => ({
      demoProfile,
      personalization,
      personalizationWizardOpen,
      presentationSettings,
      detailPanel,
      highlight,
      tourActive,
      tourStep,
      presentationActive,
      presentationPaused,
      presentationStep,
      presentationSectionProgress,
      openPersonalizationWizard,
      closePersonalizationWizard,
      applyPersonalization,
      resetDemo,
      startFresh,
      jumpToPresentationStep,
      setPresentationSettings,
      notifyPresentationInteraction,
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
      demoProfile,
      personalization,
      personalizationWizardOpen,
      presentationSettings,
      detailPanel,
      highlight,
      tourActive,
      tourStep,
      presentationActive,
      presentationPaused,
      presentationStep,
      presentationSectionProgress,
      openPersonalizationWizard,
      closePersonalizationWizard,
      applyPersonalization,
      resetDemo,
      startFresh,
      jumpToPresentationStep,
      setPresentationSettings,
      notifyPresentationInteraction,
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
