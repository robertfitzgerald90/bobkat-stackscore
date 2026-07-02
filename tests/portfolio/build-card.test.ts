import { describe, expect, it } from "vitest";
import { buildPortfolioClientCard } from "@/lib/portfolio/build-card";

describe("buildPortfolioClientCard", () => {
  const now = new Date("2026-06-30T12:00:00.000Z");

  it("builds card fields from profile and work signals", () => {
    const card = buildPortfolioClientCard({
      clientId: "client-1",
      companyName: "Acme Manufacturing",
      overallStackScore: 62,
      maturityTier: "developing",
      lastAssessedAt: new Date("2026-06-01T00:00:00.000Z"),
      nextRecommendedAssessmentAt: new Date("2027-06-01T00:00:00.000Z"),
      scoreTrend: [
        { date: "2026-01-01T00:00:00.000Z", score: 55 },
        { date: "2026-06-01T00:00:00.000Z", score: 62 },
      ],
      recommendations: [
        {
          id: "rec-1",
          priority: "critical",
          status: "open",
          estimatedImpactPoints: 8,
          businessImpact: "Risk of outage",
          title: "Fix backup gaps",
          categoryCode: "data_protection_recovery",
          categoryName: "Data Protection & Recovery",
          projectStatus: null,
        },
        {
          id: "rec-2",
          priority: "medium",
          status: "accepted",
          estimatedImpactPoints: 4,
          businessImpact: "Improve documentation",
          title: "Document network",
          categoryCode: "documentation_knowledge",
          categoryName: "Documentation & Knowledge",
          projectStatus: "proposed",
        },
      ],
      projects: [
        { status: "in_progress", completedAt: null },
        { status: "proposed", completedAt: null },
      ],
      draftAssessmentId: null,
      lastImprovementAt: new Date("2026-05-15T00:00:00.000Z"),
      now,
    });

    expect(card.currentStackScore).toBe(62);
    expect(card.maturityStatus).toBe("Developing");
    expect(card.openProjectsCount).toBe(2);
    expect(card.criticalRecommendationsCount).toBe(1);
    expect(card.immediateFocusCount).toBe(1);
    expect(card.readinessStatus).toBe("partial");
    expect(card.projectedStackScore).toBeGreaterThan(62);
    expect(card.recommendedSortScore).toBeGreaterThan(0);
    expect(card.scoreTrend).toHaveLength(2);
    expect(card.lastAssessmentDate).toBe("2026-06-01T00:00:00.000Z");
  });

  it("marks client healthy when no open work exists", () => {
    const card = buildPortfolioClientCard({
      clientId: "client-2",
      companyName: "Quiet Co",
      overallStackScore: 88,
      maturityTier: "mature",
      lastAssessedAt: new Date("2026-05-01T00:00:00.000Z"),
      nextRecommendedAssessmentAt: new Date("2027-05-01T00:00:00.000Z"),
      scoreTrend: [],
      recommendations: [],
      projects: [],
      draftAssessmentId: null,
      lastImprovementAt: null,
      now,
    });

    expect(card.readinessStatus).toBe("healthy");
    expect(card.immediateFocusCount).toBe(0);
    expect(card.projectedStackScore).toBeNull();
  });
});
