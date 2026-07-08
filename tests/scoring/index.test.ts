import { describe, expect, it } from "vitest";
import {
  aggregateV2CategoryScores,
  calculateV2OverallScore,
} from "@/lib/assessment-library/category-mapping";
import { QUESTION_LIBRARY_METADATA } from "@/lib/assessment-library/metadata";
import {
  calculateCategoryScores,
  calculateOverallScore,
  calculateProjectedScore,
  calculateScores,
  getRating,
  roundHalfUp,
} from "@/lib/scoring";
import { getMaturityTier, MATURITY_TIER_LABELS } from "@/lib/scoring/maturity";

describe("scoring", () => {
  it("calculates category and overall scores per DOC-111A example", () => {
    const categories = calculateCategoryScores([
      {
        categoryId: "1",
        categoryCode: "security",
        categoryName: "Security",
        pointsEarned: 16,
        pointsPossible: 20,
      },
      {
        categoryId: "2",
        categoryCode: "backup",
        categoryName: "Backup",
        pointsEarned: 14,
        pointsPossible: 20,
      },
      {
        categoryId: "3",
        categoryCode: "infrastructure",
        categoryName: "Infrastructure",
        pointsEarned: 13.5,
        pointsPossible: 15,
      },
      {
        categoryId: "4",
        categoryCode: "endpoint",
        categoryName: "Endpoint",
        pointsEarned: 12.75,
        pointsPossible: 15,
      },
      {
        categoryId: "5",
        categoryCode: "documentation",
        categoryName: "Documentation",
        pointsEarned: 6,
        pointsPossible: 10,
      },
      {
        categoryId: "6",
        categoryCode: "bcdr",
        categoryName: "BCDR",
        pointsEarned: 5,
        pointsPossible: 10,
      },
      {
        categoryId: "7",
        categoryCode: "strategic",
        categoryName: "Strategic",
        pointsEarned: 7.5,
        pointsPossible: 10,
      },
    ]);

    expect(roundHalfUp(calculateOverallScore(categories))).toBe(75);
    expect(getRating(75)).toBe("stable");
  });

  it("preserves critical exposure flag without score penalty (DOC-111A)", () => {
    const result = calculateScores(
      [
        {
          categoryId: "1",
          categoryCode: "security",
          categoryName: "Security",
          pointsEarned: 18,
          pointsPossible: 20,
        },
      ],
      true,
    );
    expect(result.hasCriticalExposure).toBe(true);
    expect(result.overallScore).toBeGreaterThan(0);
  });

  it("caps projected score at 100", () => {
    expect(calculateProjectedScore(95, [10, 8])).toBe(100);
  });
});

describe("maturity tiers (DOC-113)", () => {
  it("maps scores to maturity tiers", () => {
    expect(getMaturityTier(15)).toBe("nascent");
    expect(getMaturityTier(30)).toBe("foundational");
    expect(getMaturityTier(50)).toBe("developing");
    expect(getMaturityTier(70)).toBe("mature");
    expect(getMaturityTier(90)).toBe("optimized");
  });

  it("has labels for every tier", () => {
    for (const tier of ["nascent", "foundational", "developing", "mature", "optimized"] as const) {
      expect(MATURITY_TIER_LABELS[tier]).toBeTruthy();
    }
  });
});

describe("v2 category mapping (DOC-118)", () => {
  it("merges backup and bcdr into business continuity", () => {
    const v2 = aggregateV2CategoryScores([
      {
        categoryId: "1",
        categoryCode: "backup",
        categoryName: "Backup",
        pointsEarned: 10,
        pointsPossible: 20,
        percentScore: 50,
        rating: "critical",
        weightedContribution: 10,
      },
      {
        categoryId: "2",
        categoryCode: "bcdr",
        categoryName: "BCDR",
        pointsEarned: 5,
        pointsPossible: 10,
        percentScore: 50,
        rating: "critical",
        weightedContribution: 5,
      },
    ]);

    const bcp = v2.find((c) => c.categoryCode === "business_continuity");
    expect(bcp).toBeDefined();
    expect(bcp?.percentScore).toBe(50);
    expect(bcp?.maturityTier).toBe("Developing");
  });

  it("calculates v2 weighted overall", () => {
    const v2 = aggregateV2CategoryScores([
      {
        categoryId: "1",
        categoryCode: "security",
        categoryName: "Security",
        pointsEarned: 16,
        pointsPossible: 20,
        percentScore: 80,
        rating: "strong",
        weightedContribution: 16,
      },
    ]);
    expect(calculateV2OverallScore(v2)).toBe(80);
  });
});

describe("DOC-114 v1 question metadata (archived)", () => {
  it("defines metadata for all 50 legacy questions", () => {
    expect(QUESTION_LIBRARY_METADATA).toHaveLength(50);
    const codes = new Set(QUESTION_LIBRARY_METADATA.map((q) => q.code));
    expect(codes.size).toBe(50);
  });
});
