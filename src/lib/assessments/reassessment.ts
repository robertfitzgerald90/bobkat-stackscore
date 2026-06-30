import { prisma } from "@/lib/db";
import type { AssessmentType } from "@/generated/prisma/client";

export type CreateReassessmentInput = {
  clientId: string;
  assessorUserId: string;
  assessmentName: string;
  assessmentType?: AssessmentType;
  assessmentDate?: Date;
  sourceAssessmentId?: string;
};

export async function resolveSourceAssessmentId(
  clientId: string,
  sourceAssessmentId?: string,
): Promise<string | null> {
  if (sourceAssessmentId) {
    const source = await prisma.assessment.findFirst({
      where: {
        id: sourceAssessmentId,
        clientId,
        status: "completed",
      },
      select: { id: true },
    });
    return source?.id ?? null;
  }

  const latest = await prisma.assessment.findFirst({
    where: { clientId, status: "completed" },
    orderBy: { completedAt: "desc" },
    select: { id: true },
  });

  return latest?.id ?? null;
}

export async function createReassessment(input: CreateReassessmentInput) {
  const sourceId = await resolveSourceAssessmentId(input.clientId, input.sourceAssessmentId);

  if (!sourceId) {
    throw new Error("No completed assessment found to use as reassessment baseline");
  }

  const sourceResponses = await prisma.assessmentResponse.findMany({
    where: { assessmentId: sourceId },
  });

  return prisma.$transaction(async (tx) => {
    const assessment = await tx.assessment.create({
      data: {
        clientId: input.clientId,
        assessorUserId: input.assessorUserId,
        assessmentName: input.assessmentName,
        assessmentType: input.assessmentType ?? "followup",
        assessmentDate: input.assessmentDate ?? new Date(),
        status: "draft",
        scoringEngineVersion: "v2",
        sourceAssessmentId: sourceId,
      },
    });

    if (sourceResponses.length > 0) {
      await tx.assessmentResponse.createMany({
        data: sourceResponses.map((response) => ({
          assessmentId: assessment.id,
          questionId: response.questionId,
          selectedAnswerOptionId: response.selectedAnswerOptionId,
          scoreEarned: response.scoreEarned,
          notes: response.notes,
          evidence: response.evidence,
        })),
      });
    }

    return assessment;
  });
}

export type AssessmentHistoryEntry = {
  id: string;
  assessmentName: string;
  assessmentType: string;
  status: string;
  overallScore: number | null;
  completedAt: string | null;
  createdAt: string;
  assessorName: string;
  isReassessment: boolean;
  sourceAssessmentId: string | null;
  sourceAssessmentName: string | null;
};

export async function getClientAssessmentHistory(
  clientId: string,
): Promise<AssessmentHistoryEntry[]> {
  const assessments = await prisma.assessment.findMany({
    where: { clientId },
    orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
    include: {
      assessor: { select: { name: true } },
      sourceAssessment: { select: { id: true, assessmentName: true } },
    },
  });

  return assessments.map((assessment) => ({
    id: assessment.id,
    assessmentName: assessment.assessmentName,
    assessmentType: assessment.assessmentType,
    status: assessment.status,
    overallScore:
      assessment.overallScore !== null ? Math.round(Number(assessment.overallScore)) : null,
    completedAt: assessment.completedAt?.toISOString() ?? null,
    createdAt: assessment.createdAt.toISOString(),
    assessorName: assessment.assessor.name,
    isReassessment: assessment.sourceAssessmentId !== null,
    sourceAssessmentId: assessment.sourceAssessmentId,
    sourceAssessmentName: assessment.sourceAssessment?.assessmentName ?? null,
  }));
}

export type CategoryScoreChange = {
  categoryId: string;
  categoryName: string;
  previousScore: number;
  currentScore: number;
  change: number;
};

export type ImprovementSummary = {
  currentAssessmentId: string;
  currentAssessmentName: string;
  sourceAssessmentId: string;
  sourceAssessmentName: string;
  sourceCompletedAt: string | null;
  currentCompletedAt: string | null;
  previousOverallScore: number;
  currentOverallScore: number;
  scoreChange: number;
  categoryChanges: CategoryScoreChange[];
  previousCriticalFindings: number;
  currentCriticalFindings: number;
  criticalFindingReduction: number;
  sourceRecommendationCount: number;
  sourceRecommendationsCompleted: number;
  recommendationClosureRate: number;
  newRecommendationCount: number;
};

export async function buildImprovementSummary(
  assessmentId: string,
): Promise<ImprovementSummary | null> {
  const current = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      categoryScores: { include: { category: true }, orderBy: { category: { displayOrder: "asc" } } },
      recommendations: true,
      responses: { include: { selectedAnswerOption: true } },
      sourceAssessment: {
        include: {
          categoryScores: { include: { category: true }, orderBy: { category: { displayOrder: "asc" } } },
          recommendations: true,
          responses: { include: { selectedAnswerOption: true } },
        },
      },
    },
  });

  if (!current?.sourceAssessment || current.status !== "completed") {
    return null;
  }

  const previous = current.sourceAssessment;
  const previousOverallScore = Math.round(Number(previous.overallScore ?? 0));
  const currentOverallScore = Math.round(Number(current.overallScore ?? 0));

  const previousCategoryMap = new Map(
    previous.categoryScores.map((score) => [score.categoryId, Number(score.percentScore)]),
  );

  const categoryChanges: CategoryScoreChange[] = current.categoryScores.map((score) => {
    const previousScore = previousCategoryMap.get(score.categoryId) ?? 0;
    const currentScore = Number(score.percentScore);
    return {
      categoryId: score.categoryId,
      categoryName: score.category.name,
      previousScore: Math.round(previousScore),
      currentScore: Math.round(currentScore),
      change: Math.round(currentScore - previousScore),
    };
  });

  const previousCriticalFindings = previous.responses.filter(
    (response) => response.selectedAnswerOption.triggersCriticalFlag,
  ).length;

  const currentCriticalFindings = current.responses.filter(
    (response) => response.selectedAnswerOption.triggersCriticalFlag,
  ).length;

  const sourceRecommendationCount = previous.recommendations.length;
  const sourceRecommendationsCompleted = previous.recommendations.filter(
    (recommendation) => recommendation.status === "completed",
  ).length;

  const recommendationClosureRate =
    sourceRecommendationCount > 0
      ? Math.round((sourceRecommendationsCompleted / sourceRecommendationCount) * 100)
      : 0;

  return {
    currentAssessmentId: current.id,
    currentAssessmentName: current.assessmentName,
    sourceAssessmentId: previous.id,
    sourceAssessmentName: previous.assessmentName,
    sourceCompletedAt: previous.completedAt?.toISOString() ?? null,
    currentCompletedAt: current.completedAt?.toISOString() ?? null,
    previousOverallScore,
    currentOverallScore,
    scoreChange: currentOverallScore - previousOverallScore,
    categoryChanges,
    previousCriticalFindings,
    currentCriticalFindings,
    criticalFindingReduction: previousCriticalFindings - currentCriticalFindings,
    sourceRecommendationCount,
    sourceRecommendationsCompleted,
    recommendationClosureRate,
    newRecommendationCount: current.recommendations.length,
  };
}
