/**
 * Production-only GA4 gate. Safe to import from Server and Client Components.
 * Missing or invalid env must never break the app.
 */
export function isGa4Enabled(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true" &&
    Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.startsWith("G-"))
  );
}

export function getGaMeasurementId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!id?.startsWith("G-")) return undefined;
  return id;
}

/** True when document.referrer is a Bobkat IT host (privacy-safe; no path/query kept). */
export function isBobkatItReferrer(referrer: string | null | undefined): boolean {
  if (!referrer) return false;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    return host === "bobkatit.com" || host.endsWith(".bobkatit.com");
  } catch {
    return false;
  }
}
