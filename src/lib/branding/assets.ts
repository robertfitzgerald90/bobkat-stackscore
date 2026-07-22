/** Bump when public branding or marketing images change to invalidate CDN/browser caches. */
export const BRAND_ASSET_VERSION = "2026-07";

export const BOBKAT_IT_LOGO = {
  src: "/branding/new-bobkat-it-logo.png",
  fileName: "new-bobkat-it-logo.png",
  naturalWidth: 4800,
  naturalHeight: 3300,
  aspectRatio: 4800 / 3300,
  alt: "Bobkat IT logo",
} as const;

export type BobkatLogoPlacement =
  | "header"
  | "sidebar"
  | "footer"
  | "auth"
  | "email"
  | "report"
  | "default";

const PLACEMENT_HEIGHT: Record<BobkatLogoPlacement, number> = {
  header: 32,
  sidebar: 36,
  footer: 28,
  auth: 56,
  email: 48,
  report: 44,
  default: 40,
};

export function publicAssetUrl(assetPath: string): string {
  const path = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  if (path.includes("?")) return path;
  return `${path}?v=${BRAND_ASSET_VERSION}`;
}

export function bobkatLogoSrc(): string {
  return publicAssetUrl(BOBKAT_IT_LOGO.src);
}

export function bobkatLogoDimensionsForHeight(height: number): { width: number; height: number } {
  return {
    width: Math.round(height * BOBKAT_IT_LOGO.aspectRatio),
    height,
  };
}

export function bobkatLogoHeightForPlacement(placement: BobkatLogoPlacement): number {
  return PLACEMENT_HEIGHT[placement];
}

export function bobkatLogoDimensionsForPlacement(
  placement: BobkatLogoPlacement,
): { width: number; height: number } {
  return bobkatLogoDimensionsForHeight(bobkatLogoHeightForPlacement(placement));
}

export function getPdfLogoRelativePath(): string {
  return `public/branding/${BOBKAT_IT_LOGO.fileName}`;
}
