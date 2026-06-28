import { describe, expect, it } from "vitest";
import { getReportTypeMeta } from "@/lib/reports/meta";
import { REPORT_PRINT_ROOT_CLASS } from "@/lib/reports/types";

describe("unified reporting framework", () => {
  it("defines metadata for all major report types", () => {
    const types = [
      "assessment",
      "technology_improvement_plan",
      "technology_progress",
      "technology_completion",
      "quarterly_business_review",
      "assessment_comparison",
    ] as const;

    for (const type of types) {
      const meta = getReportTypeMeta(type);
      expect(meta.title.length).toBeGreaterThan(0);
      expect(meta.subtitle.length).toBeGreaterThan(0);
      expect(["prepared", "generated"]).toContain(meta.attribution);
    }
  });

  it("uses a single print root class", () => {
    expect(REPORT_PRINT_ROOT_CLASS).toBe("stackscore-report");
  });
});
