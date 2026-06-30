import type { UserRole } from "@/generated/prisma/client";
import { SCORE_HISTORY_CATEGORY_FIELDS } from "@/lib/analytics/categories";
import type { ScoreTrendPoint } from "@/lib/analytics/types";
import { formatDisplayDate } from "@/lib/display";
import { prisma } from "@/lib/db";
import { OPEN_PROJECT_STATUSES } from "@/lib/projects";
import { ensureTechnologyProfile, getTechnologyProfile } from "@/lib/technology-profile/index";
import { computeJourneyProgress } from "@/lib/technology-profile/journey";
import {
  buildBusinessSnapshot,
  buildCategoryInsights,
  buildProfileDocuments,
  buildRoadmapPreview,
  computeJourneyScores,
  computeScoreDeltaSincePrevious,
  deriveNextRecommendedAction,
  projectScoreFromRecommendations,
  resolveProfileCapabilities,
} from "@/lib/technology-profile/overview";
import type {
  ProfileAudience,
  ProfileProjectSummary,
  ProfileRecommendationSummary,
  ProfileTipSummary,
  TechnologyProfileDetail,
} from "@/lib/technology-profile/types";
import { resolveProfileAudience } from "@/lib/technology-profile/types";
import {
  resolveProfileSectionVisibility,
  trimBusinessSnapshotForClient,
} from "@/lib/technology-profile/visibility";
import { getClientJourneyTimeline } from "@/lib/technology-profile/timeline-build";
import { buildPillarInsights } from "@/lib/technology-maturity/pillars";
import {
  computeTipDerivedState,
  parseWizardState,
  syncWizardStateAfterSelectionChange,
  type RecommendationSeed,
} from "@/lib/technology-improvement-plan/selection";

function roundScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value));
}

function filterProjectForAudience(
  project: ProfileProjectSummary,
  audience: ProfileAudience,
  role: UserRole,
): ProfileProjectSummary {
  if (audience === "client" || role === "technician") {
    return { ...project, estimatedCost: null };
  }
  return project;
}

function toRecommendationSeeds(
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    businessImpact: string;
    priority: ProfileRecommendationSummary["priority"];
    suggestedService: string | null;
    estimatedImpactPoints: number;
    category: { name: string };
  }>,
): RecommendationSeed[] {
  return recommendations.map((recommendation) => ({
    id: recommendation.id,
    title: recommendation.title,
    description: recommendation.description,
    businessImpact: recommendation.businessImpact,
    priority: recommendation.priority,
    suggestedService: recommendation.suggestedService,
    estimatedImpactPoints: recommendation.estimatedImpactPoints,
    categoryName: recommendation.category.name,
  }));
}

function resolveActiveTipContext(input: {
  tip: {
    id: string;
    title: string;
    status: string;
    currentStep: ProfileTipSummary["currentStep"];
    wizardState: unknown;
  } | null;
  openRecommendations: Array<{
    id: string;
    title: string;
    description: string;
    businessImpact: string;
    priority: ProfileRecommendationSummary["priority"];
    suggestedService: string | null;
    estimatedImpactPoints: number;
    category: { name: string };
  }>;
  currentScore: number | null;
}): {
  activeTip: ProfileTipSummary | null;
  roadmapPreview: ReturnType<typeof buildRoadmapPreview>;
  projectedScore: number | null;
  longTermTargetScore: number | null;
} {
  if (!input.tip) {
    return {
      activeTip: null,
      roadmapPreview: [],
      projectedScore: null,
      longTermTargetScore: null,
    };
  }

  const wizardState = parseWizardState(input.tip.wizardState);
  const seeds = toRecommendationSeeds(input.openRecommendations);
  const syncedState = syncWizardStateAfterSelectionChange(seeds, wizardState);
  const derived = computeTipDerivedState(seeds, syncedState, input.currentScore ?? 0);

  return {
    activeTip: {
      id: input.tip.id,
      title: input.tip.title,
      status: input.tip.status,
      currentStep: input.tip.currentStep,
      projectedScore: derived.projectedScore,
    },
    roadmapPreview: buildRoadmapPreview(derived.roadmapPhases),
    projectedScore: derived.projectedScore,
    longTermTargetScore: derived.projectedScore,
  };
}

export async function getTechnologyProfileDetail(
  clientId: string,
  role: UserRole,
): Promise<TechnologyProfileDetail | null> {
  const audience = resolveProfileAudience(role);
  const capabilities = resolveProfileCapabilities(role);

  await ensureTechnologyProfile(clientId);

  const [
    client,
    profileView,
    scoreHistory,
    openRecommendations,
    activeProjects,
    completedProjects,
    assessmentCount,
    draftAssessment,
    documents,
    activeTipRecord,
  ] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        companyName: true,
        primaryContactName: true,
        primaryContactEmail: true,
        primaryContactPhone: true,
        primaryContactTitle: true,
        industry: true,
        employeeCount: true,
        numberOfLocations: true,
        primaryBusinessGoal: true,
        technologyVision: true,
        itSupportModel: true,
        environmentType: true,
        complianceFramework: true,
        complianceDetails: true,
        status: true,
      },
    }),
    getTechnologyProfile(clientId),
    prisma.clientScoreHistory.findMany({
      where: { clientId },
      orderBy: { recordedDate: "asc" },
      include: { assessment: { select: { assessmentName: true } } },
    }),
    prisma.assessmentRecommendation.findMany({
      where: {
        clientId,
        status: { in: ["open", "accepted", "in_progress"] },
      },
      orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }],
      take: audience === "client" ? 10 : 25,
      include: { category: { select: { name: true, code: true } } },
    }),
    prisma.project.findMany({
      where: { clientId, status: { in: OPEN_PROJECT_STATUSES } },
      orderBy: { updatedAt: "desc" },
      include: { recommendation: { select: { title: true } } },
    }),
    prisma.project.findMany({
      where: { clientId, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: { recommendation: { select: { title: true } } },
    }),
    prisma.assessment.count({
      where: { clientId, status: "completed" },
    }),
    prisma.assessment.findFirst({
      where: { clientId, status: "draft" },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    }),
    prisma.document.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        documentType: true,
        createdAt: true,
        assessmentId: true,
        tipId: true,
        fileUrl: true,
      },
    }),
    prisma.technologyImprovementPlan.findFirst({
      where: {
        clientId,
        OR: [{ status: "draft" }, { currentStep: { not: "complete" } }],
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        currentStep: true,
        wizardState: true,
      },
    }),
  ]);

  if (!client || !profileView) return null;

  const scoreTrend: ScoreTrendPoint[] = scoreHistory.map((entry) => {
    const categories: Record<string, number | null> = {};
    for (const category of SCORE_HISTORY_CATEGORY_FIELDS) {
      categories[category.code] = roundScore(entry[category.field]);
    }
    return {
      date: entry.recordedDate.toISOString(),
      dateLabel: formatDisplayDate(entry.recordedDate),
      overallScore: roundScore(entry.overallScore) ?? 0,
      assessmentId: entry.assessmentId,
      assessmentName: entry.assessment?.assessmentName ?? null,
      categories,
    };
  });

  const initialScore = scoreTrend[0]?.overallScore ?? null;
  const currentScore = profileView.overallStackScore ?? scoreTrend.at(-1)?.overallScore ?? null;
  const scoreDelta =
    initialScore !== null && currentScore !== null ? currentScore - initialScore : null;
  const scoreDeltaSincePrevious = computeScoreDeltaSincePrevious(scoreTrend);

  const recommendationSummaries: ProfileRecommendationSummary[] = openRecommendations.map(
    (recommendation) => ({
      id: recommendation.id,
      title: recommendation.title,
      priority: recommendation.priority,
      status: recommendation.status,
      estimatedImpactPoints: recommendation.estimatedImpactPoints,
      businessImpact: recommendation.businessImpact,
      categoryName: recommendation.category.name,
      categoryCode: recommendation.category.code,
      assessmentId: recommendation.assessmentId,
      latestAssessmentId: recommendation.latestAssessmentId,
      triggeredInLatestAssessment: recommendation.triggeredInLatestAssessment,
      isRecurrence: recommendation.isRecurrence,
    }),
  );

  const mapProject = (project: (typeof activeProjects)[number]): ProfileProjectSummary =>
    filterProjectForAudience(
      {
        id: project.id,
        title: project.title,
        status: project.status,
        priority: project.priority,
        estimatedImpactPoints: project.estimatedImpactPoints,
        actualImpactPoints: project.actualImpactPoints,
        estimatedCost: project.estimatedCost ? Number(project.estimatedCost) : null,
        completedAt: project.completedAt?.toISOString() ?? null,
        recommendationTitle: project.recommendation?.title ?? null,
      },
      audience,
      role,
    );

  const journey = computeJourneyProgress({
    assessmentsCompleted: assessmentCount,
    openRecommendations: recommendationSummaries.length,
    activeProjects: activeProjects.length,
    completedProjects: completedProjects.length,
    scoreDelta,
  });

  const tipContext = resolveActiveTipContext({
    tip: activeTipRecord,
    openRecommendations,
    currentScore: currentScore,
  });

  const fallbackProjectedScore = projectScoreFromRecommendations(
    currentScore,
    recommendationSummaries,
  );

  const projectedScore = tipContext.projectedScore ?? fallbackProjectedScore;
  const longTermTargetScore = tipContext.longTermTargetScore ?? fallbackProjectedScore;

  const businessSnapshot = buildBusinessSnapshot({
    industry: client.industry,
    employeeCount: client.employeeCount,
    numberOfLocations: client.numberOfLocations,
    primaryBusinessGoal: client.primaryBusinessGoal,
    technologyVision: client.technologyVision,
    itSupportModel: client.itSupportModel,
    environmentType: client.environmentType,
    complianceFramework: client.complianceFramework,
    complianceDetails: client.complianceDetails,
    primaryContactName: client.primaryContactName,
    primaryContactTitle: client.primaryContactTitle,
    primaryContactEmail: client.primaryContactEmail,
    primaryContactPhone: client.primaryContactPhone,
  });

  const journeyScores = computeJourneyScores({
    scoreTrend,
    currentScore,
    projectedScore,
    longTermTargetScore,
  });

  const categoryInsights = buildCategoryInsights({
    categoryScores: profileView.categoryScores,
    scoreHistory,
    openRecommendations: recommendationSummaries,
  });

  const pillarInsights = buildPillarInsights({
    v1CategoryScores: profileView.v1CategoryScores,
    pillarSnapshots: profileView.pillarSnapshots ?? undefined,
    scoreHistory: scoreHistory.map((entry) => ({
      pillarScores: entry.pillarScores,
    })),
    openRecommendations: recommendationSummaries,
  });

  const nextAction = deriveNextRecommendedAction({
    clientId,
    assessmentsCompleted: assessmentCount,
    draftAssessmentId: draftAssessment?.id ?? null,
    openRecommendations: recommendationSummaries.length,
    activeProjects: activeProjects.length,
    activeTipId: tipContext.activeTip?.id ?? null,
    activeTipStep: tipContext.activeTip?.currentStep ?? null,
    nextRecommendedAssessmentAt:
      profileView.nextRecommendedAssessmentAt?.toISOString() ?? null,
    journeyPhase: journey.phase,
  });

  const lastAssessedAt = profileView.lastAssessedAt?.toISOString() ?? null;
  const allDocuments = buildProfileDocuments({
    clientId,
    currentAssessmentId: profileView.currentAssessmentId,
    lastAssessedAt,
    documents,
  });
  const profileDocuments = capabilities.canViewInternalDocuments
    ? allDocuments
    : allDocuments.filter(
        (document) =>
          document.documentType === "technology_improvement_plan" ||
          document.documentType === "quarterly_business_review" ||
          document.id.startsWith("assessment-report-"),
      );

  const sections = resolveProfileSectionVisibility(role, capabilities);
  const journeyTimeline = audience === "internal" ? await getClientJourneyTimeline(clientId) : [];

  const baseDetail: TechnologyProfileDetail = {
    profile: {
      id: profileView.id,
      clientId: profileView.clientId,
      overallStackScore: profileView.overallStackScore,
      maturityTier: profileView.maturityTier,
      maturityTierLabel: profileView.maturityTierLabel,
      categoryScores: profileView.categoryScores,
      pillarSnapshots: profileView.pillarSnapshots,
      scoringEngineVersion: profileView.scoringEngineVersion,
      v1CategoryScores: profileView.v1CategoryScores,
      riskSummary: profileView.riskSummary,
      trendDirection: profileView.trendDirection,
      lastAssessedAt,
      nextRecommendedAssessmentAt:
        profileView.nextRecommendedAssessmentAt?.toISOString() ?? null,
      currentAssessmentId: profileView.currentAssessmentId,
      openRecommendationCount: recommendationSummaries.length,
      criticalExposureCount: profileView.criticalExposureCount,
    },
    client: {
      id: client.id,
      companyName: client.companyName,
      primaryContactName: client.primaryContactName,
      primaryContactEmail: client.primaryContactEmail,
      industry: client.industry,
      status: client.status,
    },
    scoreTrend,
    openRecommendations: recommendationSummaries,
    activeProjects: activeProjects.map(mapProject),
    completedProjects: completedProjects.map(mapProject),
    journey,
    audience,
    capabilities,
    businessSnapshot,
    journeyScores,
    nextAction,
    categoryInsights,
    pillarInsights,
    roadmapPreview: tipContext.roadmapPreview,
    documents: profileDocuments,
    activeTip: tipContext.activeTip,
    scoreDeltaSincePrevious,
    sections,
    journeyTimeline,
  };

  if (audience === "client") {
    return {
      ...baseDetail,
      openRecommendations: [],
      activeProjects: [],
      completedProjects: [],
      activeTip: null,
      roadmapPreview: [],
      businessSnapshot: trimBusinessSnapshotForClient(businessSnapshot),
      profile: {
        ...baseDetail.profile,
        openRecommendationCount: 0,
      },
      categoryInsights: categoryInsights.map((insight) => ({
        ...insight,
        openRecommendationCount: 0,
      })),
      pillarInsights: pillarInsights.map((insight) => ({
        ...insight,
        openRecommendationCount: 0,
      })),
      journeyTimeline: [],
    };
  }

  return baseDetail;
}
