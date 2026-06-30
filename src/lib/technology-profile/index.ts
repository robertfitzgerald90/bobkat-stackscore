import { prisma } from "@/lib/db";
import {
  aggregateV2CategoryScores,
  calculateV2OverallScore,
  type V2CategoryScore,
} from "@/lib/assessment-library/category-mapping";
import type { CategoryScoreResult, ScoringResult } from "@/lib/scoring";
import { getMaturityTier, MATURITY_TIER_LABELS } from "@/lib/scoring/maturity";
import type {
  MaturityTier,
  Prisma,
  ProfileSnapshotTrigger,
  RiskLevel,
  TrendDirection,
} from "@/generated/prisma/client";

export type RiskSummary = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  criticalExposure: boolean;
};

export type TechnologyProfileView = {
  id: string;
  clientId: string;
  overallStackScore: number | null;
  maturityTier: MaturityTier | null;
  maturityTierLabel: string | null;
  categoryScores: V2CategoryScore[];
  v1CategoryScores: CategoryScoreResult[];
  riskSummary: RiskSummary;
  trendDirection: TrendDirection | null;
  lastAssessedAt: Date | null;
  nextRecommendedAssessmentAt: Date | null;
  currentAssessmentId: string | null;
  openRecommendationCount: number;
  criticalExposureCount: number;
};

const REASSESSMENT_INTERVAL_MONTHS = 12;

export async function ensureTechnologyProfile(clientId: string) {
  const existing = await prisma.technologyProfile.findUnique({ where: { clientId } });
  if (existing) return existing;

  return prisma.technologyProfile.create({
    data: { clientId },
  });
}

export async function backfillTechnologyProfiles() {
  const clients = await prisma.client.findMany({
    where: { technologyProfile: null },
    select: { id: true },
  });

  for (const client of clients) {
    await ensureTechnologyProfile(client.id);
  }

  const clientsWithCompleted = await prisma.client.findMany({
    where: {
      assessments: { some: { status: "completed" } },
    },
    select: { id: true },
  });

  for (const client of clientsWithCompleted) {
    const latest = await prisma.assessment.findFirst({
      where: { clientId: client.id, status: "completed" },
      orderBy: { completedAt: "desc" },
    });
    if (latest) {
      await syncProfileFromAssessment(latest.id);
    }
  }
}

export async function syncProfileFromAssessment(assessmentId: string) {
  const assessmentMeta = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { scoringEngineVersion: true, status: true },
  });

  if (!assessmentMeta || assessmentMeta.status !== "completed") return null;

  if (assessmentMeta.scoringEngineVersion === "v2") {
    const { syncProfileFromAssessmentV2 } = await import("@/lib/assessments/complete-v2");
    return syncProfileFromAssessmentV2(assessmentId);
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      categoryScores: { include: { category: true } },
      recommendations: { where: { status: { in: ["open", "accepted", "in_progress"] } } },
      responses: { include: { selectedAnswerOption: true, question: true } },
    },
  });

  if (!assessment || assessment.status !== "completed") return null;

  await ensureTechnologyProfile(assessment.clientId);

  const v1CategoryScores: CategoryScoreResult[] = assessment.categoryScores.map((cs) => ({
    categoryId: cs.categoryId,
    categoryCode: cs.category.code,
    categoryName: cs.category.name,
    pointsEarned: Number(cs.pointsEarned),
    pointsPossible: Number(cs.pointsPossible),
    percentScore: Number(cs.percentScore),
    rating: cs.rating,
    weightedContribution: 0,
  }));

  const v2Scores = aggregateV2CategoryScores(v1CategoryScores);
  const overallScore = Number(assessment.overallScore ?? 0);
  const maturityTier = getMaturityTier(overallScore);
  const riskSummary = buildRiskSummary(assessment.responses, assessment.hasCriticalExposure);
  const trendDirection = await calculateTrendDirection(
    assessment.clientId,
    overallScore,
  );

  const openRecommendationCount = await prisma.assessmentRecommendation.count({
    where: {
      clientId: assessment.clientId,
      status: { in: ["open", "accepted", "in_progress"] },
    },
  });
  const criticalExposureCount = assessment.responses.filter(
    (r) => r.selectedAnswerOption.triggersCriticalFlag,
  ).length;

  const nextRecommended = assessment.completedAt
    ? addMonths(assessment.completedAt, REASSESSMENT_INTERVAL_MONTHS)
    : null;

  const profile = await prisma.technologyProfile.update({
    where: { clientId: assessment.clientId },
    data: {
      overallStackScore: overallScore,
      maturityTier,
      categoryScores: v2Scores,
      riskSummary,
      currentAssessmentId: assessment.id,
      lastAssessedAt: assessment.completedAt,
      nextRecommendedAssessmentAt: nextRecommended,
      trendDirection,
      openRecommendationCount,
      criticalExposureCount,
    },
  });

  await createProfileSnapshot({
    clientId: assessment.clientId,
    technologyProfileId: profile.id,
    triggerType: "assessment_completed",
    triggerAssessmentId: assessment.id,
    overallStackScore: overallScore,
    maturityTier,
    categoryScores: v2Scores,
    riskSummary,
    metadata: {
      assessmentName: assessment.assessmentName,
      assessmentType: assessment.assessmentType,
      v1OverallScore: overallScore,
      v2OverallScore: calculateV2OverallScore(v2Scores),
    },
  });

  return profile;
}

async function createProfileSnapshot(input: {
  clientId: string;
  technologyProfileId: string;
  triggerType: ProfileSnapshotTrigger;
  triggerAssessmentId?: string;
  overallStackScore: number;
  maturityTier: MaturityTier;
  categoryScores: V2CategoryScore[];
  riskSummary: RiskSummary;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.technologyProfileSnapshot.create({
    data: {
      clientId: input.clientId,
      technologyProfileId: input.technologyProfileId,
      triggerType: input.triggerType,
      triggerAssessmentId: input.triggerAssessmentId,
      snapshotAt: new Date(),
      overallStackScore: input.overallStackScore,
      maturityTier: input.maturityTier,
      categoryScores: input.categoryScores,
      riskSummary: input.riskSummary,
      metadata: input.metadata,
    },
  });
}

function buildRiskSummary(
  responses: Array<{
    question: { riskLevel: string };
    selectedAnswerOption: { triggersCriticalFlag: boolean };
  }>,
  hasCriticalExposure: boolean,
): RiskSummary {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };

  for (const response of responses) {
    if (response.selectedAnswerOption.triggersCriticalFlag) {
      counts.critical += 1;
      continue;
    }
    const level = response.question.riskLevel;
    if (level === "critical") counts.critical += 1;
    else if (level === "high") counts.high += 1;
    else if (level === "medium") counts.medium += 1;
    else counts.low += 1;
  }

  return { ...counts, criticalExposure: hasCriticalExposure };
}

async function calculateTrendDirection(
  clientId: string,
  currentScore: number,
): Promise<TrendDirection> {
  const history = await prisma.clientScoreHistory.findMany({
    where: { clientId },
    orderBy: { recordedDate: "desc" },
    take: 2,
  });

  if (history.length < 2) return "stable";

  const previous = Number(history[1].overallScore);
  const delta = currentScore - previous;

  if (delta >= 3) return "improving";
  if (delta <= -3) return "declining";
  return "stable";
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export async function getTechnologyProfile(
  clientId: string,
): Promise<TechnologyProfileView | null> {
  const profile = await prisma.technologyProfile.findUnique({
    where: { clientId },
    include: {
      currentAssessment: {
        include: {
          categoryScores: { include: { category: true } },
        },
      },
    },
  });

  if (!profile) return null;

  const v1CategoryScores: CategoryScoreResult[] =
    profile.currentAssessment?.categoryScores.map((cs) => ({
      categoryId: cs.categoryId,
      categoryCode: cs.category.code,
      categoryName: cs.category.name,
      pointsEarned: Number(cs.pointsEarned),
      pointsPossible: Number(cs.pointsPossible),
      percentScore: Number(cs.percentScore),
      rating: cs.rating,
      weightedContribution: 0,
    })) ?? [];

  const categoryScores =
    (profile.categoryScores as V2CategoryScore[] | null) ??
    aggregateV2CategoryScores(v1CategoryScores);

  const riskSummary = (profile.riskSummary as RiskSummary | null) ?? {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    criticalExposure: false,
  };

  return {
    id: profile.id,
    clientId: profile.clientId,
    overallStackScore: profile.overallStackScore
      ? Number(profile.overallStackScore)
      : null,
    maturityTier: profile.maturityTier,
    maturityTierLabel: profile.maturityTier
      ? MATURITY_TIER_LABELS[profile.maturityTier]
      : null,
    categoryScores,
    v1CategoryScores,
    riskSummary,
    trendDirection: profile.trendDirection,
    lastAssessedAt: profile.lastAssessedAt,
    nextRecommendedAssessmentAt: profile.nextRecommendedAssessmentAt,
    currentAssessmentId: profile.currentAssessmentId,
    openRecommendationCount: profile.openRecommendationCount,
    criticalExposureCount: profile.criticalExposureCount,
  };
}

export function buildScoringRiskSummary(
  scoring: ScoringResult,
  responses: Array<{
    question: { riskLevel: RiskLevel };
    selectedAnswerOption: { triggersCriticalFlag: boolean };
  }>,
): RiskSummary {
  return buildRiskSummary(responses, scoring.hasCriticalExposure);
}

export { getTechnologyProfileDetail } from "./detail";
export { computeJourneyProgress, deriveJourneyPhase } from "./journey";
export {
  buildBusinessSnapshot,
  buildCategoryInsights,
  buildProfileDocuments,
  buildRoadmapPreview,
  computeJourneyScores,
  computeScoreDeltaSincePrevious,
  countRecommendationsByV2Category,
  deriveNextRecommendedAction,
  formatComplianceStatus,
  projectScoreFromRecommendations,
  resolveProfileCapabilities,
} from "./overview";
export type {
  CategoryScoreInsight,
  NextRecommendedAction,
  ProfileAudience,
  ProfileBusinessSnapshot,
  ProfileCapabilities,
  ProfileDocumentSummary,
  ProfileTipSummary,
  RoadmapPhasePreview,
  TechnologyJourneyProgress,
  TechnologyJourneyScores,
  TechnologyProfileDetail,
  ProfileSectionVisibility,
} from "./types";
export {
  resolveProfileSectionVisibility,
  trimBusinessSnapshotForClient,
} from "./visibility";
export { hasAnyCategoryScore, isBusinessSnapshotSparse } from "./display";
export { resolveProfileAudience } from "./types";
