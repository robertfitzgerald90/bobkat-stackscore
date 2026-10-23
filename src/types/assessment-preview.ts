import type { Priority, Rating } from "@/generated/prisma/client";

export type CategoryPreview = {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  answeredCount: number;
  totalCount: number;
  percentScore: number | null;
  rating: Rating | null;
  /** DOC-119 pillar completion status. */
  status: "complete" | "incomplete";
  /** DOC-119 maturity label, or "Assessment Incomplete" when unfinished. */
  maturityLabel: string | null;
};

export type RecommendationPreview = {
  title: string;
  priority: Priority;
  estimatedImpactPoints: number;
  categoryName: string;
};

export type RiskPreview = {
  categoryName: string;
  percentScore: number;
  rating: Rating;
};

export type AssessmentPreview = {
  overallScore: number | null;
  overallRating: Rating | null;
  projectedScore: number | null;
  hasCriticalExposure: boolean;
  criticalFindingsCount: number;
  answeredCount: number;
  totalCount: number;
  openRecommendationsCount: number;
  categoryScores: CategoryPreview[];
  recommendations: RecommendationPreview[];
  topRisks: RiskPreview[];
  /** Always true while the assessment status is draft. */
  isDraft: boolean;
  /** True when every active question is answered and overall score is numeric. */
  isCompletionReady: boolean;
  completePillarCount: number;
  totalPillarCount: number;
};
