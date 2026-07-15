import { describe, expect, it } from "vitest";
import { assessmentExecutiveOverviewDemoData } from "@/lib/demo-data/assessment-executive-overview";

describe("assessment executive overview preview", () => {
  it("includes Pinnacle Engineering demo metrics", () => {
    expect(assessmentExecutiveOverviewDemoData.organizationName).toBe("Pinnacle Engineering");
    expect(assessmentExecutiveOverviewDemoData.stackScore).toBe(53);
    expect(assessmentExecutiveOverviewDemoData.focusItems).toHaveLength(5);
    expect(assessmentExecutiveOverviewDemoData.criticalExposureCount).toBe(7);
  });
});
