/** Default professional services labor rate in cents ($150/hr per product spec). */
export const DEFAULT_LABOR_RATE_CENTS = 15000;

export function getDefaultLaborRateCents(): number {
  return DEFAULT_LABOR_RATE_CENTS;
}

export function formatLaborRateLabel(cents: number): string {
  return `$${(cents / 100).toFixed(2)}/hr`;
}
