import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BOBKAT_IT_LOGO, bobkatLogoSrc } from "@/lib/branding/assets";
import {
  CLIENT_SECTION_TITLE,
  CLIENT_SURFACE_CARD_INDUSTRIAL,
  clientSurfaceCardClass,
} from "@/lib/client-ui/tokens";
import {
  CUSTOMER_INDUSTRIAL_PANEL_CLASS,
  CUSTOMER_PORTAL_MAIN_CLASS,
  CUSTOMER_PORTAL_THEME_CLASS,
  isCustomerPortalThemeEnabled,
} from "@/lib/customer-portal/theme";
import { getCustomerSidebarNav } from "@/lib/navigation/sidebar-nav";

describe("SS-UX-003 customer portal visual foundation", () => {
  it("uses the authentic Bobkat IT rebrand logo asset", () => {
    expect(BOBKAT_IT_LOGO.src).toBe("/branding/new-bobkat-it-logo.png");
    expect(bobkatLogoSrc()).toContain("/branding/new-bobkat-it-logo.png");
    expect(existsSync(join(process.cwd(), "public", "branding", BOBKAT_IT_LOGO.fileName))).toBe(
      true,
    );
  });

  it("scopes the customer portal theme to client role only", () => {
    expect(isCustomerPortalThemeEnabled("client")).toBe(true);
    expect(isCustomerPortalThemeEnabled("admin")).toBe(false);
    expect(isCustomerPortalThemeEnabled("technician")).toBe(false);
    expect(CUSTOMER_PORTAL_THEME_CLASS).toBe("customer-portal");
    expect(CUSTOMER_PORTAL_MAIN_CLASS).toBe("customer-portal-main");
  });

  it("keeps industrial panel treatment opt-in", () => {
    expect(clientSurfaceCardClass("default")).not.toContain(CUSTOMER_INDUSTRIAL_PANEL_CLASS);
    expect(clientSurfaceCardClass("industrial")).toBe(CLIENT_SURFACE_CARD_INDUSTRIAL);
    expect(CLIENT_SURFACE_CARD_INDUSTRIAL).toContain(CUSTOMER_INDUSTRIAL_PANEL_CLASS);
  });

  it("uses bold section title tokens for customer hierarchy", () => {
    expect(CLIENT_SECTION_TITLE).toContain("font-bold");
  });

  it("preserves four-item customer navigation under the visual foundation", () => {
    expect(getCustomerSidebarNav("abc").map((item) => item.label)).toEqual([
      "Overview",
      "Explore",
      "Roadmap",
      "Reports",
    ]);
  });

  it("wires customer portal theme CSS and shell watermark", () => {
    const globals = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    const themeCss = readFileSync(
      join(process.cwd(), "src/styles/customer-portal-theme.css"),
      "utf8",
    );
    const shell = readFileSync(
      join(process.cwd(), "src/components/layout/dashboard-shell.tsx"),
      "utf8",
    );
    const watermark = readFileSync(
      join(process.cwd(), "src/components/customer-portal/customer-portal-watermark.tsx"),
      "utf8",
    );

    expect(globals).toContain('customer-portal-theme.css');
    expect(themeCss).toContain(".customer-portal");
    expect(themeCss).toContain(".customer-portal-watermark");
    expect(themeCss).toContain("--phosphor");
    expect(themeCss).toContain("justify-content: center");
    expect(themeCss).toContain("align-items: center");
    expect(themeCss).toContain("inset: 0");
    expect(themeCss).toContain("object-fit: contain");
    expect(themeCss).toMatch(/opacity:\s*0\.0[3-6]/);
    expect(themeCss).not.toContain("inset: auto 4% 6% auto");
    expect(shell).toContain("CUSTOMER_PORTAL_THEME_CLASS");
    expect(shell).toContain("CustomerPortalWatermark");
    expect(shell).toContain("customer-portal-content");
    expect(watermark).toContain("bobkatLogoSrc");
    expect(watermark).toContain('aria-hidden="true"');
    expect(watermark).toContain('alt=""');
    expect(watermark).toContain("object-contain");
  });

  it("does not apply customer theme class to staff shell paths", () => {
    const shell = readFileSync(
      join(process.cwd(), "src/components/layout/dashboard-shell.tsx"),
      "utf8",
    );
    expect(shell).toContain("isCustomerPortalThemeEnabled");
    expect(shell).toContain('data-portal={customerPortal ? "customer" : "staff"}');
  });
});
