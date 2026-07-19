"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  trackProductOverviewConnectionHighlighted,
  trackProductOverviewReportPreviewed,
} from "@/lib/analytics/product-overview-events";
import { getDemoProjectById } from "@/lib/product-overview/demo-dashboard";
import { getDemoConnectionByPillarId } from "@/lib/product-overview/demo-strategy";
import type { DemoDetailPanel, ProductOverviewHighlight } from "@/lib/product-overview/types";

type ProductOverviewContextValue = {
  detailPanel: DemoDetailPanel;
  highlight: ProductOverviewHighlight;
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
};

const ProductOverviewContext = createContext<ProductOverviewContextValue | null>(null);

export function ProductOverviewProvider({ children }: { children: React.ReactNode }) {
  const [detailPanel, setDetailPanel] = useState<DemoDetailPanel>(null);
  const [highlight, setHighlightState] = useState<ProductOverviewHighlight>({});

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

  const value = useMemo(
    () => ({
      detailPanel,
      highlight,
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
    }),
    [
      detailPanel,
      highlight,
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
