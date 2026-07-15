import { describe, expect, it } from "vitest";
import { technologyProgressSummaryDemoData } from "@/lib/demo-data/technology-progress-summary";

describe("technology progress summary demo data", () => {
  it("includes curated Pinnacle Engineering journey metrics", () => {
    const data = technologyProgressSummaryDemoData;

    expect(data.stage).toBe("Improve");
    expect(data.milestonePercent).toBe(33);
    expect(data.initialScore).toBe(37);
    expect(data.currentScore).toBe(53);
    expect(data.projectedScore).toBe(84);
    expect(data.targetScore).toBe(84);
    expect(data.pointsImproved).toBe(16);
    expect(data.assessmentCount).toBe(2);
    expect(data.openRecommendationCount).toBe(7);
    expect(data.activeProjectCount).toBe(4);
    expect(data.completedCount).toBe(0);
    expect(data.readOnly).toBe(true);
  });
});
