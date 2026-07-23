import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { readAssessmentOfferAttribution } from "@/lib/assessment-offer/attribution";
import {
  ASSESSMENT_CHECKOUT_SERVICE,
  buildAssessmentCheckoutMetadata,
} from "@/lib/stripe/assessment-checkout";
import { TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE } from "@/lib/stripe/products";

describe("assessment pre-purchase funnel", () => {
  it("keeps assessment-offer and assessment-invitation publicly routable", () => {
    const authConfig = readFileSync(
      resolve(process.cwd(), "src/lib/auth/auth.config.ts"),
      "utf8",
    );

    expect(authConfig).toContain('pathname.startsWith("/assessment-offer")');
    expect(authConfig).toContain('pathname.startsWith("/assessment-invitation")');
    expect(authConfig).not.toContain('pathname.startsWith("/services")');
    expect(authConfig).not.toContain('pathname.startsWith("/solutions")');
  });

  it("does not redirect assessment routes in next.config", () => {
    const nextConfig = readFileSync(resolve(process.cwd(), "next.config.ts"), "utf8");
    expect(nextConfig).toContain('source: "/services"');
    expect(nextConfig).toContain('source: "/solutions"');
    expect(nextConfig).not.toContain("/assessment-offer");
    expect(nextConfig).not.toContain("/assessment-invitation");
  });

  it("preserves invitation query parameters on assessment-offer attribution", () => {
    const attribution = readAssessmentOfferAttribution({
      prospectId: "prospect-123",
      campaignId: "campaign-456",
      source: "bobkat_it_website",
    });

    expect(attribution).toEqual({
      prospectId: "prospect-123",
      campaignId: "campaign-456",
      source: "bobkat_it_website",
    });
  });

  it("builds assessment checkout metadata distinct from vCIO subscriptions", () => {
    const metadata = buildAssessmentCheckoutMetadata({
      source: "bobkat_it_website",
      prospectId: "prospect-123",
      campaignId: "campaign-456",
    });

    expect(metadata.productType).toBe(TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE);
    expect(metadata.service).toBe(ASSESSMENT_CHECKOUT_SERVICE);
    expect(metadata.platform).toBe("stackscore");
    expect(metadata.source).toBe("bobkat_it_website");
    expect(metadata.prospectId).toBe("prospect-123");
    expect(metadata.campaignId).toBe("campaign-456");
  });

  it("marks assessment-invitation as noindex", () => {
    const invitationPage = readFileSync(
      resolve(process.cwd(), "src/app/assessment-invitation/page.tsx"),
      "utf8",
    );
    expect(invitationPage).toContain("index: false");
  });

  it("keeps assessment-offer indexable", () => {
    const offerPage = readFileSync(
      resolve(process.cwd(), "src/app/assessment-offer/page.tsx"),
      "utf8",
    );
    expect(offerPage).toContain("index: true");
  });
});
