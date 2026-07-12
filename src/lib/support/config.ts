const SUPPORT_EMAIL = "support@bobkatit.com";

export const CALCOM_BOOKING_URL =
  process.env.NEXT_PUBLIC_CALCOM_BOOKING_URL?.trim() ?? "";

export const BOOKING_LABELS = {
  primary: "Schedule Your Assessment Review",
  secondary: "Book a Meeting",
} as const;

export function getSupportEmail(): string {
  return SUPPORT_EMAIL;
}

export function getBookingUrl(): string | null {
  return CALCOM_BOOKING_URL || null;
}

export function resolveBookingLabel(
  label: keyof typeof BOOKING_LABELS | (string & {}) = "primary",
): string {
  if (label in BOOKING_LABELS) {
    return BOOKING_LABELS[label as keyof typeof BOOKING_LABELS];
  }
  return label;
}
