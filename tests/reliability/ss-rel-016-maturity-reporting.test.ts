import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  countCustomerRecommendations,
  CUSTOMER_ACTIVE_OPPORTUNITY_STATUSES,
  getCustomerMaturityLabel,
  customerRoadmapProgressFootnote,
} from "@/lib/assessments/customer-reporting";
import { MEANINGFUL_STRENGTH_MIN_PERCENT } from "@/lib/assessments/customer-trust";
import { buildAssessmentResultsSummary } from "@/lib/assessments/results-summary";
import { buildAudienceAssessmentPresentation } from "@/lib/assessments/customer-facing-report";
import { TECHNOLOGY_MATURITY_LEVEL_LABELS } from "@/lib/scoring/v2/maturity-level";

describe("SS-REL-016 maturity and reporting consistency", () => {
  it("maps StackScore bands to DOC-119 customer maturity labels", () => {
    expect(getCustomerMaturityLabel(39)).toBe(TECHNOLOGY_MATURITY_LEVEL_LABELS.initial);
    expect(getCustomerMaturityLabel(42)).toBe(TECHNOLOGY_MATURITY_LEVEL_LABELS.basic);
    expect(getCustomerMaturityLabel(55)).toBe(TECHNOLOGY_MATURITY_LEVEL_LABELS.developing);
    expect(getCustomerMaturityLabel(72)).toBe(TECHNOLOGY_MATURITY_LEVEL_LABELS.managed);
    expect(getCustomerMaturityLabel(88)).toBe(TECHNOLOGY_MATURITY_LEVEL_LABELS.mature);
    expect(getCustomerMaturityLabel(96)).toBe(TECHNOLOGY_MATURITY_LEVEL_LABELS.optimized);
  });

  it("keeps demonstrated-strength floor aligned to DOC-119 Developing", () => {
    expect(MEANINGFUL_STRENGTH_MIN_PERCENT).toBe(55);
    expect(getCustomerMaturityLabel(MEANINGFUL_STRENGTH_MIN_PERCENT)).toBe("Developing");
  });

  it("separates open vs active opportunity recommendation counts", () => {
    const counts = countCustomerRecommendations([
      { status: "open" },
      { status: "accepted" },
      { status: "in_progress" },
      { status: "completed" },
      { status: "deferred" },
      { status: "declined" },
    ]);

    expect(CUSTOMER_ACTIVE_OPPORTUNITY_STATUSES).toEqual(["open", "accepted", "in_progress"]);
    expect(counts.open).toBe(1);
    expect(counts.accepted).toBe(1);
    expect(counts.inProgress).toBe(1);
    expect(counts.completed).toBe(1);
    expect(counts.activeOpportunities).toBe(3);
    expect(counts.identified).toBe(5); // excludes declined
    expect(counts.declined).toBe(1);
  });

  it("exposes DOC-119 maturity on results summary without removing Rating", () => {
    const summary = buildAssessmentResultsSummary(
      39,
      true,
      1,
      [
        {
          categoryId: "ia",
          percentScore: 72,
          rating: "stable",
          category: { name: "Identity & Access", code: "identity_access" },
        },
      ],
      [
        {
          id: "r1",
          title: "Require MFA",
          description: "d",
          businessImpact: "b",
          suggestedService: null,
          priority: "critical",
          status: "open",
          estimatedImpactPoints: 10,
          consolidationGroupId: null,
          categoryId: "ia",
          category: { name: "Identity & Access", code: "identity_access" },
          project: null,
        },
        {
          id: "r2",
          title: "Accepted item",
          description: "d",
          businessImpact: "b",
          suggestedService: null,
          priority: "high",
          status: "accepted",
          estimatedImpactPoints: 8,
          consolidationGroupId: null,
          categoryId: "ia",
          category: { name: "Identity & Access", code: "identity_access" },
          project: null,
        },
      ],
    );

    expect(summary.overallMaturityLabel).toBe("Initial");
    expect(summary.overallRatingLabel).toBe("Critical");
    expect(summary.openRecommendationsCount).toBe(1);
    expect(summary.activeImprovementOpportunityCount).toBe(2);
    expect(summary.recommendationCounts.activeOpportunities).toBe(2);
  });

  it("keeps customer narrative free of catalog projected maturity and Rating maturity wording", () => {
    const presentation = buildAudienceAssessmentPresentation({
      role: "client",
      clientName: "ABC LLC",
      overallScore: 39,
      hasCriticalExposure: true,
      criticalFindingsCount: 1,
      categoryScores: [
        {
          categoryId: "ia",
          percentScore: 72,
          rating: "stable",
          category: { name: "Identity & Access", code: "identity_access" },
        },
      ],
      recommendations: [
        {
          id: "r1",
          title: "Require multi-factor authentication for privileged and business-critical access",
          description: "d",
          businessImpact: "b",
          suggestedService: null,
          priority: "critical",
          status: "open",
          estimatedImpactPoints: 10,
          consolidationGroupId: null,
          categoryId: "ia",
          category: { name: "Identity & Access", code: "identity_access" },
          project: null,
          recommendationTemplate: { code: "REC-IA-002" },
        },
      ],
      storedExecutiveSummary: null,
    });

    expect(presentation.summary.overallMaturityLabel).toBe("Initial");
    expect(presentation.executiveSummary).toMatch(/initial level of technology maturity/i);
    expect(presentation.executiveSummary).not.toMatch(/critical range/i);
    expect(presentation.executiveSummary).not.toMatch(/improve from 39 to/);
  });

  it("documents roadmap progress as distinct from official StackScore", () => {
    const note = customerRoadmapProgressFootnote();
    expect(note).toContain("Roadmap progress");
    expect(note).toContain("Official StackScore");
    expect(note).toContain("reassessment");
  });

  it("wires customer dashboard away from Technology Health + Rating labels", () => {
    const dashboard = readFileSync(
      join(process.cwd(), "src/components/customer-portal/customer-executive-dashboard.tsx"),
      "utf8",
    );
    const hero = readFileSync(
      join(process.cwd(), "src/components/customer-portal/overview/overview-maturity-hero.tsx"),
      "utf8",
    );
    // Maturity hero owns StackScore customer terminology after SS-UX-004 decomposition.
    expect(hero).toContain("CUSTOMER_TERM_STACKSCORE");
    expect(hero).toContain("maturityLabel");
    expect(dashboard).toContain("OverviewMaturityHero");
    expect(dashboard).not.toContain('label="Technology Health"');
    expect(dashboard).not.toContain("RATING_LABELS[rating]");
    expect(hero).not.toContain('label="Technology Health"');
    expect(hero).not.toContain("RATING_LABELS[rating]");
  });
});
