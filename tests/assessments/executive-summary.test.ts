import { describe, expect, it } from "vitest";
import { buildAssessmentExecutiveSummary } from "@/lib/assessments/executive-summary";

const baseInput = {
  clientName: "Acme Corp",
  overallScore: 42,
  overallRatingLabel: "Critical",
  hasCriticalExposure: true,
  strengths: ["Identity & Access", "Productivity & Collaboration"],
  risks: ["Endpoint Management", "Data Protection & Recovery", "Technology Strategy"],
  topRecommendations: [
    { title: "Is network documentation current", priority: "critical" as const },
    { title: "Are retention requirements documented", priority: "high" as const },
    { title: "Is there a technology vision", priority: "medium" as const },
  ],
  projectedScore: 100,
};

describe("buildAssessmentExecutiveSummary", () => {
  it("generates structured paragraphs instead of label dumps", () => {
    const summary = buildAssessmentExecutiveSummary(baseInput);
    const paragraphs = summary.split("\n\n");

    expect(paragraphs.length).toBeGreaterThanOrEqual(5);
    expect(summary).not.toMatch(/Top strengths:/i);
    expect(summary).not.toMatch(/Top risks:/i);
    expect(summary).not.toMatch(/Recommended next actions:/i);
    expect(summary).not.toMatch(/Overall StackScore: 42 \/ 100/i);
  });

  it("references technology health and maturity language", () => {
    const summary = buildAssessmentExecutiveSummary(baseInput);

    expect(summary).toContain("Acme Corp's organization");
    expect(summary).toContain("developing level of technology health");
    expect(summary).toContain("StackScore of 42");
    expect(summary).toContain("critical range");
  });

  it("mentions strongest and highest-risk pillars in prose", () => {
    const summary = buildAssessmentExecutiveSummary(baseInput);

    expect(summary).toContain("Identity & Access");
    expect(summary).toContain("Productivity & Collaboration");
    expect(summary).toContain("Endpoint Management");
    expect(summary).toContain("Data Protection & Recovery");
    expect(summary).toContain("critical security or recovery gaps");
  });

  it("summarizes recommendations in natural language", () => {
    const summary = buildAssessmentExecutiveSummary(baseInput);

    expect(summary).toContain("Near-term priorities should focus on");
    expect(summary).toContain("network documentation current");
    expect(summary).toContain("retention requirements documented");
  });

  it("explains projected improvement", () => {
    const summary = buildAssessmentExecutiveSummary(baseInput);

    expect(summary).toContain("improve from 42 to 100");
    expect(summary).toContain("gain of 58 points");
    expect(summary).toContain("80+ maturity threshold");
  });

  it("ends with the strategy session paragraph", () => {
    const summary = buildAssessmentExecutiveSummary(baseInput);

    expect(summary).toContain("Technology Assessment Strategy Session");
    expect(summary).toMatch(/forms the basis of your upcoming/i);
  });

  it("handles missing strengths gracefully", () => {
    const summary = buildAssessmentExecutiveSummary({
      ...baseInput,
      strengths: [],
      hasCriticalExposure: false,
    });

    expect(summary).not.toContain("Relative strengths appear");
    expect(summary).toContain("Endpoint Management");
  });

  it("handles flat projected score without numeric gain language", () => {
    const summary = buildAssessmentExecutiveSummary({
      ...baseInput,
      projectedScore: 42,
    });

    expect(summary).toContain("sustain current maturity levels");
    expect(summary).not.toContain("gain of 0 points");
  });
});
