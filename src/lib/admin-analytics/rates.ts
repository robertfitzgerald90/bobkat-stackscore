/** A rate is reported only when both counts come from the same population. */
export function supportedRate(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null;
  if (denominator <= 0) return null;
  if (numerator < 0 || numerator > denominator) return null;
  return numerator / denominator;
}
