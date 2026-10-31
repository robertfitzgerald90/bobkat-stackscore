import { describe, expect, it } from "vitest";
import {
  buildAssessmentExecutiveSummary,
  recommendationTopic,
} from "@/lib/assessments/executive-summary";

const baseInput = {
  clientName: "Acme Corp",
  overallScore: 42,
  overallRatingLabel: "Critical",
  hasCriticalExposure: true,
  strengths: ["Identity & Access", "Productivity & Collaboration"],
  risks: ["Endpoint Management", "Data Protection & Recovery", "Technology Strategy"],
  topRecommendations: [
    {
      title: "Establish a practical incident response process",
      priority: "critical" as const,
    },
    {
      title: "Require multi-factor authentication for privileged and business-critical access",
      priority: "high" as const,
    },
    {
      title: "Centralize workforce identity and authentication",
      priority: "medium" as const,
    },
  ],
  projectedScore: 62,
};

describe("recommendationTopic", () => {
  it("rejects unfinished stub titles and raw question stems", () => {
    expect(recommendationTopic("Improve Endpoint Management: Is there an inventory")).toBeNull();
    expect(recommendationTopic("Is network documentation current")).toBeNull();
    expect(recommendationTopic("Are retention requirements documented")).toBeNull();
  });

  it("keeps professional recommendation titles", () => {
    expect(recommendationTopic("Establish a practical incident response process")).toContain(
      "establish a practical incident response process",
    );
  });
});

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

  it("uses DOC-119 maturity language without conflicting rating bands", () => {
    const summary = buildAssessmentExecutiveSummary(baseInput);

    expect(summary).toContain("Acme Corp currently reflects a basic level of technology maturity");
    expect(summary).toContain("StackScore of 42");
    expect(summary).not.toMatch(/critical range/i);
    expect(summary).not.toContain("Acme Corp's organization");
  });

  it("uses an indefinite article before vowel-initial maturity labels", () => {
    const summary = buildAssessmentExecutiveSummary({
      ...baseInput,
      overallScore: 39,
      overallRatingLabel: "Critical",
      projectedScore: 59,
    });

    expect(summary).toContain(
      "Acme Corp currently reflects an initial level of technology maturity",
    );
    expect(summary).not.toMatch(/\ba initial level\b/i);
  });

  it("mentions strongest and highest-risk pillars in prose", () => {
    const summary = buildAssessmentExecutiveSummary(baseInput);

    expect(summary).toContain("Identity & Access");
    expect(summary).toContain("Productivity & Collaboration");
    expect(summary).toContain("Endpoint Management");
    expect(summary).toContain("Data Protection & Recovery");
    expect(summary).toContain("critical security or recovery gaps");
  });

  it("summarizes recommendations in professional language", () => {
    const summary = buildAssessmentExecutiveSummary(baseInput);

    expect(summary).toContain("Near-term priorities should focus on");
    expect(summary).toContain("establish a practical incident response process");
    expect(summary).toContain("practical starting point for remediation planning");
    expect(summary).not.toContain("strongest maturity gains first");
  });

  it("explains projected improvement without guaranteeing outcomes", () => {
    const summary = buildAssessmentExecutiveSummary(baseInput);

    expect(summary).toContain("improve from 42 to 62");
    expect(summary).toContain("potential gain of 20 points");
    expect(summary).toContain("additional approved initiatives would be required");
    expect(summary).not.toContain("80+ maturity threshold");
    expect(summary).not.toContain("guaranteed");
  });

  it("omits catalog projected maturity figures for customer surfaces (SS-REL-015)", () => {
    const summary = buildAssessmentExecutiveSummary({
      ...baseInput,
      includeCatalogProjectedMaturity: false,
    });

    expect(summary).not.toContain("improve from 42 to 62");
    expect(summary).not.toContain("potential gain of 20 points");
    expect(summary).toContain("confirmed through reassessment");
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

  it("omits stub recommendation titles from narrative priorities", () => {
    const summary = buildAssessmentExecutiveSummary({
      ...baseInput,
      topRecommendations: [
        {
          title: "Improve Documentation & Knowledge: Are credentials securely managed",
          priority: "critical",
        },
        {
          title: "Establish a practical incident response process",
          priority: "critical",
        },
      ],
    });

    expect(summary).not.toContain("credentials securely managed");
    expect(summary).toContain("establish a practical incident response process");
  });
});
