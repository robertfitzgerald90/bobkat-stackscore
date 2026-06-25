import { describe, expect, it } from "vitest";
import {
  calculateOverallScore,
  calculateCategoryScores,
  getRating,
  roundHalfUp,
} from "@/lib/scoring";

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
});
