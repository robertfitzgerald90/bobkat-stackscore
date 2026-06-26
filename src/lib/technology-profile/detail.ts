import { prisma } from "@/lib/db";
import { SCORE_HISTORY_CATEGORY_FIELDS } from "@/lib/analytics/categories";
import type { ScoreTrendPoint } from "@/lib/analytics/types";
import { formatDisplayDate } from "@/lib/display";
import { OPEN_PROJECT_STATUSES } from "@/lib/projects";
import { ensureTechnologyProfile, getTechnologyProfile } from "@/lib/technology-profile/index";
import { computeJourneyProgress } from "@/lib/technology-profile/journey";
import type {
  ProfileAudience,
  ProfileProjectSummary,
  ProfileRecommendationSummary,
  TechnologyProfileDetail,
} from "@/lib/technology-profile/types";
import type { UserRole } from "@/generated/prisma/client";
import { resolveProfileAudience } from "@/lib/technology-profile/types";

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

export async function getTechnologyProfileDetail(
  clientId: string,
  role: UserRole,
): Promise<TechnologyProfileDetail | null> {
  const audience = resolveProfileAudience(role);

  await ensureTechnologyProfile(clientId);

  const [client, profileView, scoreHistory, openRecommendations, activeProjects, completedProjects, assessmentCount] =
    await Promise.all([
      prisma.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          companyName: true,
          primaryContactName: true,
          primaryContactEmail: true,
          industry: true,
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
        include: { category: { select: { name: true } } },
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
  const currentScore = scoreTrend.at(-1)?.overallScore ?? null;
  const scoreDelta =
    initialScore !== null && currentScore !== null ? currentScore - initialScore : null;

  const recommendationSummaries: ProfileRecommendationSummary[] = openRecommendations.map(
    (recommendation) => ({
      id: recommendation.id,
      title: recommendation.title,
      priority: recommendation.priority,
      status: recommendation.status,
      estimatedImpactPoints: recommendation.estimatedImpactPoints,
      categoryName: recommendation.category.name,
      assessmentId: recommendation.assessmentId,
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

  return {
    profile: {
      id: profileView.id,
      clientId: profileView.clientId,
      overallStackScore: profileView.overallStackScore,
      maturityTier: profileView.maturityTier,
      maturityTierLabel: profileView.maturityTierLabel,
      categoryScores: profileView.categoryScores,
      v1CategoryScores: profileView.v1CategoryScores,
      riskSummary: profileView.riskSummary,
      trendDirection: profileView.trendDirection,
      lastAssessedAt: profileView.lastAssessedAt?.toISOString() ?? null,
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
  };
}
