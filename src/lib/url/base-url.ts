export const LEGACY_APP_HOST = "stackscore.bobkatit.com";
export const CANONICAL_APP_HOST = "stackscore.tech";
export const CANONICAL_APP_ORIGIN = `https://${CANONICAL_APP_HOST}`;

const LOCAL_DEV_ORIGIN = "http://localhost:3000";

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, "");
}

/**
 * Canonical application origin for emails, metadata, Stripe redirects, and callbacks.
 * Prefers NEXT_PUBLIC_APP_URL, then AUTH_URL, then Vercel preview host in preview builds.
 */
export function getBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.AUTH_URL?.trim();

  if (fromEnv) {
    return normalizeOrigin(fromEnv);
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return LOCAL_DEV_ORIGIN;
}

/** @deprecated Prefer getBaseUrl — kept for existing imports. */
export const getAppUrl = getBaseUrl;

export function buildAppPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function buildAppUrl(path: string): string {
  return `${getBaseUrl()}${buildAppPath(path)}`;
}

export function isLegacyAppHost(host: string): boolean {
  const normalized = host.trim().toLowerCase().split(":")[0] ?? "";
  return normalized === LEGACY_APP_HOST || normalized === `www.${LEGACY_APP_HOST}`;
}

export function isLocalDevHost(host: string): boolean {
  const normalized = host.trim().toLowerCase().split(":")[0] ?? "";
  return normalized === "localhost" || normalized === "127.0.0.1";
}
