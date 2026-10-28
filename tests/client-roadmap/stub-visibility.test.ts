import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isStubRecommendationTemplate } from "@/lib/recommendations/stubs";
import { hasUnpublishedStubTitle } from "@/lib/recommendations/visibility";

/**
 * DEF-001 regression: client roadmap filtering must use initiative.title
 * (present on the view model) rather than recommendation.title (not selected).
 */
describe("client roadmap stub visibility (DEF-001)", () => {
  it("filters using initiative.title and template code gates", () => {
    const source = readFileSync(join(process.cwd(), "src/lib/client-roadmap/service.ts"), "utf8");
    expect(source).toContain("hasUnpublishedStubTitle(initiative.title)");
    expect(source).not.toContain("hasUnpublishedStubTitle(recommendation.title)");
    expect(source).toContain("isStubRecommendationTemplate(code)");
  });

  it("treats Improve titles and stub codes as unpublished for clients", () => {
    expect(hasUnpublishedStubTitle("Improve Identity Access")).toBe(true);
    expect(hasUnpublishedStubTitle("Centralize workforce identity and authentication")).toBe(
      false,
    );
    expect(isStubRecommendationTemplate("REC-TEST-STUB-001")).toBe(true);
    expect(isStubRecommendationTemplate("REC-IA-001")).toBe(false);
  });
});
