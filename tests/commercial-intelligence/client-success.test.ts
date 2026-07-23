import { describe, expect, it } from "vitest";
import {
  buildClientSuccessMetrics,
  getProposalPhaseSortOrder,
} from "@/lib/commercial-intelligence/client-success";

describe("commercial insights client success", () => {
  it("ignores initiatives with missing recommendations", () => {
    const metrics = buildClientSuccessMetrics(
      {
        id: "client-1",
        companyName: "Acme Corp",
        scoreHistory: [],
        clientRoadmaps: [
          {
            phases: [
              {
                status: "in_progress",
                oneTimeInvestment: 1000,
                monthlyRecurringInvestment: 0,
                name: "Phase 1",
                sortOrder: 0,
                initiatives: [
                  {
                    recommendationId: "rec-missing",
                    estimatedImpactPoints: 5,
                    recommendation: null,
                  },
                  {
                    recommendationId: "rec-1",
                    estimatedImpactPoints: 8,
                    recommendation: {
                      status: "open",
                      estimatedImpactPoints: 8,
                      title: "Enable MFA",
                      description: "Add MFA",
                      businessImpact: "Reduce account takeover risk",
                      priority: "high",
                      category: { name: "Security" },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      [{ clientId: "client-1" }],
    );

    expect(metrics.clientName).toBe("Acme Corp");
    expect(metrics.roadmapCompletionPercent).toBe(0);
    expect(metrics.serviceAdoptionCount).toBe(1);
    expect(metrics.overallOutcomeScore).toBeGreaterThan(0);
  });

  it("handles clients with no roadmap data", () => {
    const metrics = buildClientSuccessMetrics(
      {
        id: "client-empty",
        companyName: "Empty Co",
        scoreHistory: [],
        clientRoadmaps: [],
      },
      [],
    );

    expect(metrics.roadmapCompletionPercent).toBe(0);
    expect(metrics.technologyScoreGrowth).toBeNull();
    expect(metrics.overallOutcomeScore).toBeGreaterThanOrEqual(0);
  });
});

describe("proposal phase sort order", () => {
  it("returns null when phase relation is missing", () => {
    expect(getProposalPhaseSortOrder({ phase: null })).toBeNull();
    expect(getProposalPhaseSortOrder({ phase: { sortOrder: 2 } })).toBe(2);
  });
});
