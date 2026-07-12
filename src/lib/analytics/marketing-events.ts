import { track } from "@vercel/analytics";
import type { ServicesCtaKey } from "@/lib/services/cta";

export const MARKETING_ANALYTICS_EVENTS = {
  SERVICE_CTA_CLICK: "service_cta_click",
  SNAPSHOT_START: "snapshot_start",
  ASSESSMENT_CHECKOUT_START: "assessment_checkout_start",
  ASSESSMENT_PURCHASE: "assessment_purchase",
  CAL_BOOKING_CLICK: "cal_booking_click",
  SOLUTION_PAGE_VIEW: "solution_page_view",
} as const;

export type MarketingAnalyticsEventName =
  (typeof MARKETING_ANALYTICS_EVENTS)[keyof typeof MARKETING_ANALYTICS_EVENTS];

export type MarketingAnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

const ALLOWED_PROPERTY_KEYS = new Set([
  "cta_key",
  "link_type",
  "service_id",
  "placement",
  "trigger",
  "has_invitation_flow",
  "source",
  "solution_id",
  "solution_title",
]);

function sanitizeProperties(
  properties?: MarketingAnalyticsProperties,
): Record<string, string | number | boolean> | undefined {
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

export function trackMarketingEvent(
  eventName: MarketingAnalyticsEventName,
  properties?: MarketingAnalyticsProperties,
) {
  if (typeof window === "undefined") return;

  track(eventName, sanitizeProperties(properties));
}

export function trackServiceCtaClick(input: {
  ctaKey: ServicesCtaKey;
  linkType: "internal" | "cal_com";
  serviceId?: string;
  placement?: string;
}) {
  trackMarketingEvent(MARKETING_ANALYTICS_EVENTS.SERVICE_CTA_CLICK, {
    cta_key: input.ctaKey,
    link_type: input.linkType,
    service_id: input.serviceId,
    placement: input.placement,
  });
}

export function trackCalBookingClick(input: { ctaKey: ServicesCtaKey; placement?: string }) {
  trackMarketingEvent(MARKETING_ANALYTICS_EVENTS.CAL_BOOKING_CLICK, {
    cta_key: input.ctaKey,
    placement: input.placement,
  });
}

export function trackSnapshotStart(input: {
  trigger: "cta_click" | "wizard_begin";
  placement?: string;
  hasInvitationFlow?: boolean;
}) {
  trackMarketingEvent(MARKETING_ANALYTICS_EVENTS.SNAPSHOT_START, {
    trigger: input.trigger,
    placement: input.placement,
    has_invitation_flow: input.hasInvitationFlow ?? false,
  });
}

export function trackAssessmentCheckoutStart(input?: { source?: string }) {
  trackMarketingEvent(MARKETING_ANALYTICS_EVENTS.ASSESSMENT_CHECKOUT_START, {
    source: input?.source,
  });
}

export function trackAssessmentPurchase() {
  trackMarketingEvent(MARKETING_ANALYTICS_EVENTS.ASSESSMENT_PURCHASE);
}

export function trackSolutionPageView(input: { solutionId: string; solutionTitle: string }) {
  trackMarketingEvent(MARKETING_ANALYTICS_EVENTS.SOLUTION_PAGE_VIEW, {
    solution_id: input.solutionId,
    solution_title: input.solutionTitle,
  });
}

export function isCalComHref(href: string) {
  return href.startsWith("https://cal.com/");
}
