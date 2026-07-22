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
  it("uses the official new Bobkat IT logo everywhere", () => {
    expect(BOBKAT_IT_LOGO.src).toBe("/branding/new-bobkat-it-logo.png");
    expect(bobkatLogoSrc()).toContain("/branding/new-bobkat-it-logo.png");
    expect(REPORT_TOKENS.logoPath).toContain("/branding/new-bobkat-it-logo.png");
    expect(EMAIL_BRAND_ASSETS.bobkatItLogo).toContain("/branding/new-bobkat-it-logo.png");
    expect(getPdfLogoPath()).toContain("new-bobkat-it-logo.png");
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
