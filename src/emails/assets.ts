import { BOBKAT_IT_LOGO, bobkatLogoSrc } from "@/lib/branding/assets";
import { CANONICAL_APP_ORIGIN } from "@/lib/url/base-url";

/**
 * Public HTTPS origin for email images.
 * Prefer EMAIL_ASSET_BASE_URL; otherwise use production (`stackscore.tech`) so
 * staging Deployment Protection cannot break logo loads in Gmail/Outlook.
 * Do not fall back to NEXT_PUBLIC_APP_URL / AUTH_URL — those may be staging or localhost.
 */
export function getEmailAssetBaseUrl(): string {
  const configured = process.env.EMAIL_ASSET_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return CANONICAL_APP_ORIGIN;
}

/** Absolute URL for a public asset used in HTML emails (required by Gmail, Outlook, Apple Mail). */
export function getEmailAssetUrl(assetPath: string): string {
  const base = getEmailAssetBaseUrl();
  const path = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${base}${path}`;
}

const PROTECTED_OR_NONPUBLIC_HOSTS = new Set([
  "staging.stackscore.tech",
  "localhost",
  "127.0.0.1",
]);

/**
 * Ensures a brand logo URL is absolute HTTPS and publicly fetchable by email clients.
 * Rewrites relative paths and known protected/local hosts to the email asset base.
 */
export function resolvePublicEmailLogoUrl(url: string | null | undefined): string {
  const fallback = getEmailAssetUrl(bobkatLogoSrc());
  const trimmed = url?.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith("/")) {
    return getEmailAssetUrl(trimmed);
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return fallback;
    }
    const host = parsed.hostname.toLowerCase();
    if (
      PROTECTED_OR_NONPUBLIC_HOSTS.has(host) ||
      host.endsWith(".vercel.app") ||
      host === "0.0.0.0"
    ) {
      return getEmailAssetUrl(`${parsed.pathname}${parsed.search}`);
    }
    return trimmed;
  } catch {
    return fallback;
  }
}

export const EMAIL_BRAND_ASSETS = {
  bobkatItLogo: getEmailAssetUrl(bobkatLogoSrc()),
  bobkatItLogoAlt: BOBKAT_IT_LOGO.alt,
} as const;

/** Canonical customer-facing services triad for email footers / brand defaults. */
export const EMAIL_FOOTER_TAGLINE = "BUILD | IMPROVE | ADVISE";

const LEGACY_FOOTER_TAGLINES = new Set([
  "BUILD · ADVISE · STABILIZE",
  "BUILD · ADVISE · STABILIZE".replace(/\u00b7/g, "·"),
  "BUILD - ADVISE - STABILIZE",
  "BUILD – ADVISE – STABILIZE",
]);

/** Maps null/legacy taglines to the current triad; leaves custom taglines intact. */
export function normalizeEmailFooterTagline(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return EMAIL_FOOTER_TAGLINE;
  if (LEGACY_FOOTER_TAGLINES.has(trimmed)) return EMAIL_FOOTER_TAGLINE;
  if (/^BUILD\s*[·•|\-–—]\s*ADVISE\s*[·•|\-–—]\s*STABILIZE$/i.test(trimmed)) {
    return EMAIL_FOOTER_TAGLINE;
  }
  return trimmed;
}
