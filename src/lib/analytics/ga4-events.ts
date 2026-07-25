import { isBobkatItReferrer } from "@/lib/analytics/ga4-config";
import {
  getCanonicalPagePath,
  sendGa4Event,
  trackGa4Once,
  type Ga4EventParams,
} from "@/lib/analytics/ga4";

export { isBobkatItReferrer };

export const GA4_EVENTS = {
  VIEW_TECHNOLOGY_SNAPSHOT: "view_technology_snapshot",
  START_TECHNOLOGY_SNAPSHOT: "start_technology_snapshot",
  COMPLETE_TECHNOLOGY_SNAPSHOT: "complete_technology_snapshot",
  SNAPSHOT_ASSESSMENT_CTA_CLICK: "snapshot_assessment_cta_click",
  SNAPSHOT_CONSULTATION_CLICK: "snapshot_consultation_click",
  VIEW_ASSESSMENT_OFFER: "view_assessment_offer",
  BEGIN_ASSESSMENT_CHECKOUT: "begin_assessment_checkout",
  ASSESSMENT_CONSULTATION_CLICK: "assessment_consultation_click",
  PURCHASE: "purchase",
  ASSESSMENT_PURCHASED: "assessment_purchased",
  /** @deprecated Prefer ASSESSMENT_PURCHASED */
  ASSESSMENT_PURCHASE_CONFIRMED: "assessment_purchase_confirmed",
  SUBSCRIPTION_ACTIVATED: "subscription_activated",
  BOOK_CONSULTATION: "book_consultation",
  SUBMIT_CONTACT_FORM: "submit_contact_form",
  LOGIN: "login",
  SIGN_UP: "sign_up",
  BOBKAT_REFERRAL_LANDING: "bobkat_referral_landing",
} as const;

export type Ga4EventName = (typeof GA4_EVENTS)[keyof typeof GA4_EVENTS];

export type ConsultationButtonLocation =
  | "header"
  | "hero"
  | "footer"
  | "snapshot"
  | "assessment_offer"
  | "other";

export type SnapshotStartMethod = "start_button" | "first_response";

const ASSESSMENT_OFFER_ITEM = {
  item_id: "technology_maturity_assessment",
  item_name: "Technology Maturity Assessment",
  price: 1500,
  quantity: 1,
} as const;

function mapConsultationLocation(placement?: string): ConsultationButtonLocation {
  const value = (placement ?? "").toLowerCase();
  if (value.includes("header") || value.includes("nav")) return "header";
  if (value.includes("hero")) return "hero";
  if (value.includes("footer")) return "footer";
  if (value.includes("snapshot")) return "snapshot";
  if (value.includes("assessment_offer") || value.includes("offer")) return "assessment_offer";
  return "other";
}

export function trackViewTechnologySnapshot(pagePath = "/technology-snapshot") {
  trackGa4Once("view_technology_snapshot", () => {
    sendGa4Event(GA4_EVENTS.VIEW_TECHNOLOGY_SNAPSHOT, {
      page_path: pagePath,
    });
  });
}

export function trackStartTechnologySnapshot(input: {
  startMethod: SnapshotStartMethod;
  pagePath?: string;
}) {
  trackGa4Once("start_technology_snapshot", () => {
    sendGa4Event(GA4_EVENTS.START_TECHNOLOGY_SNAPSHOT, {
      page_path: input.pagePath ?? "/technology-snapshot",
      start_method: input.startMethod,
    });
  });
}

export function trackCompleteTechnologySnapshot(pagePath = "/technology-snapshot") {
  trackGa4Once("complete_technology_snapshot", () => {
    sendGa4Event(GA4_EVENTS.COMPLETE_TECHNOLOGY_SNAPSHOT, {
      page_path: pagePath,
      completion_method: "standard",
    });
  });
}

export function trackSnapshotAssessmentCtaClick(input?: {
  destinationPath?: string;
}) {
  sendGa4Event(GA4_EVENTS.SNAPSHOT_ASSESSMENT_CTA_CLICK, {
    button_location: "snapshot_results",
    destination_path: input?.destinationPath ?? "/assessment-offer",
  });
}

export function trackSnapshotConsultationClick() {
  sendGa4Event(GA4_EVENTS.SNAPSHOT_CONSULTATION_CLICK, {
    button_location: "snapshot_results",
    destination_type: "consultation",
  });
}

export function trackViewAssessmentOffer() {
  trackGa4Once("view_assessment_offer", () => {
    sendGa4Event(GA4_EVENTS.VIEW_ASSESSMENT_OFFER, {
      page_path: "/assessment-offer",
      offer_name: "technology_maturity_assessment",
    });
  });
}

export function trackBeginAssessmentCheckout(buttonLocation = "assessment_offer") {
  sendGa4Event(GA4_EVENTS.BEGIN_ASSESSMENT_CHECKOUT, {
    button_location: buttonLocation,
    offer_name: "technology_maturity_assessment",
    currency: "USD",
  });
}

export function trackAssessmentConsultationClick(buttonLocation = "assessment_offer") {
  sendGa4Event(GA4_EVENTS.ASSESSMENT_CONSULTATION_CLICK, {
    button_location: buttonLocation,
    destination_type: "consultation",
  });
}

export function trackVerifiedPurchase(input: {
  transactionId: string;
  value: number;
  currency?: string;
}) {
  const currency = (input.currency || "USD").toUpperCase();
  const value = Number.isFinite(input.value) && input.value > 0 ? input.value : 0;
  if (value <= 0) return;

  trackGa4Once(`purchase:${input.transactionId}`, () => {
    const params: Ga4EventParams = {
      transaction_id: input.transactionId,
      value,
      currency,
      items: [
        {
          ...ASSESSMENT_OFFER_ITEM,
          price: value,
        },
      ],
    };
    sendGa4Event(GA4_EVENTS.PURCHASE, params);
  });
}

/** Assessment confirmation conversion — only after server verification. */
export function trackAssessmentPurchased(input: {
  transactionId: string;
  value: number;
  currency?: string;
}) {
  const currency = (input.currency || "USD").toUpperCase();
  const value = Number.isFinite(input.value) && input.value > 0 ? input.value : 0;
  if (value <= 0) return;

  trackGa4Once(`assessment_purchased:${input.transactionId}`, () => {
    sendGa4Event(GA4_EVENTS.ASSESSMENT_PURCHASED, {
      currency,
      value,
      transaction_id: input.transactionId,
      purchase_type: "technology_maturity_assessment",
      payment_provider: "stripe",
    });
  });
}

/** @deprecated Use trackAssessmentPurchased */
export function trackAssessmentPurchaseConfirmed(input: {
  transactionId: string;
  currency?: string;
  value?: number;
}) {
  trackAssessmentPurchased({
    transactionId: input.transactionId,
    value: input.value ?? 0,
    currency: input.currency,
  });
}

/** Subscription confirmation conversion — only after server verification. */
export function trackSubscriptionActivated(input: {
  transactionId: string;
  value: number;
  currency?: string;
  billingInterval?: "month" | "year" | "other";
}) {
  const currency = (input.currency || "USD").toUpperCase();
  const value = Number.isFinite(input.value) && input.value > 0 ? input.value : 0;
  if (value <= 0) return;

  trackGa4Once(`subscription_activated:${input.transactionId}`, () => {
    sendGa4Event(GA4_EVENTS.SUBSCRIPTION_ACTIVATED, {
      currency,
      value,
      transaction_id: input.transactionId,
      subscription_type: "strategic_it_consulting",
      payment_provider: "stripe",
      billing_interval: input.billingInterval ?? "other",
    });
  });
}

export function trackBookConsultation(input?: {
  buttonLocation?: ConsultationButtonLocation | string;
  placement?: string;
}) {
  const location =
    typeof input?.buttonLocation === "string" &&
    ["header", "hero", "footer", "snapshot", "assessment_offer", "other"].includes(
      input.buttonLocation,
    )
      ? (input.buttonLocation as ConsultationButtonLocation)
      : mapConsultationLocation(input?.placement ?? input?.buttonLocation);

  sendGa4Event(GA4_EVENTS.BOOK_CONSULTATION, {
    button_location: location,
    destination_type: "consultation",
    page_path: getCanonicalPagePath(),
  });
}

/**
 * Reserved for a future public contact form.
 * Only call after confirmed successful submission — never send field values.
 */
export function trackSubmitContactForm(input: { formName: string; pagePath: string }) {
  sendGa4Event(GA4_EVENTS.SUBMIT_CONTACT_FORM, {
    form_name: input.formName,
    page_path: input.pagePath,
  });
}

/** Successful login only — never send email, user id, or role. */
export function trackLogin() {
  sendGa4Event(GA4_EVENTS.LOGIN, {
    method: "credentials",
  });
}

/** Successful account activation / first sign-up only — never send PII. */
export function trackSignUp() {
  sendGa4Event(GA4_EVENTS.SIGN_UP, {
    method: "activation",
  });
}

export function trackBobkatReferralLanding(pagePath?: string) {
  trackGa4Once("bobkat_referral_landing", () => {
    sendGa4Event(GA4_EVENTS.BOBKAT_REFERRAL_LANDING, {
      page_path: pagePath ?? getCanonicalPagePath(),
      referrer_host: "bobkatit.com",
    });
  });
}
