import {
  ASSESSMENT_BOOKING_LABELS,
  getTechnologyMaturityAssessmentBookingUrl,
} from "@/lib/communications/booking-urls";

const SUPPORT_EMAIL = "support@bobkatit.com";

/** @deprecated Prefer getTechnologyMaturityAssessmentBookingUrl() */
export const CALCOM_BOOKING_URL = getTechnologyMaturityAssessmentBookingUrl();

export const BOOKING_LABELS = {
  primary: ASSESSMENT_BOOKING_LABELS.review,
  secondary: ASSESSMENT_BOOKING_LABELS.offer,
} as const;

export function getSupportEmail(): string {
  return SUPPORT_EMAIL;
}

export function getBookingUrl(): string | null {
  const url = getTechnologyMaturityAssessmentBookingUrl();
  return url || null;
}

export function resolveBookingLabel(
  label: keyof typeof BOOKING_LABELS | (string & {}) = "primary",
): string {
  if (label in BOOKING_LABELS) {
    return BOOKING_LABELS[label as keyof typeof BOOKING_LABELS];
  }
  return label;
}
