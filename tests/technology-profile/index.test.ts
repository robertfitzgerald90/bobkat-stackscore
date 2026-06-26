import { describe, expect, it } from "vitest";
import { computeJourneyProgress, deriveJourneyPhase } from "@/lib/technology-profile/journey";

describe("technology profile journey", () => {
  it("starts in assess phase with no completed assessments", () => {
    expect(
      deriveJourneyPhase({
        assessmentsCompleted: 0,
        openRecommendations: 0,
        activeProjects: 0,
        completedProjects: 0,
        scoreDelta: null,
      }),
    ).toBe("assess");
  });

  it("enters improve phase when recommendations are open", () => {
    expect(
      deriveJourneyPhase({
        assessmentsCompleted: 2,
        openRecommendations: 3,
        activeProjects: 0,
        completedProjects: 1,
        scoreDelta: 5,
      }),
    ).toBe("improve");
  });

  it("enters maintain phase when no open work remains", () => {
    const journey = computeJourneyProgress({
      assessmentsCompleted: 2,
      openRecommendations: 0,
      activeProjects: 0,
      completedProjects: 2,
      scoreDelta: 12,
    });

    expect(journey.phase).toBe("maintain");
    expect(journey.progressPercent).toBeGreaterThan(0);
  });
});
