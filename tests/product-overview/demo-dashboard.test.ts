import { describe, expect, it } from "vitest";
import { northstarDemoDashboard } from "@/lib/product-overview/demo-dashboard";

describe("product overview demo dashboard", () => {
  it("uses the Northstar Manufacturing demo organization", () => {
    expect(northstarDemoDashboard.organization.name).toBe("Northstar Manufacturing");
    expect(northstarDemoDashboard.organization.employeeCount).toBe(85);
  });

  it("includes the Phase 1 dashboard metrics", () => {
    expect(northstarDemoDashboard.technologyScore.score).toBe(68);
    expect(northstarDemoDashboard.metrics.openRecommendations).toBe(14);
    expect(northstarDemoDashboard.metrics.activeProjects).toBe(4);
    expect(northstarDemoDashboard.metrics.roadmapCompletionPercent).toBe(42);
    expect(northstarDemoDashboard.quarterlyReview.nextReviewDate).toBe("September 15, 2026");
    expect(northstarDemoDashboard.budget.planned).toBe(118_000);
    expect(northstarDemoDashboard.budget.approved).toBe(72_000);
    expect(northstarDemoDashboard.technologyScore.projectedScore).toBe(82);
  });

  it("defines eight technology pillars", () => {
    expect(northstarDemoDashboard.pillars).toHaveLength(8);
    expect(northstarDemoDashboard.pillars.some((pillar) => pillar.name === "Cybersecurity")).toBe(true);
  });

  it("defines four active projects", () => {
    expect(northstarDemoDashboard.projects).toHaveLength(4);
  });
});
