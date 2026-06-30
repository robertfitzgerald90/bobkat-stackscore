import { prisma } from "@/lib/db";
import {
  buildExecutiveSummary,
} from "@/lib/recommendations";
import { generateRecommendations, collectTriggeredResponses } from "@/lib/recommendations/generate";
import { getRecommendationsTriggeredByAssessment } from "@/lib/recommendations/queries";
import { syncClientRecommendations } from "@/lib/recommendations/sync";
import {
  calculateScores,
  RATING_LABELS,
  getRating,
  type CategoryScoreInput,
  type ScoringResult,
} from "@/lib/scoring";
import { completeAssessmentV2 } from "@/lib/assessments/complete-v2";
import type { Prisma } from "@/generated/prisma/client";

const CATEGORY_SCORE_FIELDS = {
  security: "securityScore",
  backup: "backupScore",
  infrastructure: "infrastructureScore",
  endpoint: "endpointScore",
  documentation: "documentationScore",
  bcdr: "bcdrScore",
  strategic: "strategicScore",
} as const;

export async function completeAssessment(assessmentId: string, userId: string) {
  const assessmentMeta = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { scoringEngineVersion: true },
  });

  if (!assessmentMeta) {
    throw new Error("Assessment not found");
  }

  if (assessmentMeta.scoringEngineVersion === "v2") {
    return completeAssessmentV2(assessmentId, userId);
  }

  return completeAssessmentV1(assessmentId, userId);
}

async function completeAssessmentV1(assessmentId: string, userId: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      responses: {
        include: {
          question: { include: { category: true } },
          selectedAnswerOption: {
            include: { recommendationTemplate: true },
          },
        },
      },
      client: true,
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  if (assessment.status !== "draft") {
    throw new Error("Only draft assessments can be completed");
  }

  const activeQuestions = await prisma.assessmentQuestion.findMany({
    where: { isActive: true },
    include: { category: true },
  });

  if (assessment.responses.length < activeQuestions.length) {
    throw new Error("All questions must be answered before completion");
  }

  const responsesByQuestion = new Map(
    assessment.responses.map((response) => [response.questionId, response]),
  );

  const categoryInputs: CategoryScoreInput[] = [];
  const categories = await prisma.assessmentCategory.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  for (const category of categories) {
    const questions = activeQuestions.filter(
      (question) => question.categoryId === category.id,
    );
    const pointsEarned = questions.reduce((sum, question) => {
      const response = responsesByQuestion.get(question.id);
      return sum + (response?.scoreEarned ?? 0);
    }, 0);
    const pointsPossible = questions.reduce((sum, question) => sum + question.weight, 0);

    categoryInputs.push({
      categoryId: category.id,
      categoryCode: category.code,
      categoryName: category.name,
      pointsEarned,
      pointsPossible,
    });
  }

  const hasCriticalExposure = assessment.responses.some(
    (response) => response.selectedAnswerOption.triggersCriticalFlag,
  );

  const scoring = calculateScores(categoryInputs, hasCriticalExposure);

  const triggeredResponses = collectTriggeredResponses(assessment.responses);
  const { recommendations: generatedRecommendations, projectedScore } = generateRecommendations(
    assessment.responses,
    scoring.overallScore,
  );

  const strengths = [...scoring.categoryScores]
    .sort((a, b) => b.percentScore - a.percentScore)
    .slice(0, 2)
    .map((category) => category.categoryName);

  const risks = [...scoring.categoryScores]
    .sort((a, b) => a.percentScore - b.percentScore)
    .slice(0, 2)
    .map((category) => category.categoryName);

  const executiveSummary = buildExecutiveSummary({
    overallScore: scoring.overallScore,
    overallRating: RATING_LABELS[scoring.overallRating],
    hasCriticalExposure,
    strengths,
    risks,
    topRecommendations: generatedRecommendations.slice(0, 5).map((rec) => rec.title),
    projectedScore,
  });

  const categoryScoreMap = Object.fromEntries(
    scoring.categoryScores.map((category) => [category.categoryCode, category.percentScore]),
  ) as Record<string, number>;

  await prisma.$transaction(async (tx) => {
    await tx.assessmentCategoryScore.deleteMany({ where: { assessmentId } });

    for (const categoryScore of scoring.categoryScores) {
      await tx.assessmentCategoryScore.create({
        data: {
          assessmentId,
          categoryId: categoryScore.categoryId,
          pointsEarned: categoryScore.pointsEarned,
          pointsPossible: categoryScore.pointsPossible,
          percentScore: categoryScore.percentScore,
          rating: categoryScore.rating,
        },
      });
    }

    await syncClientRecommendations(tx, {
      clientId: assessment.clientId,
      assessmentId,
      userId,
      generated: generatedRecommendations,
      triggeredResponses,
    });

    const updateData: Prisma.AssessmentUpdateInput = {
      status: "completed",
      completedAt: new Date(),
      overallScore: scoring.overallScore,
      hasCriticalExposure,
      executiveSummary,
      securityScore: categoryScoreMap.security,
      backupScore: categoryScoreMap.backup,
      infrastructureScore: categoryScoreMap.infrastructure,
      endpointScore: categoryScoreMap.endpoint,
      documentationScore: categoryScoreMap.documentation,
      bcdrScore: categoryScoreMap.bcdr,
      strategicScore: categoryScoreMap.strategic,
    };

    await tx.assessment.update({
      where: { id: assessmentId },
      data: updateData,
    });

    await tx.clientScoreHistory.create({
      data: {
        clientId: assessment.clientId,
        assessmentId,
        recordedDate: new Date(),
        overallScore: scoring.overallScore,
        securityScore: categoryScoreMap.security,
        backupScore: categoryScoreMap.backup,
        infrastructureScore: categoryScoreMap.infrastructure,
        endpointScore: categoryScoreMap.endpoint,
        documentationScore: categoryScoreMap.documentation,
        bcdrScore: categoryScoreMap.bcdr,
        strategicScore: categoryScoreMap.strategic,
      },
    });
  });

  await syncProfileFromAssessment(assessmentId);

  const recommendations = await getRecommendationsTriggeredByAssessment(assessmentId);

  const completed = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      categoryScores: { include: { category: true } },
      client: true,
      assessor: { select: { id: true, name: true, email: true } },
    },
  });

  if (!completed) {
    throw new Error("Assessment not found after completion");
  }

  return { ...completed, recommendations };
}

import type {
  AssessmentPreview,
  CategoryPreview,
  RecommendationPreview,
  RiskPreview,
} from "@/types/assessment-preview";
import { syncProfileFromAssessment } from "@/lib/technology-profile";

export type { AssessmentPreview, CategoryPreview, RecommendationPreview, RiskPreview };

export async function getAssessmentPreview(
  assessmentId: string,
): Promise<AssessmentPreview | null> {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      responses: {
        include: {
          question: { include: { category: true } },
          selectedAnswerOption: {
            include: { recommendationTemplate: true },
          },
        },
      },
    },
  });

  if (!assessment) return null;

  const activeQuestions = await prisma.assessmentQuestion.findMany({
    where: { isActive: true },
    include: { category: true },
  });

  const answeredCount = assessment.responses.length;
  const totalCount = activeQuestions.length;

  if (assessment.scoringEngineVersion === "v2") {
    const { calculateV2Scores } = await import("@/lib/scoring/v2");
    const { evaluateV2Triggers, collectV2TriggeredResponses } = await import(
      "@/lib/recommendations/v2-engine"
    );
    const { calculateProjectionImpacts } = await import("@/lib/recommendations");
    const { calculateProjectedScore } = await import("@/lib/scoring");

    const scoring = calculateV2Scores({
      questions: activeQuestions.map((question) => ({
        id: question.code,
        pillarCode: question.category.code as import("@/lib/technology-maturity/pillars").TechnologyPillarCode,
        weight: question.weight,
      })),
      responses: assessment.responses.map((response) => ({
        questionId: response.question.code,
        answerText: response.selectedAnswerOption.answerText,
      })),
    });

    const hasCriticalExposure = assessment.responses.some(
      (response) => response.selectedAnswerOption.triggersCriticalFlag,
    );
    const criticalFindingsCount = assessment.responses.filter(
      (response) => response.selectedAnswerOption.triggersCriticalFlag,
    ).length;

    const triggered = collectV2TriggeredResponses(assessment.responses);
    const v2Recommendations = evaluateV2Triggers(triggered);
    const projectionImpact = calculateProjectionImpacts(v2Recommendations);
    const projectedScore =
      scoring.overallStackScore !== null
        ? calculateProjectedScore(scoring.overallStackScore, [projectionImpact])
        : null;

    const categories = await prisma.assessmentCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });

    const responsesByQuestion = new Map(
      assessment.responses.map((response) => [response.questionId, response]),
    );

    const categoryScores: CategoryPreview[] = categories.map((category) => {
      const questions = activeQuestions.filter((q) => q.categoryId === category.id);
      const answeredInCategory = questions.filter((q) => responsesByQuestion.has(q.id));
      const pillar = scoring.pillarScores.find((row) => row.pillarCode === category.code);

      return {
        categoryId: category.id,
        categoryCode: category.code,
        categoryName: category.name,
        answeredCount: answeredInCategory.length,
        totalCount: questions.length,
        percentScore: pillar?.percentScore ?? null,
        rating: pillar?.percentScore != null ? getRating(pillar.percentScore) : null,
      };
    });

    const topRisks: RiskPreview[] = [...categoryScores]
      .filter((category) => category.percentScore !== null && category.rating !== null)
      .sort((a, b) => (a.percentScore ?? 100) - (b.percentScore ?? 100))
      .slice(0, 5)
      .map((category) => ({
        categoryName: category.categoryName,
        percentScore: category.percentScore!,
        rating: category.rating!,
      }));

    return {
      overallScore: scoring.overallStackScore,
      overallRating: scoring.overallStackScore !== null ? getRating(scoring.overallStackScore) : null,
      projectedScore,
      hasCriticalExposure,
      criticalFindingsCount,
      answeredCount,
      totalCount,
      openRecommendationsCount: v2Recommendations.length,
      categoryScores,
      recommendations: v2Recommendations.map((recommendation) => ({
        title: recommendation.title,
        priority: recommendation.priority,
        estimatedImpactPoints: recommendation.estimatedImpactPoints,
        categoryName: recommendation.categoryName,
      })),
      topRisks,
    };
  }

  const categories = await prisma.assessmentCategory.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  const responsesByQuestion = new Map(
    assessment.responses.map((response) => [response.questionId, response]),
  );

  const categoryInputs: CategoryScoreInput[] = categories.map((category) => {
    const questions = activeQuestions.filter((q) => q.categoryId === category.id);
    const answered = questions.filter((q) => responsesByQuestion.has(q.id));
    const pointsEarned = answered.reduce((sum, question) => {
      const response = responsesByQuestion.get(question.id);
      return sum + (response?.scoreEarned ?? 0);
    }, 0);
    const pointsPossible = answered.reduce((sum, question) => sum + question.weight, 0);

    return {
      categoryId: category.id,
      categoryCode: category.code,
      categoryName: category.name,
      pointsEarned,
      pointsPossible,
    };
  });

  const hasCriticalExposure = assessment.responses.some(
    (response) => response.selectedAnswerOption.triggersCriticalFlag,
  );

  const criticalFindingsCount = assessment.responses.filter(
    (response) => response.selectedAnswerOption.triggersCriticalFlag,
  ).length;

  const scoringInputs = categoryInputs.filter((category) => category.pointsPossible > 0);
  const scoring: ScoringResult | null =
    scoringInputs.length > 0
      ? calculateScores(scoringInputs, hasCriticalExposure)
      : null;

  const scoreByCategoryId = new Map(
    scoring?.categoryScores.map((category) => [category.categoryId, category]) ?? [],
  );

  const categoryScores: CategoryPreview[] = categories.map((category) => {
    const questions = activeQuestions.filter((q) => q.categoryId === category.id);
    const answeredInCategory = questions.filter((q) => responsesByQuestion.has(q.id));
    const scored = scoreByCategoryId.get(category.id);

    return {
      categoryId: category.id,
      categoryCode: category.code,
      categoryName: category.name,
      answeredCount: answeredInCategory.length,
      totalCount: questions.length,
      percentScore: scored ? scored.percentScore : null,
      rating: scored ? scored.rating : null,
    };
  });

  const recommendationResult =
    scoring !== null
      ? generateRecommendations(assessment.responses, scoring.overallScore)
      : null;

  const allRecommendations = recommendationResult?.recommendations ?? [];
  const projectedScore = recommendationResult?.projectedScore ?? null;

  const recommendations = allRecommendations.map((recommendation) => ({
    title: recommendation.title,
    priority: recommendation.priority,
    estimatedImpactPoints: recommendation.estimatedImpactPoints,
    categoryName: recommendation.categoryName,
  }));

  const topRisks: RiskPreview[] = [...categoryScores]
    .filter((category) => category.percentScore !== null && category.rating !== null)
    .sort((a, b) => (a.percentScore ?? 100) - (b.percentScore ?? 100))
    .slice(0, 5)
    .map((category) => ({
      categoryName: category.categoryName,
      percentScore: category.percentScore!,
      rating: category.rating!,
    }));

  return {
    overallScore: scoring?.overallScore ?? null,
    overallRating: scoring?.overallRating ?? null,
    projectedScore,
    hasCriticalExposure,
    criticalFindingsCount,
    answeredCount,
    totalCount,
    openRecommendationsCount: allRecommendations.length,
    categoryScores,
    recommendations,
    topRisks,
  };
}

export { CATEGORY_SCORE_FIELDS };
