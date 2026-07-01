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

  it("builds pillar insights from v2 pillar category codes", () => {
    const insights = buildPillarInsights({
      v1CategoryScores: [
        {
          categoryId: "ia",
          categoryCode: "identity_access",
          categoryName: "Identity & Access",
          pointsEarned: 82,
          pointsPossible: 100,
          percentScore: 82,
          rating: "strong",
          weightedContribution: 0,
        },
        {
          categoryId: "ep",
          categoryCode: "endpoint_management",
          categoryName: "Endpoint Management",
          pointsEarned: 55,
          pointsPossible: 100,
          percentScore: 55,
          rating: "at_risk",
          weightedContribution: 0,
        },
      ],
      openRecommendations: [{ categoryCode: "identity_access" }],
    });

    expect(insights.find((row) => row.pillarCode === "identity_access")?.percentScore).toBe(82);
    expect(insights.find((row) => row.pillarCode === "endpoint_management")?.percentScore).toBe(55);
    expect(insights.find((row) => row.pillarCode === "identity_access")?.openRecommendationCount).toBe(
      1,
    );
    expect(insights.find((row) => row.pillarCode === "network_connectivity")?.percentScore).toBeNull();
  });

  it("prefers pillar snapshots for incomplete pillar status", () => {
    const insights = buildPillarInsights({
      v1CategoryScores: [
        {
          categoryId: "ia",
          categoryCode: "identity_access",
          categoryName: "Identity & Access",
          pointsEarned: 70,
          pointsPossible: 100,
          percentScore: 70,
          rating: "stable",
          weightedContribution: 0,
        },
      ],
      pillarSnapshots: [
        {
          pillarCode: "identity_access",
          pillarName: "Identity & Access",
          businessQuestion: "Can we trust access?",
          percentScore: 70,
          maturityLevelCode: "managed",
          maturityLevelLabel: "Managed",
          status: "complete",
          questionsAnswered: 10,
          questionsTotal: 10,
        },
        {
          pillarCode: "productivity_collaboration",
          pillarName: "Productivity & Collaboration",
          businessQuestion: "Does technology enable work?",
          percentScore: null,
          maturityLevelCode: null,
          maturityLevelLabel: null,
          status: "incomplete",
          questionsAnswered: 3,
          questionsTotal: 10,
        },
      ],
      openRecommendations: [],
    });

    expect(insights.find((row) => row.pillarCode === "identity_access")?.percentScore).toBe(70);
    expect(insights.find((row) => row.pillarCode === "productivity_collaboration")?.status).toBe(
      "incomplete",
    );
    expect(
      insights.find((row) => row.pillarCode === "productivity_collaboration")?.questionsAnswered,
    ).toBe(3);
  });
});
