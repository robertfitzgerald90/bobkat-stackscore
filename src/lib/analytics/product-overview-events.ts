import { track } from "@vercel/analytics";
import type { MarketingAnalyticsProperties } from "@/lib/analytics/marketing-events";

export const PRODUCT_OVERVIEW_ANALYTICS_EVENTS = {
  VIEWED: "product_overview_viewed",
  EXPLORE_CLICKED: "product_overview_explore_clicked",
  PILLAR_OPENED: "product_overview_pillar_opened",
  RECOMMENDATION_OPENED: "product_overview_recommendation_opened",
  PROJECT_OPENED: "product_overview_project_opened",
  ROADMAP_PREVIEWED: "product_overview_roadmap_previewed",
  QBR_PREVIEWED: "product_overview_qbr_previewed",
  ASSESSMENT_CTA_CLICKED: "product_overview_assessment_cta_clicked",
  SECTION_VIEWED: "product_overview_section_viewed",
  JOURNEY_STAGE_CLICKED: "product_overview_journey_stage_clicked",
  ROADMAP_VIEW_CHANGED: "product_overview_roadmap_view_changed",
  CONNECTION_HIGHLIGHTED: "product_overview_connection_highlighted",
} as const;

export type ProductOverviewAnalyticsEventName =
  (typeof PRODUCT_OVERVIEW_ANALYTICS_EVENTS)[keyof typeof PRODUCT_OVERVIEW_ANALYTICS_EVENTS];

const ALLOWED_PROPERTY_KEYS = new Set([
  "placement",
  "source",
  "pillar_id",
  "project_id",
  "recommendation_id",
  "roadmap_initiative_id",
  "section_id",
  "stage_id",
  "view_mode",
  "trigger",
]);

function sanitizeProperties(properties?: MarketingAnalyticsProperties) {
  if (!properties) return undefined;

  const sanitized: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (!ALLOWED_PROPERTY_KEYS.has(key)) continue;
    if (value === null || value === undefined) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

export function trackProductOverviewEvent(
  eventName: ProductOverviewAnalyticsEventName,
  properties?: MarketingAnalyticsProperties,
) {
  if (typeof window === "undefined") return;
  track(eventName, sanitizeProperties(properties));
}

export function trackProductOverviewViewed() {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.VIEWED);
}

export function trackProductOverviewExploreClicked(placement = "hero") {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.EXPLORE_CLICKED, { placement });
}

export function trackProductOverviewPillarOpened(pillarId: string, source = "dashboard") {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.PILLAR_OPENED, {
    pillar_id: pillarId,
    source,
  });
}

export function trackProductOverviewRecommendationOpened(recommendationId: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.RECOMMENDATION_OPENED, {
    recommendation_id: recommendationId,
  });
}

export function trackProductOverviewProjectOpened(projectId: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.PROJECT_OPENED, {
    project_id: projectId,
  });
}

export function trackProductOverviewRoadmapPreviewed() {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.ROADMAP_PREVIEWED);
}

export function trackProductOverviewQbrPreviewed() {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.QBR_PREVIEWED);
}

export function trackProductOverviewAssessmentCtaClicked(placement: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.ASSESSMENT_CTA_CLICKED, {
    placement,
  });
}

export function trackProductOverviewSectionViewed(sectionId: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.SECTION_VIEWED, {
    section_id: sectionId,
  });
}

export function trackProductOverviewJourneyStageClicked(stageId: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.JOURNEY_STAGE_CLICKED, {
    stage_id: stageId,
  });
}

export function trackProductOverviewRoadmapViewChanged(viewMode: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.ROADMAP_VIEW_CHANGED, {
    view_mode: viewMode,
  });
}

export function trackProductOverviewConnectionHighlighted(trigger: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.CONNECTION_HIGHLIGHTED, {
    trigger,
  });
}
