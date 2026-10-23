import { prisma } from "@/lib/db";
import { buildAssessmentExecutiveSummary } from "@/lib/assessments/executive-summary";
import { getMaturityTier } from "@/lib/scoring/maturity";
import {
  collectV2TriggeredResponses,
  evaluateV2Triggers,
} from "@/lib/recommendations/v2-engine";
import { syncClientRecommendations } from "@/lib/recommendations/sync";
import { getRecommendationsTriggeredByAssessment } from "@/lib/recommendations/queries";
import { buildRiskSummaryFromPriorities } from "@/lib/recommendations/risk-summary";
import { ACTIVE_RECOMMENDATION_STATUSES } from "@/lib/recommendations/dedupe";
import { calculateProjectedScore, getRating } from "@/lib/scoring";
import { calculateProjectionImpacts } from "@/lib/recommendations";
import { toPillarScoreSnapshots, type PillarScoreSnapshot } from "@/lib/scoring/v2";
import { evaluateV2CompletionGuards } from "@/lib/assessments/completion-guards";
import type { Prisma, Rating } from "@/generated/prisma/client";
import { RATING_LABELS } from "@/lib/scoring";

/**
 * Completes a draft v2 assessment: scores pillars (DOC-119), evaluates triggers (DOC-152),
 * syncs client-level recommendations, records score history, and updates the Technology Profile.
 * Preserves prior completed assessments as immutable snapshots.
 *
 * Completion requires every active question answered and a non-null overall StackScore (SS-OPT-002).
 */
export async function completeAssessmentV2(assessmentId: string, userId: string) {
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

  if (!assessment) throw new Error("Assessment not found");
  if (assessment.status !== "draft") throw new Error("Only draft assessments can be completed");

  const activeQuestions = await prisma.assessmentQuestion.findMany({
    where: { isActive: true },
    include: { category: true },
  });

  const answeredQuestionIds = new Set(assessment.responses.map((response) => response.questionId));
  const unansweredCount = activeQuestions.filter(
    (question) => !answeredQuestionIds.has(question.id),
  ).length;

  const v2Questions = activeQuestions.map((question) => ({
    id: question.code,
    pillarCode: question.category.code as import("@/lib/technology-maturity/pillars").TechnologyPillarCode,
    weight: question.weight,
  }));

  const v2Responses = assessment.responses.map((response) => ({
    questionId: response.question.code,
    answerText: response.selectedAnswerOption.answerText,
  }));

  const guard = evaluateV2CompletionGuards({
    unansweredCount,
    responses: assessment.responses.map((response) => ({
      questionCode: response.question.code,
      answerText: response.selectedAnswerOption.answerText,
    })),
    questions: v2Questions,
    scoringResponses: v2Responses,
  });

  if (!guard.ok) {
    throw new Error(guard.message);
  }

  const scoring = guard.scoring;
  const overallScore = guard.overallStackScore;
  const pillarSnapshots = toPillarScoreSnapshots(scoring.pillarScores);
  const hasCriticalExposure = assessment.responses.some(
    (response) => response.selectedAnswerOption.triggersCriticalFlag,
  );

  const triggeredResponses = collectV2TriggeredResponses(assessment.responses);
  const generatedRecommendations = evaluateV2Triggers(triggeredResponses);
  const projectionImpact = calculateProjectionImpacts(generatedRecommendations);
  const projectedScore = calculateProjectedScore(overallScore, [projectionImpact]);

  const completePillars = scoring.pillarScores.filter(
    (pillar) => pillar.status === "complete" && pillar.percentScore !== null,
  );
  const strengths = [...completePillars]
    .sort((a, b) => (b.percentScore ?? 0) - (a.percentScore ?? 0))
    .slice(0, 3)
    .map((pillar) => {
      const meta = pillarSnapshots.find((row) => row.pillarCode === pillar.pillarCode);
      return meta?.pillarName ?? pillar.pillarCode;
    });

  const risks = [...completePillars]
    .sort((a, b) => (a.percentScore ?? 0) - (b.percentScore ?? 0))
    .slice(0, 3)
    .map((pillar) => {
      const meta = pillarSnapshots.find((row) => row.pillarCode === pillar.pillarCode);
      return meta?.pillarName ?? pillar.pillarCode;
    });

  const overallRating = getRating(overallScore);

  const executiveSummary = buildAssessmentExecutiveSummary({
    clientName: assessment.client.companyName,
    overallScore,
    overallRatingLabel: RATING_LABELS[overallRating],
    maturityTierLabel: scoring.overallMaturityLevel?.label,
    hasCriticalExposure,
    strengths,
    risks,
    topRecommendations: generatedRecommendations.slice(0, 5).map((rec) => ({
      title: rec.title,
      priority: rec.priority,
    })),
    projectedScore,
  });

  const categoryByCode = new Map(
    activeQuestions.map((question) => [question.category.code, question.category]),
  );

  await prisma.$transaction(async (tx) => {
    await tx.assessmentCategoryScore.deleteMany({ where: { assessmentId } });

    for (const pillar of scoring.pillarScores) {
      const category = categoryByCode.get(pillar.pillarCode);
      if (!category || pillar.status !== "complete" || pillar.percentScore === null) continue;

      const rating: Rating = getRating(pillar.percentScore);
      await tx.assessmentCategoryScore.create({
        data: {
          assessmentId,
          categoryId: category.id,
          pointsEarned: pillar.weightedPointsEarned,
          pointsPossible: pillar.scorableWeightTotal * 100,
          percentScore: pillar.percentScore,
          rating,
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

    await tx.assessment.update({
      where: { id: assessmentId },
      data: {
        status: "completed",
        completedAt: new Date(),
        scoringEngineVersion: "v2",
        overallScore,
        hasCriticalExposure,
        executiveSummary,
        securityScore: null,
        backupScore: null,
        infrastructureScore: null,
        endpointScore: null,
        documentationScore: null,
        bcdrScore: null,
        strategicScore: null,
      },
    });

    await tx.clientScoreHistory.create({
      data: {
        clientId: assessment.clientId,
        assessmentId,
        recordedDate: new Date(),
        overallScore,
        pillarScores: pillarSnapshots as unknown as Prisma.InputJsonValue,
      },
    });
  }, { timeout: 60_000 });

  await syncProfileFromAssessmentV2(assessmentId);

  try {
    const { materializeDraftRoadmap } = await import("@/lib/client-roadmap");
    await materializeDraftRoadmap(assessmentId);
  } catch (error) {
    console.error("Failed to materialize draft technology roadmap", error);
  }

  const recommendations = await getRecommendationsTriggeredByAssessment(assessmentId);

  const completed = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      categoryScores: { include: { category: true } },
      client: true,
      assessor: { select: { id: true, name: true, email: true } },
    },
  });

  if (!completed) throw new Error("Assessment not found after completion");

  return { ...completed, recommendations };
}

/**
 * Refreshes Technology Profile from persisted assessment / score-history snapshots.
 * Does not recalculate scores against the live question library (SS-OPT-002 DEF-008).
 */
export async function syncProfileFromAssessmentV2(assessmentId: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      categoryScores: { include: { category: true } },
    },
  });

  if (!assessment || assessment.status !== "completed") return null;

  if (assessment.overallScore === null) {
    throw new Error(
      "Cannot sync Technology Profile: completed assessment has no overall StackScore.",
    );
  }

  const overallScore = Number(assessment.overallScore);
  const maturityTier = getMaturityTier(overallScore);

  const historyRow = await prisma.clientScoreHistory.findFirst({
    where: { assessmentId },
    orderBy: { recordedDate: "desc" },
  });

  const pillarSnapshots = (historyRow?.pillarScores ?? null) as PillarScoreSnapshot[] | null;

  const { ensureTechnologyProfile } = await import("@/lib/technology-profile");
  await ensureTechnologyProfile(assessment.clientId);

  const openRecommendations = await prisma.assessmentRecommendation.findMany({
    where: {
      clientId: assessment.clientId,
      status: { in: [...ACTIVE_RECOMMENDATION_STATUSES] },
    },
    select: { priority: true },
  });

  const riskSummary = buildRiskSummaryFromPriorities(
    openRecommendations,
    assessment.hasCriticalExposure,
  );

  const history = await prisma.clientScoreHistory.findMany({
    where: { clientId: assessment.clientId },
    orderBy: { recordedDate: "desc" },
    take: 2,
  });

  let trendDirection: import("@/generated/prisma/client").TrendDirection = "stable";
  if (history.length >= 2) {
    const delta = overallScore - Number(history[1].overallScore);
    if (delta >= 3) trendDirection = "improving";
    else if (delta <= -3) trendDirection = "declining";
  }

  const nextRecommended = assessment.completedAt
    ? new Date(new Date(assessment.completedAt).setMonth(assessment.completedAt.getMonth() + 12))
    : null;

  const categoryScoresPayload = {
    pillarScores: pillarSnapshots ?? [],
    scoringEngineVersion: "v2" as const,
  };

  const profile = await prisma.technologyProfile.update({
    where: { clientId: assessment.clientId },
    data: {
      overallStackScore: overallScore,
      maturityTier,
      categoryScores: categoryScoresPayload,
      riskSummary,
      currentAssessmentId: assessment.id,
      lastAssessedAt: assessment.completedAt,
      nextRecommendedAssessmentAt: nextRecommended,
      trendDirection,
      openRecommendationCount: openRecommendations.length,
      criticalExposureCount: riskSummary.critical,
    },
  });

  await prisma.technologyProfileSnapshot.create({
    data: {
      clientId: assessment.clientId,
      technologyProfileId: profile.id,
      triggerType: "assessment_completed",
      triggerAssessmentId: assessment.id,
      snapshotAt: new Date(),
      overallStackScore: overallScore,
      maturityTier,
      categoryScores: categoryScoresPayload,
      riskSummary,
      metadata: {
        assessmentName: assessment.assessmentName,
        scoringEngineVersion: "v2",
        completePillarCount: assessment.categoryScores.length,
        source: "persisted_assessment_snapshot",
      },
    },
  });

  return profile;
}
