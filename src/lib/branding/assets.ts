/** Bump when public branding or marketing images change to invalidate CDN/browser caches. */
export const BRAND_ASSET_VERSION = "2026-10-brand-004-r2";

/**
 * Authentic Bobkat IT wolf emblem with transparent canvas (SS-BRAND-004).
 * Prefer over `new-bobkat-it-logo.png`, which embeds an opaque black rectangle.
 * Full master asset — preserves original framing for email/PDF/legacy placements.
 */
export const BOBKAT_IT_LOGO = {
  src: "/branding/bkit-logo.png",
  fileName: "bkit-logo.png",
  naturalWidth: 4800,
  naturalHeight: 3300,
  aspectRatio: 4800 / 3300,
  /**
   * Alpha-visible artwork inside the master canvas (SS-BRAND-004-R2).
   * Horizontal padding ~24% per side made container-based sizing understate the wolf.
   */
  visibleBounds: {
    left: 1155,
    top: 86,
    right: 3644,
    bottom: 3214,
    width: 2489,
    height: 3128,
    widthFraction: 2489 / 4800,
    heightFraction: 3128 / 3300,
  },
  alt: "Bobkat IT logo",
} as const;

/**
 * Tight crop of the authentic transparent emblem for hero / authentication
 * presentation where visible artwork size must match intended CSS width
 * (SS-BRAND-004-R2). Does not replace the master asset.
 */
export const BOBKAT_IT_LOGO_TIGHT = {
  src: "/branding/bkit-logo-tight.png",
  fileName: "bkit-logo-tight.png",
  naturalWidth: 2615,
  naturalHeight: 3254,
  aspectRatio: 2615 / 3254,
  alt: "Bobkat IT logo",
  derivedFrom: BOBKAT_IT_LOGO.fileName,
} as const;

export type BobkatLogoAsset = typeof BOBKAT_IT_LOGO | typeof BOBKAT_IT_LOGO_TIGHT;

/**
 * Public presentation variants with independently controlled dimensions
 * (SS-BRAND-004-R2). Distinct from layout `variant` (sidebar / stacked).
 */
export type BobkatLogoPresentation = "navigation" | "hero" | "authentication";

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

/**
 * Target CSS widths for the *visible* wolf after using the tight crop.
 * Mobile / desktop pairs.
 */
export const BOBKAT_LOGO_PRESENTATION: Record<
  BobkatLogoPresentation,
  {
    asset: "full" | "tight";
    widthMobile: number;
    widthDesktop: number;
    /** Static Tailwind width classes — keep literal for JIT. */
    widthClassName: string;
    glowClassName: string | null;
    showWordmarkDefault: boolean;
  }
> = {
  navigation: {
    asset: "full",
    widthMobile: 36,
    widthDesktop: 36,
    widthClassName: "h-auto w-auto max-w-full object-contain",
    glowClassName: null,
    showWordmarkDefault: true,
  },
  hero: {
    asset: "tight",
    widthMobile: 88,
    widthDesktop: 112,
    widthClassName: "h-auto w-[88px] object-contain sm:w-[112px]",
    glowClassName:
      "rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18)_0%,transparent_68%)] p-3 sm:p-4",
    showWordmarkDefault: false,
  },
  authentication: {
    asset: "tight",
    widthMobile: 90,
    widthDesktop: 116,
    widthClassName: "h-auto w-[90px] object-contain sm:w-[116px]",
    glowClassName:
      "rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18)_0%,transparent_68%)] p-3 sm:p-[1.125rem]",
    showWordmarkDefault: false,
  },
};

export function publicAssetUrl(assetPath: string): string {
  const path = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  if (path.includes("?")) return path;
  return `${path}?v=${BRAND_ASSET_VERSION}`;
}

export function bobkatLogoSrc(asset: BobkatLogoAsset = BOBKAT_IT_LOGO): string {
  return publicAssetUrl(asset.src);
}

export function bobkatLogoAssetForPresentation(
  presentation: BobkatLogoPresentation | undefined,
): BobkatLogoAsset {
  if (!presentation) return BOBKAT_IT_LOGO;
  return BOBKAT_LOGO_PRESENTATION[presentation].asset === "tight"
    ? BOBKAT_IT_LOGO_TIGHT
    : BOBKAT_IT_LOGO;
}

export function bobkatLogoDimensionsForHeight(
  height: number,
  asset: BobkatLogoAsset = BOBKAT_IT_LOGO,
): { width: number; height: number } {
  return {
    width: Math.round(height * asset.aspectRatio),
    height,
  };
}

export function bobkatLogoDimensionsForWidth(
  width: number,
  asset: BobkatLogoAsset = BOBKAT_IT_LOGO,
): { width: number; height: number } {
  return {
    width,
    height: Math.round(width / asset.aspectRatio),
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
