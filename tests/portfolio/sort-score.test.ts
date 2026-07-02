import { describe, expect, it } from "vitest";
import { calculateRecommendedSortScore } from "@/lib/portfolio/sort-score";

describe("calculateRecommendedSortScore", () => {
  it("ranks blocked clients above healthy clients", () => {
    const blocked = calculateRecommendedSortScore({
      readinessStatus: "blocked",
      criticalRecommendationsCount: 0,
      projectedImprovement: null,
      openProjectsCount: 0,
      daysSinceLastAssessment: 30,
      daysSinceLastImprovement: 30,
    });

    const healthy = calculateRecommendedSortScore({
      readinessStatus: "healthy",
      criticalRecommendationsCount: 0,
      projectedImprovement: null,
      openProjectsCount: 0,
      daysSinceLastAssessment: 30,
      daysSinceLastImprovement: 30,
    });

    expect(blocked).toBeGreaterThan(healthy);
  });

  it("increases score for critical recommendations and projected improvement", () => {
    const baseline = calculateRecommendedSortScore({
      readinessStatus: "ready",
      criticalRecommendationsCount: 0,
      projectedImprovement: 0,
      openProjectsCount: 0,
      daysSinceLastAssessment: 0,
      daysSinceLastImprovement: 0,
    });

    const elevated = calculateRecommendedSortScore({
      readinessStatus: "ready",
      criticalRecommendationsCount: 2,
      projectedImprovement: 10,
      openProjectsCount: 2,
      daysSinceLastAssessment: 60,
      daysSinceLastImprovement: 90,
    });

    expect(elevated).toBeGreaterThan(baseline);
  });
});
