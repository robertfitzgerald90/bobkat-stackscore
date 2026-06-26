import { describe, expect, it } from "vitest";
import {
  buildRoadmapPhaseViews,
  computeOverallProjectedScore,
} from "@/lib/technology-improvement-plan/roadmap";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";

const recommendations: TipRecommendationView[] = [
  {
    id: "rec-1",
    title: "Enable MFA",
    description: "Deploy MFA",
    businessImpact: "Reduce account takeover risk",
    priority: "critical",
    suggestedService: "MFA Deployment",
    estimatedImpactPoints: 8,
    categoryName: "Security",
    consultantNote: "",
    executiveNote: "",
    sortOrder: 0,
  },
  {
    id: "rec-2",
    title: "Backup validation",
    description: "Test restores",
    businessImpact: "Improve recovery confidence",
    priority: "high",
    suggestedService: "Backup & Disaster Recovery",
    estimatedImpactPoints: 6,
    categoryName: "Business Continuity",
    consultantNote: "",
    executiveNote: "",
    sortOrder: 1,
  },
];

describe("TIP roadmap", () => {
  it("projects cumulative scores by phase", () => {
    const phases = buildRoadmapPhaseViews(55, recommendations, [
      {
        id: "phase-1",
        label: "Phase 1",
        sortOrder: 0,
        recommendationIds: ["rec-1"],
      },
      {
        id: "phase-2",
        label: "Phase 2",
        sortOrder: 1,
        recommendationIds: ["rec-2"],
      },
    ]);

    expect(phases).toHaveLength(2);
    expect(phases[0].projectedScore).toBeGreaterThan(55);
    expect(phases[1].projectedScore).toBeGreaterThanOrEqual(phases[0].projectedScore);
  });

  it("computes overall projected score", () => {
    const projected = computeOverallProjectedScore(55, recommendations);
    expect(projected).toBeGreaterThan(55);
  });
});
