import { getBaseUrl } from "@/lib/url/base-url";

/** Public marketing path for the Technology Maturity Assessment offer. */
export const TECHNOLOGY_MATURITY_ASSESSMENT_BOOKING_PATH = "/assessment-offer";

/**
 * Canonical URL for assessment purchase / booking CTAs in emails and product surfaces.
 * Override with NEXT_PUBLIC_TECHNOLOGY_ASSESSMENT_BOOKING_URL in each environment.
 */
export function getTechnologyMaturityAssessmentBookingUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_TECHNOLOGY_ASSESSMENT_BOOKING_URL?.trim() ||
    process.env.NEXT_PUBLIC_ASSESSMENT_BOOKING_URL?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return `${getBaseUrl()}${TECHNOLOGY_MATURITY_ASSESSMENT_BOOKING_PATH}`;
}

export const ASSESSMENT_BOOKING_LABELS = {
  primary: "Get the Full Technology Assessment",
  offer: "View the Technology Assessment",
  review: "Schedule Your Assessment Review",
  invitation: "Activate Account & Begin Assessment",
} as const;
