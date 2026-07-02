import { describe, expect, it } from "vitest";
import { sortPortfolioClients } from "@/lib/portfolio/sort-clients";
import type { PortfolioClientCard } from "@/lib/portfolio/types";

function card(overrides: Partial<PortfolioClientCard> & Pick<PortfolioClientCard, "clientId" | "companyName">): PortfolioClientCard {
  return {
    currentStackScore: 70,
    projectedStackScore: 80,
    maturityStatus: "Developing",
    maturityTier: "developing",
    scoreTrend: [],
    openProjectsCount: 0,
    criticalRecommendationsCount: 0,
    immediateFocusCount: 0,
    readinessStatus: "healthy",
    lastAssessmentDate: "2026-06-01T00:00:00.000Z",
    recommendedSortScore: 50,
    ...overrides,
  };
}

describe("sortPortfolioClients", () => {
  const clients = [
    card({
      clientId: "a",
      companyName: "Alpha",
      recommendedSortScore: 40,
      readinessStatus: "healthy",
      criticalRecommendationsCount: 0,
      projectedStackScore: 75,
      currentStackScore: 70,
      lastAssessmentDate: "2026-01-01T00:00:00.000Z",
    }),
    card({
      clientId: "b",
      companyName: "Beta",
      recommendedSortScore: 90,
      readinessStatus: "blocked",
      criticalRecommendationsCount: 3,
      projectedStackScore: 95,
      currentStackScore: 60,
      lastAssessmentDate: "2026-06-15T00:00:00.000Z",
    }),
    card({
      clientId: "c",
      companyName: "Charlie",
      recommendedSortScore: 70,
      readinessStatus: "ready",
      criticalRecommendationsCount: 1,
      projectedStackScore: 91,
      currentStackScore: 55,
      lastAssessmentDate: "2026-03-01T00:00:00.000Z",
    }),
  ];

  it("sorts by recommended score by default", () => {
    const sorted = sortPortfolioClients(clients, "recommended");
    expect(sorted.map((row) => row.clientId)).toEqual(["b", "c", "a"]);
  });

  it("sorts by needs attention using readiness and critical counts", () => {
    const sorted = sortPortfolioClients(clients, "needs_attention");
    expect(sorted[0]?.clientId).toBe("b");
  });

  it("sorts by biggest projected opportunity", () => {
    const sorted = sortPortfolioClients(clients, "biggest_opportunity");
    expect(sorted[0]?.clientId).toBe("c");
  });

  it("sorts alphabetically", () => {
    const sorted = sortPortfolioClients(clients, "alphabetical");
    expect(sorted.map((row) => row.companyName)).toEqual(["Alpha", "Beta", "Charlie"]);
  });
});
