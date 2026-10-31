import { describe, expect, it } from "vitest";
import {
  BOBKAT_IT_LOGO,
  bobkatLogoDimensionsForHeight,
  bobkatLogoSrc,
  publicAssetUrl,
} from "@/lib/branding/assets";
import { getPdfLogoPath } from "@/lib/pdf/shared/constants";
import { EMAIL_BRAND_ASSETS } from "@/emails/assets";
import { REPORT_TOKENS } from "@/lib/reports/tokens";

describe("Bobkat IT branding assets", () => {
  it("uses the authentic transparent Bobkat IT emblem everywhere", () => {
    expect(BOBKAT_IT_LOGO.src).toBe("/branding/bkit-logo.png");
    expect(bobkatLogoSrc()).toContain("/branding/bkit-logo.png");
    expect(REPORT_TOKENS.logoPath).toContain("/branding/bkit-logo.png");
    expect(EMAIL_BRAND_ASSETS.bobkatItLogo).toContain("/branding/bkit-logo.png");
    expect(EMAIL_BRAND_ASSETS.bobkatItLogo.startsWith("https://")).toBe(true);
    expect(EMAIL_BRAND_ASSETS.bobkatItLogo).not.toContain("staging.stackscore.tech");
    expect(EMAIL_BRAND_ASSETS.bobkatItLogoAlt).toBe("Bobkat IT logo");
    expect(getPdfLogoPath()).toContain("bkit-logo.png");
  });

  it("preserves logo aspect ratio when sizing", () => {
    const dimensions = bobkatLogoDimensionsForHeight(40);
    expect(dimensions.height).toBe(40);
    expect(dimensions.width).toBeGreaterThan(dimensions.height);
  });

  it("applies a central cache-busting version to public assets", () => {
    expect(publicAssetUrl("/solutions/Essentials Image.png")).toContain("?v=");
    expect(publicAssetUrl("/branding/new-bobkat-it-logo.png")).toContain("?v=");
  });
});
