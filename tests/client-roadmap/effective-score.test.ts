import { describe, expect, it } from "vitest";
import { computeEffectiveScoreJourney } from "@/lib/client-roadmap/effective-score";
import type { ScoreImpactInput } from "@/lib/client-roadmap/effective-score";

function initiative(
  overrides: Partial<ScoreImpactInput> & Pick<ScoreImpactInput, "id" | "status" | "estimatedImpactPoints">,
): ScoreImpactInput {
  return {
    title: overrides.id,
    description: "desc",
    businessImpact: "impact",
    suggestedService: null,
    priority: "high",
    categoryName: "Security",
    ...overrides,
  };
}

describe("effective score journey", () => {
  it("keeps baseline unchanged and increases effective score when work completes", () => {
    const initiatives = [
      initiative({ id: "a", status: "completed", estimatedImpactPoints: 10 }),
      initiative({ id: "b", status: "open", estimatedImpactPoints: 8 }),
    ];

    const journey = computeEffectiveScoreJourney(60, 78, initiatives);

    expect(journey.baselineScore).toBe(60);
    expect(journey.completedImprovement).toBeGreaterThan(0);
    expect(journey.effectiveScore).toBeGreaterThan(60);
    expect(journey.effectiveScore).toBeLessThanOrEqual(journey.projectedFinalScore);
    expect(journey.remainingOpportunity).toBeGreaterThanOrEqual(0);
  });

  it("does not credit deferred or declined work as completed improvement", () => {
    const journey = computeEffectiveScoreJourney(55, 70, [
      initiative({ id: "a", status: "deferred", estimatedImpactPoints: 12 }),
      initiative({ id: "b", status: "declined", estimatedImpactPoints: 12 }),
    ]);

    expect(journey.completedImprovement).toBe(0);
    expect(journey.effectiveScore).toBe(55);
  });
});
