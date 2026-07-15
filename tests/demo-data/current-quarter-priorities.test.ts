import { describe, expect, it } from "vitest";
import { currentQuarterPrioritiesDemoData } from "@/lib/demo-data/current-quarter-priorities";

describe("current quarter priorities demo data", () => {
  it("includes seven critical Pinnacle Engineering priorities", () => {
    expect(currentQuarterPrioritiesDemoData).toHaveLength(7);
    expect(currentQuarterPrioritiesDemoData.every((item) => item.severity === "critical")).toBe(true);
    expect(currentQuarterPrioritiesDemoData[0]?.title).toBe("Standardize patch-management policies");
    expect(currentQuarterPrioritiesDemoData.at(-1)?.title).toBe(
      "Implement centralized endpoint management",
    );
  });
});
