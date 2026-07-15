import { describe, expect, it } from "vitest";
import { quarterlyReviewSummaryDemoData } from "@/lib/demo-data/quarterly-review-summary";

describe("quarterly review summary demo data", () => {
  it("uses chronologically consistent Q3 2026 review dates", () => {
    const data = quarterlyReviewSummaryDemoData;

    expect(data.currentQuarter).toBe("Q3 2026");
    expect(data.previousReviewDate).toBe("2026-06-30T00:00:00.000Z");
    expect(data.nextReviewDate).toBe("2026-09-30T00:00:00.000Z");
    expect(data.readOnly).toBe(true);
    expect(new Date(data.nextReviewDate!).getTime()).toBeGreaterThan(
      new Date(data.previousReviewDate!).getTime(),
    );
  });
});
