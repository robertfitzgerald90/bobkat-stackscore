import { describe, expect, it } from "vitest";
import { parseStoredProfileCategoryScores } from "@/lib/technology-profile/category-scores";
import type { PillarScoreSnapshot } from "@/lib/scoring/v2";

const v1CategoryScores = [
  {
    categoryId: "1",
    categoryCode: "security",
    categoryName: "Security",
    pointsEarned: 8,
    pointsPossible: 10,
    percentScore: 80,
    rating: "strong" as const,
    weightedContribution: 0,
  },
];

describe("parseStoredProfileCategoryScores", () => {
  it("parses v2 pillar snapshot payloads", () => {
    const pillarSnapshots: PillarScoreSnapshot[] = [
      {
        pillarCode: "identity_access",
        pillarName: "Identity & Access",
        businessQuestion: "Question",
        percentScore: 75,
        maturityLevelLabel: "Managed",
        status: "complete",
        questionsAnswered: 10,
        questionsTotal: 10,
      },
    ];

    const parsed = parseStoredProfileCategoryScores(
      { scoringEngineVersion: "v2", pillarScores: pillarSnapshots },
      v1CategoryScores,
    );

    expect(parsed.scoringEngineVersion).toBe("v2");
    expect(parsed.pillarSnapshots).toEqual(pillarSnapshots);
    expect(parsed.categoryScores).toEqual([]);
  });

  it("parses legacy v1 category score arrays", () => {
    const legacyScores = [
      {
        categoryCode: "security",
        categoryName: "Security",
        percentScore: 80,
        maturityTier: "Managed",
      },
    ];

    const parsed = parseStoredProfileCategoryScores(legacyScores, v1CategoryScores);

    expect(parsed.scoringEngineVersion).toBe("v1");
    expect(parsed.categoryScores).toEqual(legacyScores);
    expect(parsed.pillarSnapshots).toBeNull();
  });

  it("falls back to aggregated v1 scores when storage is empty", () => {
    const parsed = parseStoredProfileCategoryScores(null, v1CategoryScores);

    expect(parsed.scoringEngineVersion).toBe("v1");
    expect(parsed.categoryScores.length).toBeGreaterThan(0);
    expect(parsed.pillarSnapshots).toBeNull();
  });
});
