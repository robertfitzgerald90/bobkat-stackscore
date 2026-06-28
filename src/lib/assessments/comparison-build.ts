import { aggregateV2CategoryScores } from "@/lib/assessment-library/category-mapping";
import {
  buildCategoryComparisons,
  buildComparisonExecutiveSummary,
  classifyRecommendationChanges,
  diffQuestionResponses,
  type AssessmentComparison,
  type ComparisonAssessmentSummary,
  type ComparisonRecommendationItem,
} from "@/lib/assessments/comparison";
import { prisma } from "@/lib/db";
import { getRecommendationsTriggeredByAssessment } from "@/lib/recommendations/queries";
import type { CategoryScoreResult } from "@/lib/scoring";
import { getMaturityTier, getMaturityTierLabel } from "@/lib/scoring/maturity";

function toCategoryScoreResults(
  scores: Array<{
    categoryId: string;
    pointsEarned: unknown;
    pointsPossible: unknown;
    percentScore: unknown;
    rating: CategoryScoreResult["rating"];
    category: { code: string; name: string };
  }>,
): CategoryScoreResult[] {
  return scores.map((score) => ({
    categoryId: score.categoryId,
    categoryCode: score.category.code,
    categoryName: score.category.name,
    pointsEarned: Number(score.pointsEarned),
    pointsPossible: Number(score.pointsPossible),
    percentScore: Number(score.percentScore),
    rating: score.rating,
    weightedContribution: 0,
  }));
}

async function loadCompletedAssessment(assessmentId: string, clientId: string) {
  return prisma.assessment.findFirst({
    where: { id: assessmentId, clientId, status: "completed" },
    include: {
      assessor: { select: { name: true } },
      categoryScores: {
        include: { category: true },
        orderBy: { category: { displayOrder: "asc" } },
      },
      responses: {
        include: {
          question: { include: { category: true } },
          selectedAnswerOption: true,
        },
      },
    },
  });
}

function toAssessmentSummary(
  assessment: NonNullable<Awaited<ReturnType<typeof loadCompletedAssessment>>>,
): ComparisonAssessmentSummary {
  const overallScore = Math.round(Number(assessment.overallScore ?? 0));
  const maturityTier = getMaturityTier(overallScore);

  return {
    id: assessment.id,
    assessmentName: assessment.assessmentName,
    completedAt: assessment.completedAt?.toISOString() ?? null,
    overallScore,
    maturityTier,
    maturityTierLabel: getMaturityTierLabel(overallScore),
    assessorName: assessment.assessor.name,
  };
}

function toRecommendationItems(
  recommendations: Awaited<ReturnType<typeof getRecommendationsTriggeredByAssessment>>,
): ComparisonRecommendationItem[] {
  return recommendations.map((recommendation) => ({
    id: recommendation.id,
    dedupeKey: recommendation.dedupeKey,
    title: recommendation.title,
    priority: recommendation.priority,
    status: recommendation.status,
    categoryName: recommendation.category.name,
  }));
}

export async function buildAssessmentComparison(
  clientId: string,
  previousAssessmentId: string,
  currentAssessmentId: string,
): Promise<AssessmentComparison | null> {
  if (previousAssessmentId === currentAssessmentId) {
    return null;
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, companyName: true },
  });
  if (!client) return null;

  const [previousAssessment, currentAssessment] = await Promise.all([
    loadCompletedAssessment(previousAssessmentId, clientId),
    loadCompletedAssessment(currentAssessmentId, clientId),
  ]);

  if (!previousAssessment || !currentAssessment) {
    return null;
  }

  const previousV2 = aggregateV2CategoryScores(
    toCategoryScoreResults(previousAssessment.categoryScores),
  );
  const currentV2 = aggregateV2CategoryScores(
    toCategoryScoreResults(currentAssessment.categoryScores),
  );

  const previous = toAssessmentSummary(previousAssessment);
  const current = toAssessmentSummary(currentAssessment);

  const [baselineRecommendations, comparisonRecommendations] = await Promise.all([
    getRecommendationsTriggeredByAssessment(previousAssessmentId),
    getRecommendationsTriggeredByAssessment(currentAssessmentId),
  ]);

  const recommendations = classifyRecommendationChanges(
    toRecommendationItems(baselineRecommendations),
    toRecommendationItems(comparisonRecommendations),
  );

  const categoryComparisons = buildCategoryComparisons(previousV2, currentV2);
  const questionChanges = diffQuestionResponses(
    previousAssessment.responses,
    currentAssessment.responses,
  );

  const comparisonBase = {
    clientId: client.id,
    clientName: client.companyName,
    previous,
    current,
    scoreChange: current.overallScore - previous.overallScore,
    maturityChanged: previous.maturityTier !== current.maturityTier,
    categoryComparisons,
    recommendations,
    questionChanges,
  };

  return {
    ...comparisonBase,
    executiveSummary: buildComparisonExecutiveSummary(comparisonBase),
  };
}
