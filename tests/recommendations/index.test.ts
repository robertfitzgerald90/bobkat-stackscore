import { describe, expect, it } from "vitest";
import { evaluateTriggers } from "@/lib/recommendations";
import { calculateProjectionImpacts } from "@/lib/recommendations";

describe("recommendation engine", () => {
  it("returns empty array when no triggers match", () => {
    const result = evaluateTriggers([]);
    expect(result).toEqual([]);
  });

  it("calculates zero projection impact for empty recommendations", () => {
    expect(calculateProjectionImpacts([])).toBe(0);
  });
});
