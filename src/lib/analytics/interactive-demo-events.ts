import { track } from "@vercel/analytics";
import type { MarketingAnalyticsProperties } from "@/lib/analytics/marketing-events";

export const INTERACTIVE_DEMO_ANALYTICS_EVENTS = {
  CTA_CLICKED: "demo_cta_clicked",
  STARTED: "demo_started",
  SECTION_VIEWED: "demo_section_viewed",
  EXIT_CLICKED: "demo_exit_clicked",
  ASSESSMENT_CTA_CLICKED: "demo_assessment_cta_clicked",
  DISCOVERY_CALL_CLICKED: "demo_discovery_call_clicked",
  COMPLETED: "demo_completed",
  RETURNED_TO_OFFER: "demo_returned_to_offer",
} as const;

export type InteractiveDemoAnalyticsEventName =
  (typeof INTERACTIVE_DEMO_ANALYTICS_EVENTS)[keyof typeof INTERACTIVE_DEMO_ANALYTICS_EVENTS];

const ALLOWED_PROPERTY_KEYS = new Set([
  "placement",
  "source",
  "section_id",
  "cta_type",
  "return_to",
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

export function trackInteractiveDemoEvent(
  eventName: InteractiveDemoAnalyticsEventName,
  properties?: MarketingAnalyticsProperties,
) {
  if (typeof window === "undefined") return;
  track(eventName, sanitizeProperties(properties));
}

export function trackDemoCtaClicked(placement: string, source?: string) {
  trackInteractiveDemoEvent(INTERACTIVE_DEMO_ANALYTICS_EVENTS.CTA_CLICKED, {
    placement,
    source,
  });
}

export function trackDemoStarted(source?: string) {
  trackInteractiveDemoEvent(INTERACTIVE_DEMO_ANALYTICS_EVENTS.STARTED, { source });
}

export function trackDemoSectionViewed(sectionId: string) {
  trackInteractiveDemoEvent(INTERACTIVE_DEMO_ANALYTICS_EVENTS.SECTION_VIEWED, {
    section_id: sectionId,
  });
}

export function trackDemoExitClicked(placement = "demo_header") {
  trackInteractiveDemoEvent(INTERACTIVE_DEMO_ANALYTICS_EVENTS.EXIT_CLICKED, { placement });
}

export function trackDemoAssessmentCtaClicked(placement: string) {
  trackInteractiveDemoEvent(INTERACTIVE_DEMO_ANALYTICS_EVENTS.ASSESSMENT_CTA_CLICKED, {
    placement,
  });
}

export function trackDemoDiscoveryCallClicked(placement: string) {
  trackInteractiveDemoEvent(INTERACTIVE_DEMO_ANALYTICS_EVENTS.DISCOVERY_CALL_CLICKED, {
    placement,
  });
}

export function trackDemoCompleted(placement = "demo_completion_panel") {
  trackInteractiveDemoEvent(INTERACTIVE_DEMO_ANALYTICS_EVENTS.COMPLETED, { placement });
}

export function trackDemoReturnedToOffer(returnTo?: string) {
  trackInteractiveDemoEvent(INTERACTIVE_DEMO_ANALYTICS_EVENTS.RETURNED_TO_OFFER, {
    return_to: returnTo,
  });
}
