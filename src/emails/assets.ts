import { getBaseUrl } from "@/lib/url/base-url";
import { bobkatLogoSrc } from "@/lib/branding/assets";

/** Absolute URL for a public asset used in HTML emails (required by Gmail, Outlook, Apple Mail). */
export function getEmailAssetUrl(assetPath: string): string {
  const base = (
    process.env.EMAIL_ASSET_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    getBaseUrl()
  ).replace(/\/$/, "");

  const path = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${base}${path}`;
}

export const EMAIL_BRAND_ASSETS = {
  bobkatItLogo: getEmailAssetUrl(bobkatLogoSrc()),
} as const;
