import type { Metadata } from "next";

/** Bump when replacing OG bytes under the same public path. */
export const SOCIAL_OG_ASSET_VERSION = "web-og-002-v1";

export const SOCIAL_OG_WIDTH = 1200;
export const SOCIAL_OG_HEIGHT = 630;

/**
 * Approved Bobkat IT social artwork (WEB-OG-002), fitted to 1200×630 without stretching.
 * Source masters remain under docs/socials/.
 */
export const SOCIAL_OG_ASSETS = {
  bobkatDefault: {
    path: "/images/og/bobkat-social-default-og-1200x630-v1.png",
    alt: "Bobkat IT — Build. Improve. Advise.",
  },
  snapshot: {
    path: "/images/og/snapshot-social-preview-og-1200x630-v1.png",
    alt: "Free Technology Snapshot by Bobkat IT",
  },
  stackscoreDemo: {
    path: "/images/og/stackscore-demo-social-preview-og-1200x630-v1.png",
    alt: "StackScore Demo — technology intelligence in action",
  },
} as const;

export type SocialOgAssetKey = keyof typeof SOCIAL_OG_ASSETS;

export function socialOgImageUrl(key: SocialOgAssetKey): string {
  const { path } = SOCIAL_OG_ASSETS[key];
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${SOCIAL_OG_ASSET_VERSION}`;
}

export function socialOgImage(key: SocialOgAssetKey) {
  const asset = SOCIAL_OG_ASSETS[key];
  return {
    url: socialOgImageUrl(key),
    width: SOCIAL_OG_WIDTH,
    height: SOCIAL_OG_HEIGHT,
    alt: asset.alt,
  } as const;
}

type SocialPageMetaInput = {
  title: string;
  description: string;
  path: string;
  image: SocialOgAssetKey;
  siteName?: string;
  robots?: Metadata["robots"];
};

/**
 * Shared Open Graph + Twitter card fields for public marketing routes.
 * Relative `url` / image paths resolve via root `metadataBase`.
 */
export function buildSocialPageMetadata({
  title,
  description,
  path,
  image,
  siteName = "StackScore",
  robots,
}: SocialPageMetaInput): Metadata {
  const ogImage = socialOgImage(image);

  return {
    // Absolute so root `title.template` does not append "| StackScore" twice.
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    ...(robots ? { robots } : {}),
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      siteName,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
