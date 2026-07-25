/**
 * Post-login redirect allowlist.
 * Marketing/public funnels must NOT be used as authenticated landing destinations.
 * Open redirects (//, absolute URLs) are always rejected.
 */

const DEFAULT_CALLBACK = "/dashboard";

/** Authenticated app destinations that may be returned via ?callbackUrl= */
const ALLOWED_CALLBACK_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/assessment/start",
  "/assessments",
  "/clients",
  "/portal",
  "/account",
  "/support",
  "/settings",
  "/projects",
  "/portfolio",
  "/insights",
  "/consulting",
  "/playbooks",
  "/technology-catalog",
  "/snapshot-leads",
  "/admin",
] as const;

function pathnameOf(callbackUrl: string): string {
  const withoutHash = callbackUrl.split("#")[0] ?? callbackUrl;
  return withoutHash.split("?")[0] ?? withoutHash;
}

export function isAllowedCallbackPath(path: string): boolean {
  return ALLOWED_CALLBACK_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Sanitize Auth.js / login `callbackUrl` values.
 * Returns `/dashboard` when missing, external, or not an allowlisted app path.
 */
export function getSafeCallbackUrl(value: string | null | undefined): string {
  if (!value) return DEFAULT_CALLBACK;
  if (!value.startsWith("/") || value.startsWith("//")) return DEFAULT_CALLBACK;

  const path = pathnameOf(value);
  if (!isAllowedCallbackPath(path)) return DEFAULT_CALLBACK;

  // Preserve query/hash on allowlisted destinations (e.g. proposal action flags).
  return value;
}

export const SAFE_CALLBACK_DEFAULT = DEFAULT_CALLBACK;
export const SAFE_CALLBACK_ALLOWED_PREFIXES = ALLOWED_CALLBACK_PREFIXES;
