import { prisma } from "@/lib/db";
import { buildAssessmentExecutiveSummary } from "@/lib/assessments/executive-summary";
import { MATURITY_TIER_LABELS } from "@/lib/scoring/maturity";
import {
  collectV2TriggeredResponses,
  evaluateV2Triggers,
} from "@/lib/recommendations/v2-engine";
import { syncClientRecommendations } from "@/lib/recommendations/sync";
import { getRecommendationsTriggeredByAssessment } from "@/lib/recommendations/queries";
import { calculateProjectedScore, getRating } from "@/lib/scoring";
import { calculateProjectionImpacts } from "@/lib/recommendations";
import {
  calculateV2Scores,
  toPillarScoreSnapshots,
} from "@/lib/scoring/v2";
import type { Prisma, Rating } from "@/generated/prisma/client";
import { RATING_LABELS } from "@/lib/scoring";

/** Maps StackScore to profile maturity tier bands (DOC-113). Distinct from per-pillar DOC-119 maturity levels. */
function mapV2MaturityToProfileTier(
  score: number | null,
): import("@/generated/prisma/client").MaturityTier | null {
  if (score === null) return null;
  if (score >= 95) return "optimized";
  if (score >= 70) return "mature";
  if (score >= 55) return "developing";
  if (score >= 40) return "foundational";
  return "nascent";
}

/**
 * Completes a draft v2 assessment: scores pillars (DOC-119), evaluates triggers (DOC-152),
 * syncs client-level recommendations, records score history, and updates the Technology Profile.
 * Preserves prior completed assessments as immutable snapshots.
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
  if (assessment.responses.length === 0) {
    throw new Error("At least one question must be answered before completion");
  }

  const activeQuestions = await prisma.assessmentQuestion.findMany({
    where: { isActive: true },
    include: { category: true },
  });

  const v2Questions = activeQuestions.map((question) => ({
    id: question.code,
    pillarCode: question.category.code as import("@/lib/technology-maturity/pillars").TechnologyPillarCode,
    weight: question.weight,
  }));

  const v2Responses = assessment.responses.map((response) => ({
    questionId: response.question.code,
    answerText: response.selectedAnswerOption.answerText,
  }));

  const scoring = calculateV2Scores({
    questions: v2Questions,
    responses: v2Responses,
  });

  const pillarSnapshots = toPillarScoreSnapshots(scoring.pillarScores);
  const hasCriticalExposure = assessment.responses.some(
    (response) => response.selectedAnswerOption.triggersCriticalFlag,
  );

  const triggeredResponses = collectV2TriggeredResponses(assessment.responses);
  const generatedRecommendations = evaluateV2Triggers(triggeredResponses);
  const projectionImpact = calculateProjectionImpacts(generatedRecommendations);
  const projectedScore =
    scoring.overallStackScore !== null
      ? calculateProjectedScore(scoring.overallStackScore, [projectionImpact])
      : scoring.overallStackScore;

  const completePillars = scoring.pillarScores.filter((p) => p.status === "complete");
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

  const overallRating = scoring.overallStackScore !== null ? getRating(scoring.overallStackScore) : "critical";
  const overallScore = scoring.overallStackScore ?? 0;
  const profileMaturityTier = mapV2MaturityToProfileTier(overallScore);

  const executiveSummary = buildAssessmentExecutiveSummary({
    clientName: assessment.client.companyName,
    overallScore,
    overallRatingLabel: RATING_LABELS[overallRating],
    maturityTierLabel: profileMaturityTier
      ? MATURITY_TIER_LABELS[profileMaturityTier]
      : undefined,
    hasCriticalExposure,
    strengths,
    risks,
    topRecommendations: generatedRecommendations.slice(0, 5).map((rec) => ({
      title: rec.title,
      priority: rec.priority,
    })),
    projectedScore: projectedScore ?? 0,
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
        overallScore: scoring.overallStackScore,
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
        overallScore: scoring.overallStackScore ?? 0,
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

/** Refreshes Technology Profile KPIs, trend, and snapshot after assessment completion. */
export async function syncProfileFromAssessmentV2(assessmentId: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      categoryScores: { include: { category: true } },
      recommendations: { where: { status: { in: ["open", "accepted", "in_progress"] } } },
      responses: { include: { selectedAnswerOption: true, question: true } },
    },
  });

  if (!assessment || assessment.status !== "completed") return null;

  const activeQuestions = await prisma.assessmentQuestion.findMany({
    where: { isActive: true },
    include: { category: true },
  });

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

  const pillarSnapshots = toPillarScoreSnapshots(scoring.pillarScores);
  const overallScore = scoring.overallStackScore;
  const maturityTier = mapV2MaturityToProfileTier(overallScore);

  const { ensureTechnologyProfile } = await import("@/lib/technology-profile");
  await ensureTechnologyProfile(assessment.clientId);

  const riskSummary = {
    critical: assessment.responses.filter((r) => r.selectedAnswerOption.triggersCriticalFlag).length,
    high: 0,
    medium: 0,
    low: 0,
    criticalExposure: assessment.hasCriticalExposure,
  };

  const openRecommendationCount = await prisma.assessmentRecommendation.count({
    where: {
      clientId: assessment.clientId,
      status: { in: ["open", "accepted", "in_progress"] },
    },
  });

  const history = await prisma.clientScoreHistory.findMany({
    where: { clientId: assessment.clientId },
    orderBy: { recordedDate: "desc" },
    take: 2,
  });

  let trendDirection: import("@/generated/prisma/client").TrendDirection = "stable";
  if (history.length >= 2 && overallScore !== null) {
    const delta = overallScore - Number(history[1].overallScore);
    if (delta >= 3) trendDirection = "improving";
    else if (delta <= -3) trendDirection = "declining";
  }

  const nextRecommended = assessment.completedAt
    ? new Date(new Date(assessment.completedAt).setMonth(assessment.completedAt.getMonth() + 12))
    : null;

  const profile = await prisma.technologyProfile.update({
    where: { clientId: assessment.clientId },
    data: {
      overallStackScore: overallScore,
      maturityTier,
      categoryScores: { pillarScores: pillarSnapshots, scoringEngineVersion: "v2" },
      riskSummary,
      currentAssessmentId: assessment.id,
      lastAssessedAt: assessment.completedAt,
      nextRecommendedAssessmentAt: nextRecommended,
      trendDirection,
      openRecommendationCount,
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
      overallStackScore: overallScore ?? 0,
      maturityTier: maturityTier ?? "nascent",
      categoryScores: { pillarScores: pillarSnapshots, scoringEngineVersion: "v2" },
      riskSummary,
      metadata: {
        assessmentName: assessment.assessmentName,
        scoringEngineVersion: "v2",
        completePillarCount: scoring.completePillarCount,
      },
    },
  });

  return profile;
}
