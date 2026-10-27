import { describe, expect, it } from "vitest";
import { calculateProjectedScore } from "@/lib/scoring";
import {
  computeEffectiveScoreJourney,
  computeImpactPoints,
  type ScoreImpactInput,
} from "@/lib/client-roadmap/effective-score";

describe("roadmap customer projection consistency (SS-REL-013)", () => {
  const baseline = 39;

  const deliverableInitiatives: ScoreImpactInput[] = [
    {
      id: "ia-1",
      title: "Require MFA",
      description: "",
      businessImpact: "",
      suggestedService: null,
      priority: "critical",
      estimatedImpactPoints: 10,
      categoryName: "Identity & Access",
      status: "open",
    },
    {
      id: "so-1",
      title: "Incident response",
      description: "",
      businessImpact: "",
      suggestedService: null,
      priority: "critical",
      estimatedImpactPoints: 10,
      categoryName: "Security Operations",
      status: "open",
    },
  ];

  it("does not inflate customer projected final with stub-inclusive stored ceiling", () => {
    const storedInflatedFinal = 100;
    const audienceProjectedFinal = calculateProjectedScore(baseline, [
      computeImpactPoints(deliverableInitiatives),
    ]);

    const journey = computeEffectiveScoreJourney(
      baseline,
      audienceProjectedFinal,
      deliverableInitiatives,
    );

    expect(audienceProjectedFinal).toBe(59);
    expect(journey.projectedFinalScore).toBe(59);
    expect(journey.projectedFinalScore).toBeLessThan(storedInflatedFinal);
  });

  it("keeps staff-style Math.max behavior when stored final matches visible set", () => {
    const impact = computeImpactPoints(deliverableInitiatives);
    const projected = calculateProjectedScore(baseline, [impact]);
    const journey = computeEffectiveScoreJourney(baseline, projected, deliverableInitiatives);
    expect(journey.projectedFinalScore).toBe(projected);
  });
});
