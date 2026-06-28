import { describe, expect, it } from "vitest";
import {
  buildCategoryComparisons,
  buildComparisonExecutiveSummary,
  classifyRecommendationChanges,
  diffQuestionResponses,
  type ComparisonRecommendationItem,
} from "@/lib/assessments/comparison";
import type { V2CategoryScore } from "@/lib/assessment-library/category-mapping";

function v2(
  categoryCode: string,
  categoryName: string,
  percentScore: number,
): V2CategoryScore {
  return {
    categoryCode,
    categoryName,
    percentScore,
    maturityTier: "Developing",
    pointsEarned: percentScore,
    pointsPossible: 100,
  };
}

function rec(
  dedupeKey: string,
  overrides: Partial<ComparisonRecommendationItem> = {},
): ComparisonRecommendationItem {
  return {
    id: dedupeKey,
    dedupeKey,
    title: `Recommendation ${dedupeKey}`,
    priority: "medium",
    status: "open",
    categoryName: "Security",
    ...overrides,
  };
}

describe("assessment comparison", () => {
  it("builds category comparisons for all v2 categories with trend indicators", () => {
    const previous = [v2("security", "Security", 50), v2("infrastructure", "Infrastructure", 70)];
    const current = [v2("security", "Security", 62), v2("infrastructure", "Infrastructure", 65)];

    const rows = buildCategoryComparisons(previous, current);
    const security = rows.find((row) => row.categoryCode === "security");
    const infrastructure = rows.find((row) => row.categoryCode === "infrastructure");
    const productivity = rows.find((row) => row.categoryCode === "productivity");

    expect(security).toMatchObject({
      previousScore: 50,
      currentScore: 62,
      change: 12,
      trend: "improved",
    });
    expect(infrastructure).toMatchObject({
      change: -5,
      trend: "declined",
    });
    expect(productivity?.trend).toBe("not_assessed");
  });

  it("classifies recommendation changes without mutating status", () => {
    const baseline = [
      rec("mfa", { priority: "critical", status: "open" }),
      rec("backup", { priority: "high", status: "completed" }),
      rec("docs", { priority: "low", status: "accepted" }),
    ];
    const comparison = [
      rec("mfa", { priority: "critical", status: "open" }),
      rec("backup", { priority: "high", status: "completed" }),
      rec("patching", { priority: "high", status: "open" }),
    ];

    const result = classifyRecommendationChanges(baseline, comparison);

    expect(result.newRecommendations.map((item) => item.dedupeKey)).toEqual(["patching"]);
    expect(result.resolvedRecommendations.map((item) => item.dedupeKey)).toEqual(["backup"]);
    expect(result.stillOpenRecommendations.map((item) => item.dedupeKey)).toEqual([
      "mfa",
      "patching",
    ]);
    expect(result.criticalHighUnresolved.map((item) => item.dedupeKey)).toEqual([
      "mfa",
      "patching",
    ]);
    expect(result.noLongerTriggeredRecommendations.map((item) => item.dedupeKey)).toEqual([
      "docs",
    ]);
  });

  it("diffs question responses by score impact", () => {
    const baseline = [
      {
        questionId: "q1",
        scoreEarned: 0,
        question: {
          code: "Q01",
          questionText: "Is MFA enabled?",
          category: { name: "Security" },
        },
        selectedAnswerOption: { answerText: "No" },
      },
    ];
    const comparison = [
      {
        questionId: "q1",
        scoreEarned: 3,
        question: {
          code: "Q01",
          questionText: "Is MFA enabled?",
          category: { name: "Security" },
        },
        selectedAnswerOption: { answerText: "Yes" },
      },
    ];

    const changes = diffQuestionResponses(baseline, comparison);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({
      previousAnswer: "No",
      currentAnswer: "Yes",
      scoreImpact: 3,
    });
  });

  it("generates an executive summary for improved scores", () => {
    const summary = buildComparisonExecutiveSummary({
      scoreChange: 11,
      previous: {
        id: "a1",
        assessmentName: "Initial Assessment",
        completedAt: null,
        overallScore: 58,
        maturityTier: "developing",
        maturityTierLabel: "Developing",
        assessorName: "Alex",
      },
      current: {
        id: "a2",
        assessmentName: "Follow-up Assessment",
        completedAt: null,
        overallScore: 69,
        maturityTier: "mature",
        maturityTierLabel: "Mature",
        assessorName: "Alex",
      },
      categoryComparisons: buildCategoryComparisons(
        [v2("infrastructure", "Infrastructure", 55), v2("security", "Security", 50)],
        [v2("infrastructure", "Infrastructure", 72), v2("security", "Security", 64)],
      ),
      recommendations: classifyRecommendationChanges([], []),
    });

    expect(summary).toContain("improved its Technology Profile by 11 points");
    expect(summary).toContain("infrastructure");
    expect(summary).toContain("Mature");
  });

  it("handles unchanged scores in executive summary", () => {
    const summary = buildComparisonExecutiveSummary({
      scoreChange: 0,
      previous: {
        id: "a1",
        assessmentName: "Q1 Review",
        completedAt: null,
        overallScore: 70,
        maturityTier: "mature",
        maturityTierLabel: "Mature",
        assessorName: null,
      },
      current: {
        id: "a2",
        assessmentName: "Q2 Review",
        completedAt: null,
        overallScore: 70,
        maturityTier: "mature",
        maturityTierLabel: "Mature",
        assessorName: null,
      },
      categoryComparisons: buildCategoryComparisons(
        [v2("security", "Security", 70)],
        [v2("security", "Security", 70)],
      ),
      recommendations: classifyRecommendationChanges([], []),
    });

    expect(summary).toContain("held steady");
  });
});
