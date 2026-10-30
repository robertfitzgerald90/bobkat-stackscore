import { describe, expect, it } from "vitest";
import {
  formatMaturityScore,
  MATURITY_SCORE_UNAVAILABLE,
} from "@/lib/scoring/score-display";

describe("formatMaturityScore (SS-UX-018)", () => {
  it("formats ticket examples to nearest whole numbers", () => {
    expect(formatMaturityScore(51.43)).toBe("51");
    expect(formatMaturityScore(27.78)).toBe("28");
    expect(formatMaturityScore(38.89)).toBe("39");
    expect(formatMaturityScore(90.28)).toBe("90");
    expect(formatMaturityScore(36.36)).toBe("36");
    expect(formatMaturityScore(34.72)).toBe("35");
    expect(formatMaturityScore(8.06)).toBe("8");
    expect(formatMaturityScore(24.29)).toBe("24");
  });

  it("preserves whole numbers", () => {
    expect(formatMaturityScore(0)).toBe("0");
    expect(formatMaturityScore(1)).toBe("1");
    expect(formatMaturityScore(100)).toBe("100");
    expect(formatMaturityScore(74)).toBe("74");
  });

  it("rounds .5 half-up via Math.round", () => {
    expect(formatMaturityScore(0.5)).toBe("1");
    expect(formatMaturityScore(59.5)).toBe("60");
    expect(formatMaturityScore(99.5)).toBe("100");
  });

  it("handles null and undefined without coercing to zero", () => {
    expect(formatMaturityScore(null)).toBe(MATURITY_SCORE_UNAVAILABLE);
    expect(formatMaturityScore(undefined)).toBe(MATURITY_SCORE_UNAVAILABLE);
    expect(formatMaturityScore(null, "N/A")).toBe("N/A");
  });

  it("rejects invalid numeric values", () => {
    expect(formatMaturityScore(Number.NaN)).toBe(MATURITY_SCORE_UNAVAILABLE);
    expect(formatMaturityScore(Number.POSITIVE_INFINITY)).toBe(MATURITY_SCORE_UNAVAILABLE);
    expect(formatMaturityScore(Number.NEGATIVE_INFINITY)).toBe(MATURITY_SCORE_UNAVAILABLE);
  });

  it("clamps presentation only — does not mutate the input object", () => {
    const raw = { percentScore: 51.43 };
    expect(formatMaturityScore(raw.percentScore)).toBe("51");
    expect(raw.percentScore).toBe(51.43);
  });
});
