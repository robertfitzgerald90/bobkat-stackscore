import { describe, expect, it } from "vitest";
import { northstarDemoDashboard } from "@/lib/product-overview/demo-dashboard";
import {
  DEMO_BUDGET_PERIODS,
  DEMO_BUSINESS_OUTCOME_KPIS,
  DEMO_EXECUTIVE_REPORTS,
  DEMO_EXECUTIVE_REVIEW,
  PLATFORM_MAP_STEPS,
  getDemoReportPreviewById,
} from "@/lib/product-overview/demo-execution";
import {
  DEMO_RECOMMENDATIONS,
  DEMO_ROADMAP_INITIATIVES,
  JOURNEY_STAGES,
  getDemoRecommendationById,
} from "@/lib/product-overview/demo-strategy";
import { PRODUCT_OVERVIEW_NAV_ITEMS } from "@/lib/product-overview/navigation";

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

  it("defines eight technology pillars with extended assessment fields", () => {
    expect(northstarDemoDashboard.pillars).toHaveLength(8);
    expect(northstarDemoDashboard.pillars.some((pillar) => pillar.name === "Cybersecurity")).toBe(true);
    expect(northstarDemoDashboard.pillars[0]?.keyFinding).toBeTruthy();
    expect(northstarDemoDashboard.pillars[0]?.linkedRecommendationId).toBeTruthy();
  });

  it("defines four active projects with Phase 3 execution fields", () => {
    expect(northstarDemoDashboard.projects).toHaveLength(4);
    expect(northstarDemoDashboard.projects[0]?.timelinePhases.length).toBeGreaterThan(0);
    expect(northstarDemoDashboard.projects[0]?.relatedRecommendationId).toBeTruthy();
    expect(northstarDemoDashboard.projects.some((p) => p.title === "Disaster Recovery Validation")).toBe(true);
  });

  it("includes extended quarterly review metrics", () => {
    expect(northstarDemoDashboard.quarterlyReview.currentScore).toBe(68);
    expect(northstarDemoDashboard.quarterlyReview.previousScore).toBe(62);
    expect(northstarDemoDashboard.quarterlyReview.budgetUtilizationPercent).toBe(61);
  });

  it("includes recommendations and roadmap initiatives for Phase 2", () => {
    expect(northstarDemoDashboard.recommendations.length).toBeGreaterThanOrEqual(5);
    expect(northstarDemoDashboard.roadmapInitiatives.length).toBeGreaterThanOrEqual(6);
    expect(DEMO_RECOMMENDATIONS.some((rec) => rec.title.includes("MFA"))).toBe(true);
    expect(DEMO_ROADMAP_INITIATIVES.some((item) => item.quarter === "Q4 2026")).toBe(true);
  });
});

describe("product overview strategy demo data", () => {
  it("defines six journey stages", () => {
    expect(JOURNEY_STAGES).toHaveLength(6);
    expect(JOURNEY_STAGES[0]?.label).toBe("Assess");
  });

  it("looks up recommendations by id", () => {
    expect(getDemoRecommendationById("rec-mfa")?.title).toContain("MFA");
  });

  it("maps Phase 2 and Phase 3 navigation sections", () => {
    expect(PRODUCT_OVERVIEW_NAV_ITEMS.filter((item) => item.phase === 2)).toHaveLength(3);
    expect(PRODUCT_OVERVIEW_NAV_ITEMS.filter((item) => item.phase === 3)).toHaveLength(4);
    expect(PRODUCT_OVERVIEW_NAV_ITEMS.find((item) => item.id === "projects")?.sectionId).toBe(
      "product-overview-projects",
    );
    expect(PRODUCT_OVERVIEW_NAV_ITEMS.find((item) => item.id === "reports")?.sectionId).toBe(
      "product-overview-reports",
    );
  });
});

describe("product overview execution demo data", () => {
  it("defines six executive reports with React previews", () => {
    expect(DEMO_EXECUTIVE_REPORTS).toHaveLength(6);
    expect(getDemoReportPreviewById("report-assessment")?.sections.length).toBeGreaterThan(0);
  });

  it("defines budget periods", () => {
    expect(DEMO_BUDGET_PERIODS).toHaveLength(3);
    expect(DEMO_BUDGET_PERIODS[0]?.categories).toHaveLength(6);
  });

  it("defines business outcome KPIs and executive review content", () => {
    expect(DEMO_BUSINESS_OUTCOME_KPIS.length).toBeGreaterThanOrEqual(8);
    expect(DEMO_EXECUTIVE_REVIEW.executiveRecommendations.length).toBeGreaterThan(0);
    expect(PLATFORM_MAP_STEPS).toHaveLength(8);
  });
});
