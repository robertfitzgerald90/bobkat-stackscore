const SUPPORT_EMAIL = "support@bobkatit.com";

export function getSupportEmail(): string {
  return SUPPORT_EMAIL;
}

export function getBookingUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();
  return url || null;
}
