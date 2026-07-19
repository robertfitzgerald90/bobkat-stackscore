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
  REPORT_PREVIEWED: "product_overview_report_previewed",
  BUDGET_PERIOD_CHANGED: "product_overview_budget_period_changed",
  TOUR_STARTED: "product_overview_tour_started",
  TOUR_COMPLETED: "product_overview_tour_completed",
  TOUR_SKIPPED: "product_overview_tour_skipped",
  TIMELINE_INTERACTION: "product_overview_timeline_interaction",
  PLANNING_VIEWED: "product_overview_planning_viewed",
  EXECUTIVE_DASHBOARD_VIEWED: "product_overview_executive_dashboard_viewed",
  FINAL_CTA_CLICKED: "product_overview_final_cta_clicked",
  PRESENTATION_STARTED: "product_overview_presentation_started",
  PRESENTATION_COMPLETED: "product_overview_presentation_completed",
  PRESENTATION_EXITED: "product_overview_presentation_exited",
  SECTION_ENGAGEMENT: "product_overview_section_engagement",
  CONSULTING_CTA_CLICKED: "product_overview_consulting_cta_clicked",
  DEMO_PERSONALIZED: "product_overview_demo_personalized",
  DEMO_RESET: "product_overview_demo_reset",
  ASSESSMENT_PREVIEW_COMPLETED: "product_overview_assessment_preview_completed",
  PDF_DOWNLOADED: "product_overview_pdf_downloaded",
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
  "report_id",
  "budget_period",
  "timeline_id",
  "planning_tab",
  "widget_id",
  "tour_step",
  "cta_type",
  "presentation_step",
  "engagement_count",
  "demo_industry_id",
  "business_goal",
  "reset_action",
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

export function trackProductOverviewReportPreviewed(reportId: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.REPORT_PREVIEWED, {
    report_id: reportId,
  });
}

export function trackProductOverviewBudgetPeriodChanged(budgetPeriod: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.BUDGET_PERIOD_CHANGED, {
    budget_period: budgetPeriod,
  });
}

export function trackProductOverviewTourStarted(resumeStep?: number) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.TOUR_STARTED, {
    tour_step: resumeStep ?? 0,
  });
}

export function trackProductOverviewTourCompleted() {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.TOUR_COMPLETED);
}

export function trackProductOverviewTourSkipped(step: number) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.TOUR_SKIPPED, {
    tour_step: step,
  });
}

export function trackProductOverviewTimelineInteraction(timelineId: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.TIMELINE_INTERACTION, {
    timeline_id: timelineId,
  });
}

export function trackProductOverviewPlanningViewed(planningTab: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.PLANNING_VIEWED, {
    planning_tab: planningTab,
  });
}

export function trackProductOverviewExecutiveDashboardViewed(widgetId?: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.EXECUTIVE_DASHBOARD_VIEWED, {
    widget_id: widgetId ?? "section",
  });
}

export function trackProductOverviewFinalCtaClicked(ctaType: string, placement: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.FINAL_CTA_CLICKED, {
    cta_type: ctaType,
    placement,
  });
}

export function trackProductOverviewPresentationStarted(step = 0) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.PRESENTATION_STARTED, {
    presentation_step: step,
  });
}

export function trackProductOverviewPresentationCompleted() {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.PRESENTATION_COMPLETED);
}

export function trackProductOverviewPresentationExited(step: number) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.PRESENTATION_EXITED, {
    presentation_step: step,
  });
}

export function trackProductOverviewSectionEngagement(sectionId: string, engagementCount: number) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.SECTION_ENGAGEMENT, {
    section_id: sectionId,
    engagement_count: engagementCount,
  });
}

export function trackProductOverviewConsultingCtaClicked(placement: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.CONSULTING_CTA_CLICKED, {
    placement,
  });
}

export function trackProductOverviewDemoPersonalized(
  industryId: string,
  businessGoal: string,
) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.DEMO_PERSONALIZED, {
    demo_industry_id: industryId,
    business_goal: businessGoal,
  });
}

export function trackProductOverviewDemoReset(resetAction: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.DEMO_RESET, {
    reset_action: resetAction,
  });
}

export function trackProductOverviewAssessmentPreviewCompleted(score: number) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.ASSESSMENT_PREVIEW_COMPLETED, {
    engagement_count: score,
  });
}

export function trackProductOverviewPdfDownloaded(placement: string) {
  trackProductOverviewEvent(PRODUCT_OVERVIEW_ANALYTICS_EVENTS.PDF_DOWNLOADED, {
    placement,
  });
}
