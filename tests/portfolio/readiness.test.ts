import { describe, expect, it } from "vitest";
import { evaluatePortfolioReadiness } from "@/lib/portfolio/readiness";

const baseInput = {
  openRecommendationsCount: 0,
  openProjectsCount: 0,
  activeProjectsCount: 0,
  proposedProjectsCount: 0,
  actionableRecommendationsCount: 0,
  blockedRecommendationsCount: 0,
  criticalRecommendationsCount: 0,
  highPriorityRecommendationsCount: 0,
  hasDraftAssessment: false,
  isReassessmentOverdue: false,
};

describe("evaluatePortfolioReadiness", () => {
  it("returns healthy when no open or urgent work exists", () => {
    expect(evaluatePortfolioReadiness(baseInput)).toBe("healthy");
  });

  it("returns ready when actionable work exists without blockers", () => {
    expect(
      evaluatePortfolioReadiness({
        ...baseInput,
        openProjectsCount: 1,
        activeProjectsCount: 1,
        openRecommendationsCount: 1,
        actionableRecommendationsCount: 1,
      }),
    ).toBe("ready");
  });

  it("returns partial when actionable and blocked work coexist", () => {
    expect(
      evaluatePortfolioReadiness({
        ...baseInput,
        openProjectsCount: 2,
        activeProjectsCount: 1,
        proposedProjectsCount: 1,
        openRecommendationsCount: 2,
        actionableRecommendationsCount: 1,
        blockedRecommendationsCount: 1,
      }),
    ).toBe("partial");
  });

  it("returns blocked when open work exists but nothing is actionable", () => {
    expect(
      evaluatePortfolioReadiness({
        ...baseInput,
        openProjectsCount: 1,
        proposedProjectsCount: 1,
        openRecommendationsCount: 1,
        blockedRecommendationsCount: 1,
      }),
    ).toBe("blocked");
  });

  it("returns blocked for urgent signals without actionable work", () => {
    expect(
      evaluatePortfolioReadiness({
        ...baseInput,
        criticalRecommendationsCount: 2,
        highPriorityRecommendationsCount: 2,
      }),
    ).toBe("blocked");
  });
});
