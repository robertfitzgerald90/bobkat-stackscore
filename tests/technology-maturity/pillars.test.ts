import { describe, expect, it } from "vitest";
import { buildPillarInsights, getPillarDisplayForV1CategoryCode } from "@/lib/technology-maturity/pillars";

describe("technology maturity pillars", () => {
  it("maps v1 security recommendations to Identity & Access", () => {
    const pillar = getPillarDisplayForV1CategoryCode("security");
    expect(pillar?.pillarName).toBe("Identity & Access");
    expect(pillar?.businessQuestion).toContain("right people");
  });

  it("builds eight pillar insights from v1 category scores", () => {
    const insights = buildPillarInsights({
      v1CategoryScores: [
        {
          categoryId: "security",
          categoryCode: "security",
          categoryName: "Security & Protection",
          pointsEarned: 70,
          pointsPossible: 100,
          percentScore: 70,
          rating: "stable",
          weightedContribution: 0,
        },
        {
          categoryId: "backup",
          categoryCode: "backup",
          categoryName: "Backup & Recovery",
          pointsEarned: 60,
          pointsPossible: 100,
          percentScore: 60,
          rating: "stable",
          weightedContribution: 0,
        },
        {
          categoryId: "bcdr",
          categoryCode: "bcdr",
          categoryName: "Business Continuity & Disaster Recovery",
          pointsEarned: 80,
          pointsPossible: 100,
          percentScore: 80,
          rating: "strong",
          weightedContribution: 0,
        },
      ],
      openRecommendations: [{ categoryCode: "security" }, { categoryCode: "endpoint" }],
    });

    expect(insights).toHaveLength(8);
    expect(insights.find((row) => row.pillarCode === "identity_access")?.percentScore).toBe(70);
    expect(insights.find((row) => row.pillarCode === "data_protection_recovery")?.percentScore).toBe(
      70,
    );
    expect(insights.find((row) => row.pillarCode === "identity_access")?.openRecommendationCount).toBe(
      1,
    );
    expect(
      insights.find((row) => row.pillarCode === "security_operations")?.percentScore,
    ).toBeNull();
  });
});
