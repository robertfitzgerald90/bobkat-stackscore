/**
 * Canonical app origin for Stripe redirect URLs.
 * Prefer NEXT_PUBLIC_APP_URL; fall back to AUTH_URL or Vercel preview host.
 */
export function getAppUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  const base = fromEnv || "http://localhost:3000";
  return base.replace(/\/$/, "");
}
