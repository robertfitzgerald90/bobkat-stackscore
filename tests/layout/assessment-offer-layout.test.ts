import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("assessment offer landing page", () => {
  it("includes premium landing sections and hero headline", () => {
    const landing = readFileSync(
      resolve(process.cwd(), "src/components/assessment-offer/assessment-offer-landing.tsx"),
      "utf8",
    );
    const hero = readFileSync(
      resolve(process.cwd(), "src/components/assessment-offer/offer-hero.tsx"),
      "utf8",
    );

    expect(landing).toContain("AssessmentOfferShowcase");
    expect(landing).toContain("OfferFeatures");
    expect(landing).toContain("OfferTimeline");
    expect(landing).toContain("OfferWhy");
    expect(landing).toContain("OfferFinalCta");
    expect(hero).toContain("Know Exactly Where Your Technology Stands");
    expect(hero).toContain("Start My Assessment");
    expect(hero).toContain("AssessmentExecutiveOverviewPreview");
    expect(hero).not.toContain("OFFER_HERO_SCREENSHOT");
  });

  it("uses live technology progress preview in measurable progress section", () => {
    const showcase = readFileSync(
      resolve(process.cwd(), "src/components/assessment-offer/assessment-feature-showcase.tsx"),
      "utf8",
    );
    const content = readFileSync(
      resolve(process.cwd(), "src/lib/assessment-offer/content.ts"),
      "utf8",
    );

    expect(content).toContain('preview: "technology-progress"');
    expect(showcase).toContain("TechnologyProgressPreview");
    expect(showcase).toContain("lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]");
  });

  it("uses live technology maturity profile preview in executive visibility section", () => {
    const showcase = readFileSync(
      resolve(process.cwd(), "src/components/assessment-offer/assessment-feature-showcase.tsx"),
      "utf8",
    );
    const content = readFileSync(
      resolve(process.cwd(), "src/lib/assessment-offer/content.ts"),
      "utf8",
    );

    expect(content).toContain('preview: "technology-maturity-profile"');
    expect(content).toContain('layout: "feature-split"');
    expect(showcase).toContain("TechnologyMaturityProfilePreview");
    expect(showcase).toContain("lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]");
  });

  it("uses responsive layout utilities", () => {
    const hero = readFileSync(
      resolve(process.cwd(), "src/components/assessment-offer/offer-hero.tsx"),
      "utf8",
    );

    expect(hero).toContain("max-w-7xl");
    expect(hero).toContain("text-balance");
  });
});
