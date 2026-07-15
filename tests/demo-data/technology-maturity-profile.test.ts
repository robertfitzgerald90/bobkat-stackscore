import { describe, expect, it } from "vitest";
import { technologyMaturityProfileDemoData } from "@/lib/demo-data/technology-maturity-profile";

describe("technology maturity profile demo data", () => {
  it("includes curated executive profile values for Pinnacle Engineering", () => {
    const data = technologyMaturityProfileDemoData;

    expect(data.score).toBe(53);
    expect(data.statusLabel).toBe("Critical");
    expect(data.criticalExposureCount).toBe(3);
    expect(data.showCriticalExposure).toBe(true);
    expect(data.pointsSincePreviousAssessment).toBe(16);
    expect(data.classificationBadges.map((badge) => badge.label)).toEqual([
      "Improve Cybersecurity",
      "Foundational",
      "Improving",
    ]);
    expect(data.organizationSummary).toContain("Pinnacle Engineering");
    expect(data.readOnly).toBe(true);
  });
});
