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
