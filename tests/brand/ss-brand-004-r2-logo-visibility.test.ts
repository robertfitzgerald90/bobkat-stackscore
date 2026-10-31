import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BOBKAT_IT_LOGO,
  BOBKAT_IT_LOGO_TIGHT,
  BOBKAT_LOGO_PRESENTATION,
  bobkatLogoAssetForPresentation,
  bobkatLogoDimensionsForWidth,
  bobkatLogoSrc,
} from "@/lib/branding/assets";

const ROOT = process.cwd();

describe("SS-BRAND-004-R2 logo visibility", () => {
  it("preserves the master transparent asset and ships a tight crop derivative", () => {
    expect(existsSync(path.join(ROOT, "public/branding/bkit-logo.png"))).toBe(true);
    expect(existsSync(path.join(ROOT, "public/branding/bkit-logo-tight.png"))).toBe(true);
    expect(BOBKAT_IT_LOGO.src).toBe("/branding/bkit-logo.png");
    expect(BOBKAT_IT_LOGO_TIGHT.src).toBe("/branding/bkit-logo-tight.png");
    expect(BOBKAT_IT_LOGO_TIGHT.derivedFrom).toBe("bkit-logo.png");
    expect(BOBKAT_IT_LOGO.visibleBounds.widthFraction).toBeLessThan(0.6);
  });

  it("sizes hero and authentication presentations to visible artwork targets", () => {
    expect(BOBKAT_LOGO_PRESENTATION.hero.widthDesktop).toBeGreaterThanOrEqual(100);
    expect(BOBKAT_LOGO_PRESENTATION.hero.widthDesktop).toBeLessThanOrEqual(120);
    expect(BOBKAT_LOGO_PRESENTATION.hero.widthMobile).toBeGreaterThanOrEqual(80);
    expect(BOBKAT_LOGO_PRESENTATION.hero.widthMobile).toBeLessThanOrEqual(95);

    expect(BOBKAT_LOGO_PRESENTATION.authentication.widthDesktop).toBeGreaterThanOrEqual(110);
    expect(BOBKAT_LOGO_PRESENTATION.authentication.widthDesktop).toBeLessThanOrEqual(120);
    expect(BOBKAT_LOGO_PRESENTATION.authentication.widthMobile).toBeGreaterThanOrEqual(85);
    expect(BOBKAT_LOGO_PRESENTATION.authentication.widthMobile).toBeLessThanOrEqual(95);

    const heroAsset = bobkatLogoAssetForPresentation("hero");
    expect(heroAsset.src).toBe(BOBKAT_IT_LOGO_TIGHT.src);
    const dims = bobkatLogoDimensionsForWidth(112, heroAsset);
    expect(dims.width).toBe(112);
    expect(dims.height).toBe(Math.round(112 / BOBKAT_IT_LOGO_TIGHT.aspectRatio));
  });

  it("keeps navigation on the compact full asset", () => {
    expect(bobkatLogoAssetForPresentation("navigation").src).toBe(BOBKAT_IT_LOGO.src);
    expect(bobkatLogoSrc()).toContain("/branding/bkit-logo.png");
  });

  it("wires landing hero and login authentication presentations", () => {
    const home = readFileSync(
      path.join(ROOT, "src/components/public/stackscore-gateway-home.tsx"),
      "utf8",
    );
    const login = readFileSync(path.join(ROOT, "src/app/login/page.tsx"), "utf8");
    expect(home).toContain('presentation="hero"');
    expect(home).toContain('presentation="navigation"');
    expect(home).toContain("Know your technology.");
    expect(login).toContain('presentation="authentication"');
  });
});
