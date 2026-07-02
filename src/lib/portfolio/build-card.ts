import type { MaturityTier, Priority, ProjectStatus, RecommendationStatus } from "@/generated/prisma/client";
import { MATURITY_TIER_LABELS, getMaturityTierLabel } from "@/lib/scoring/maturity";
import { projectScoreFromRecommendations } from "@/lib/technology-profile/overview";
import { countImmediateFocusItems } from "@/lib/portfolio/immediate-focus";
import {
  ACTIVE_PROJECT_STATUSES,
  OPEN_PROJECT_STATUSES,
  PORTFOLIO_OPEN_RECOMMENDATION_STATUSES,
  PORTFOLIO_URGENT_PRIORITIES,
} from "@/lib/portfolio/constants";
import {
  evaluatePortfolioReadiness,
  isActionableProjectStatus,
  isBlockedProjectStatus,
} from "@/lib/portfolio/readiness";
import { calculateRecommendedSortScore, daysSince } from "@/lib/portfolio/sort-score";
import type { PortfolioClientCard, PortfolioScoreTrendPoint } from "@/lib/portfolio/types";

export type PortfolioRecommendationRow = {
  id: string;
  priority: Priority;
  status: RecommendationStatus;
  estimatedImpactPoints: number;
  businessImpact: string;
  title: string;
  categoryCode: string;
  categoryName: string;
  projectStatus: ProjectStatus | null;
};

export type PortfolioProjectRow = {
  status: ProjectStatus;
  completedAt: Date | null;
};

export type BuildPortfolioCardInput = {
  clientId: string;
  companyName: string;
  overallStackScore: number | null;
  maturityTier: MaturityTier | null;
  lastAssessedAt: Date | null;
  nextRecommendedAssessmentAt: Date | null;
  scoreTrend: PortfolioScoreTrendPoint[];
  recommendations: PortfolioRecommendationRow[];
  projects: PortfolioProjectRow[];
  draftAssessmentId: string | null;
  lastImprovementAt: Date | null;
  now?: Date;
};

function roundScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value));
}

function openRecommendations(recommendations: PortfolioRecommendationRow[]) {
  return recommendations.filter((row) =>
    PORTFOLIO_OPEN_RECOMMENDATION_STATUSES.includes(row.status),
  );
}

function countActionableAndBlockedRecommendations(recommendations: PortfolioRecommendationRow[]) {
  let actionableRecommendationsCount = 0;
  let blockedRecommendationsCount = 0;

  for (const recommendation of openRecommendations(recommendations)) {
    if (recommendation.projectStatus === null) {
      actionableRecommendationsCount += 1;
      continue;
    }

    if (isActionableProjectStatus(recommendation.projectStatus)) {
      actionableRecommendationsCount += 1;
      continue;
    }

    if (isBlockedProjectStatus(recommendation.projectStatus)) {
      blockedRecommendationsCount += 1;
    }
  }

  return { actionableRecommendationsCount, blockedRecommendationsCount };
}

export function buildPortfolioClientCard(input: BuildPortfolioCardInput): PortfolioClientCard {
  const now = input.now ?? new Date();
  const openRecs = openRecommendations(input.recommendations);
  const openProjects = input.projects.filter((project) =>
    OPEN_PROJECT_STATUSES.includes(project.status),
  );
  const activeProjects = openProjects.filter((project) =>
    ACTIVE_PROJECT_STATUSES.includes(project.status),
  );
  const proposedProjects = openProjects.filter((project) => project.status === "proposed");

  const criticalRecommendationsCount = openRecs.filter(
    (recommendation) => recommendation.priority === "critical",
  ).length;

  const highPriorityRecommendationsCount = openRecs.filter((recommendation) =>
    PORTFOLIO_URGENT_PRIORITIES.includes(recommendation.priority),
  ).length;

  const { actionableRecommendationsCount, blockedRecommendationsCount } =
    countActionableAndBlockedRecommendations(input.recommendations);

  const isReassessmentOverdue =
    input.nextRecommendedAssessmentAt !== null &&
    input.nextRecommendedAssessmentAt.getTime() <= now.getTime();

  const currentStackScore = roundScore(input.overallStackScore);

  const projectedStackScore = projectScoreFromRecommendations(
    currentStackScore,
    openRecs.map((recommendation) => ({
      id: recommendation.id,
      title: recommendation.title,
      businessImpact: recommendation.businessImpact,
      priority: recommendation.priority,
      status: recommendation.status,
      estimatedImpactPoints: recommendation.estimatedImpactPoints,
      categoryName: recommendation.categoryName,
      categoryCode: recommendation.categoryCode,
      assessmentId: "",
    })),
  );

  const readinessStatus = evaluatePortfolioReadiness({
    openRecommendationsCount: openRecs.length,
    openProjectsCount: openProjects.length,
    activeProjectsCount: activeProjects.length,
    proposedProjectsCount: proposedProjects.length,
    actionableRecommendationsCount,
    blockedRecommendationsCount,
    criticalRecommendationsCount,
    highPriorityRecommendationsCount,
    hasDraftAssessment: input.draftAssessmentId !== null,
    isReassessmentOverdue,
  });

  const immediateFocusCount = countImmediateFocusItems({
    recommendations: input.recommendations,
    hasDraftAssessment: input.draftAssessmentId !== null,
    isReassessmentOverdue,
  });

  const projectedImprovement =
    currentStackScore !== null && projectedStackScore !== null
      ? projectedStackScore - currentStackScore
      : null;

  const recommendedSortScore = calculateRecommendedSortScore({
    readinessStatus,
    criticalRecommendationsCount,
    projectedImprovement,
    openProjectsCount: openProjects.length,
    daysSinceLastAssessment: daysSince(input.lastAssessedAt, now),
    daysSinceLastImprovement: daysSince(input.lastImprovementAt, now),
  });

  const maturityStatus = input.maturityTier
    ? MATURITY_TIER_LABELS[input.maturityTier]
    : currentStackScore !== null
      ? getMaturityTierLabel(currentStackScore)
      : null;

  return {
    clientId: input.clientId,
    companyName: input.companyName,
    currentStackScore,
    projectedStackScore,
    maturityStatus,
    maturityTier: input.maturityTier,
    scoreTrend: input.scoreTrend,
    openProjectsCount: openProjects.length,
    criticalRecommendationsCount,
    immediateFocusCount,
    readinessStatus,
    lastAssessmentDate: input.lastAssessedAt?.toISOString() ?? null,
    recommendedSortScore,
  };
}
