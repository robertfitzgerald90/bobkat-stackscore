import type { Rating } from "@/generated/prisma/client";

export const CATEGORY_WEIGHTS: Record<string, number> = {
  security: 20,
  backup: 20,
  infrastructure: 15,
  endpoint: 15,
  documentation: 10,
  bcdr: 10,
  strategic: 10,
};

export const RATING_LABELS: Record<Rating, string> = {
  exceptional: "Exceptional",
  strong: "Strong",
  stable: "Stable",
  at_risk: "At Risk",
  critical: "Critical",
};

export function getRating(score: number): Rating {
  if (score >= 90) return "exceptional";
  if (score >= 80) return "strong";
  if (score >= 70) return "stable";
  if (score >= 60) return "at_risk";
  return "critical";
}

export function roundHalfUp(value: number): number {
  return Math.round(value);
}

export type CategoryScoreInput = {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  pointsEarned: number;
  pointsPossible: number;
};

export type CategoryScoreResult = CategoryScoreInput & {
  percentScore: number;
  rating: Rating;
  weightedContribution: number;
};

export type ScoringResult = {
  categoryScores: CategoryScoreResult[];
  overallScore: number;
  overallRating: Rating;
  hasCriticalExposure: boolean;
};

export function calculateCategoryScores(
  categories: CategoryScoreInput[],
): CategoryScoreResult[] {
  return categories.map((category) => {
    const percentScore =
      category.pointsPossible > 0
        ? (category.pointsEarned / category.pointsPossible) * 100
        : 0;
    const weight = CATEGORY_WEIGHTS[category.categoryCode] ?? 0;

    return {
      ...category,
      percentScore: Math.round(percentScore * 100) / 100,
      rating: getRating(percentScore),
      weightedContribution: (percentScore * weight) / 100,
    };
  });
}

export function calculateOverallScore(categoryScores: CategoryScoreResult[]): number {
  const total = categoryScores.reduce(
    (sum, category) => sum + category.weightedContribution,
    0,
  );
  return roundHalfUp(total);
}

export function calculateScores(
  categories: CategoryScoreInput[],
  hasCriticalExposure: boolean,
): ScoringResult {
  const categoryScores = calculateCategoryScores(categories);
  const overallScore = calculateOverallScore(categoryScores);

  return {
    categoryScores,
    overallScore,
    overallRating: getRating(overallScore),
    hasCriticalExposure,
  };
}

export function calculateProjectedScore(
  currentScore: number,
  impactPoints: number[],
): number {
  const totalImpact = impactPoints.reduce((sum, points) => sum + points, 0);
  return Math.min(100, currentScore + totalImpact);
}
