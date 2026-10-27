import { afterEach, describe, expect, it, vi } from "vitest";
import { CANONICAL_APP_ORIGIN } from "@/lib/url/base-url";

describe("email brand assets", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("defaults email asset base to the public production origin", async () => {
    vi.stubEnv("EMAIL_ASSET_BASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://staging.stackscore.tech");
    vi.stubEnv("AUTH_URL", "https://staging.stackscore.tech");
    const { getEmailAssetBaseUrl, getEmailAssetUrl, EMAIL_BRAND_ASSETS } = await import(
      "@/emails/assets"
    );
    expect(getEmailAssetBaseUrl()).toBe(CANONICAL_APP_ORIGIN);
    expect(getEmailAssetUrl("/branding/new-bobkat-it-logo.png")).toBe(
      `${CANONICAL_APP_ORIGIN}/branding/new-bobkat-it-logo.png`,
    );
    expect(EMAIL_BRAND_ASSETS.bobkatItLogo.startsWith("https://")).toBe(true);
    expect(EMAIL_BRAND_ASSETS.bobkatItLogo).toContain("/branding/new-bobkat-it-logo.png");
    expect(EMAIL_BRAND_ASSETS.bobkatItLogo).not.toContain("staging.stackscore.tech");
    expect(EMAIL_BRAND_ASSETS.bobkatItLogoAlt).toBe("Bobkat IT logo");
  });

  it("honors EMAIL_ASSET_BASE_URL when set", async () => {
    vi.stubEnv("EMAIL_ASSET_BASE_URL", "https://cdn.example.com/");
    const { getEmailAssetBaseUrl, getEmailAssetUrl } = await import("@/emails/assets");
    expect(getEmailAssetBaseUrl()).toBe("https://cdn.example.com");
    expect(getEmailAssetUrl("branding/logo.png")).toBe("https://cdn.example.com/branding/logo.png");
  });

  it("rewrites protected or relative logo URLs to a public absolute HTTPS URL", async () => {
    vi.stubEnv("EMAIL_ASSET_BASE_URL", "");
    const { resolvePublicEmailLogoUrl } = await import("@/emails/assets");
    expect(resolvePublicEmailLogoUrl("/branding/new-bobkat-it-logo.png?v=2026-07")).toBe(
      `${CANONICAL_APP_ORIGIN}/branding/new-bobkat-it-logo.png?v=2026-07`,
    );
    expect(
      resolvePublicEmailLogoUrl(
        "https://staging.stackscore.tech/branding/new-bobkat-it-logo.png?v=2026-07",
      ),
    ).toBe(`${CANONICAL_APP_ORIGIN}/branding/new-bobkat-it-logo.png?v=2026-07`);
    expect(
      resolvePublicEmailLogoUrl("https://stackscore.tech/branding/new-bobkat-it-logo.png"),
    ).toBe("https://stackscore.tech/branding/new-bobkat-it-logo.png");
  });

  it("normalizes legacy footer taglines to BUILD | IMPROVE | ADVISE", async () => {
    const { EMAIL_FOOTER_TAGLINE, normalizeEmailFooterTagline } = await import("@/emails/assets");
    expect(EMAIL_FOOTER_TAGLINE).toBe("BUILD | IMPROVE | ADVISE");
    expect(normalizeEmailFooterTagline("BUILD · ADVISE · STABILIZE")).toBe(EMAIL_FOOTER_TAGLINE);
    expect(normalizeEmailFooterTagline("BUILD | IMPROVE | ADVISE")).toBe(EMAIL_FOOTER_TAGLINE);
    expect(normalizeEmailFooterTagline("Custom tagline")).toBe("Custom tagline");
  });
});
