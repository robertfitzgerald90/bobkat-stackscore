import type { Rating } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { countDashboardActiveProjects } from "@/lib/dashboard/count-active-projects";
import type { DashboardClientRow, DashboardSummary } from "@/lib/dashboard/types";
import {
  buildPortfolioClientCard,
  type PortfolioProjectRow,
  type PortfolioRecommendationRow,
} from "@/lib/portfolio/build-card";
import {
  PORTFOLIO_OPEN_RECOMMENDATION_STATUSES,
  PORTFOLIO_SPARKLINE_POINT_COUNT,
} from "@/lib/portfolio/constants";
import { getRating } from "@/lib/scoring";
import type { PortfolioScoreTrendPoint } from "@/lib/portfolio/types";

const EMPTY_DISTRIBUTION: Record<Rating, number> = {
  exceptional: 0,
  strong: 0,
  stable: 0,
  at_risk: 0,
  critical: 0,
};

function roundScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value));
}

function groupScoreHistoryByClient(
  rows: Array<{
    clientId: string;
    recordedDate: Date;
    overallScore: unknown;
  }>,
): Map<string, PortfolioScoreTrendPoint[]> {
  const grouped = new Map<string, PortfolioScoreTrendPoint[]>();

  for (const row of rows) {
    const score = roundScore(row.overallScore);
    if (score === null) continue;

    const points = grouped.get(row.clientId) ?? [];
    if (points.length >= PORTFOLIO_SPARKLINE_POINT_COUNT) continue;

    points.push({
      date: row.recordedDate.toISOString(),
      score,
    });
    grouped.set(row.clientId, points);
  }

  for (const [clientId, points] of grouped) {
    grouped.set(clientId, [...points].reverse());
  }

  return grouped;
}

function latestImprovementAt(
  completedProjects: Array<{ clientId: string; completedAt: Date | null }>,
  completedRecommendations: Array<{ clientId: string; completedAt: Date | null }>,
  clientId: string,
): Date | null {
  const dates: Date[] = [];
  for (const row of completedProjects) {
    if (row.clientId === clientId && row.completedAt) dates.push(row.completedAt);
  }
  for (const row of completedRecommendations) {
    if (row.clientId === clientId && row.completedAt) dates.push(row.completedAt);
  }
  if (dates.length === 0) return null;
  return dates.reduce((latest, date) => (date.getTime() > latest.getTime() ? date : latest));
}

export type DashboardSummaryOptions = {
  now?: Date;
};

export async function getDashboardSummary(
  options: DashboardSummaryOptions = {},
): Promise<DashboardSummary> {
  const now = options.now ?? new Date();

  const clients = await prisma.client.findMany({
    where: { status: { not: "archived" } },
    orderBy: { companyName: "asc" },
    select: {
      id: true,
      companyName: true,
      technologyProfile: {
        select: {
          overallStackScore: true,
          maturityTier: true,
          lastAssessedAt: true,
          nextRecommendedAssessmentAt: true,
        },
      },
      assessments: {
        where: { status: "completed", overallScore: { not: null } },
        orderBy: { completedAt: "desc" },
        take: 2,
        select: { overallScore: true },
      },
    },
  });

  const [
    openRecommendationsCount,
    activeProjectsCount,
    recommendationRows,
    projectRows,
    draftAssessments,
    scoreHistoryRows,
    completedProjects,
    completedRecommendations,
  ] = await Promise.all([
    prisma.assessmentRecommendation.count({
      where: { status: { in: [...PORTFOLIO_OPEN_RECOMMENDATION_STATUSES] } },
    }),
    countDashboardActiveProjects(),
    clients.length === 0
      ? Promise.resolve([])
      : prisma.assessmentRecommendation.findMany({
          where: { clientId: { in: clients.map((client) => client.id) } },
          select: {
            id: true,
            clientId: true,
            priority: true,
            status: true,
            estimatedImpactPoints: true,
            businessImpact: true,
            title: true,
            category: { select: { code: true, name: true } },
            project: { select: { status: true } },
          },
        }),
    clients.length === 0
      ? Promise.resolve([])
      : prisma.project.findMany({
          where: { clientId: { in: clients.map((client) => client.id) } },
          select: {
            clientId: true,
            status: true,
            completedAt: true,
          },
        }),
    clients.length === 0
      ? Promise.resolve([])
      : prisma.assessment.findMany({
          where: {
            clientId: { in: clients.map((client) => client.id) },
            status: "draft",
          },
          select: { clientId: true, id: true },
          orderBy: { updatedAt: "desc" },
        }),
    clients.length === 0
      ? Promise.resolve([])
      : prisma.clientScoreHistory.findMany({
          where: { clientId: { in: clients.map((client) => client.id) } },
          orderBy: { recordedDate: "desc" },
          select: {
            clientId: true,
            recordedDate: true,
            overallScore: true,
          },
        }),
    clients.length === 0
      ? Promise.resolve([])
      : prisma.project.findMany({
          where: {
            clientId: { in: clients.map((client) => client.id) },
            status: "completed",
            completedAt: { not: null },
          },
          select: { clientId: true, completedAt: true },
        }),
    clients.length === 0
      ? Promise.resolve([])
      : prisma.assessmentRecommendation.findMany({
          where: {
            clientId: { in: clients.map((client) => client.id) },
            status: "completed",
            completedAt: { not: null },
          },
          select: { clientId: true, completedAt: true },
        }),
  ]);

  const recommendationsByClient = new Map<string, PortfolioRecommendationRow[]>();
  for (const row of recommendationRows) {
    const list = recommendationsByClient.get(row.clientId) ?? [];
    list.push({
      id: row.id,
      priority: row.priority,
      status: row.status,
      estimatedImpactPoints: row.estimatedImpactPoints,
      businessImpact: row.businessImpact,
      title: row.title,
      categoryCode: row.category.code,
      categoryName: row.category.name,
      projectStatus: row.project?.status ?? null,
    });
    recommendationsByClient.set(row.clientId, list);
  }

  const projectsByClient = new Map<string, PortfolioProjectRow[]>();
  for (const row of projectRows) {
    const list = projectsByClient.get(row.clientId) ?? [];
    list.push({ status: row.status, completedAt: row.completedAt });
    projectsByClient.set(row.clientId, list);
  }

  const draftByClient = new Map<string, string>();
  for (const row of draftAssessments) {
    if (!draftByClient.has(row.clientId)) {
      draftByClient.set(row.clientId, row.id);
    }
  }

  const scoreHistoryByClient = groupScoreHistoryByClient(scoreHistoryRows);

  const clientRows: DashboardClientRow[] = [];
  const scoreDistribution = { ...EMPTY_DISTRIBUTION };
  let immediateFocusTotal = 0;
  let criticalRecommendationsCount = 0;
  let clientsImprovingCount = 0;
  let clientsDecliningCount = 0;
  let portfolioTrendSum = 0;
  let portfolioTrendCount = 0;

  for (const client of clients) {
    const latest = client.assessments[0];
    const previous = client.assessments[1];
    const score = roundScore(latest?.overallScore);
    const scoreChange =
      latest?.overallScore != null && previous?.overallScore != null
        ? roundScore(latest.overallScore)! - roundScore(previous.overallScore)!
        : null;

    if (scoreChange !== null) {
      portfolioTrendSum += scoreChange;
      portfolioTrendCount += 1;
      if (scoreChange > 0) clientsImprovingCount += 1;
      if (scoreChange < 0) clientsDecliningCount += 1;
    }

    const rating = score !== null ? getRating(score) : null;
    if (rating) {
      scoreDistribution[rating] += 1;
    }

    const profile = client.technologyProfile;
    const card = buildPortfolioClientCard({
      clientId: client.id,
      companyName: client.companyName,
      overallStackScore: profile?.overallStackScore ?? null,
      maturityTier: profile?.maturityTier ?? null,
      lastAssessedAt: profile?.lastAssessedAt ?? null,
      nextRecommendedAssessmentAt: profile?.nextRecommendedAssessmentAt ?? null,
      scoreTrend: scoreHistoryByClient.get(client.id) ?? [],
      recommendations: recommendationsByClient.get(client.id) ?? [],
      projects: projectsByClient.get(client.id) ?? [],
      draftAssessmentId: draftByClient.get(client.id) ?? null,
      lastImprovementAt: latestImprovementAt(
        completedProjects,
        completedRecommendations,
        client.id,
      ),
      now,
    });

    immediateFocusTotal += card.immediateFocusCount;
    criticalRecommendationsCount += card.criticalRecommendationsCount;

    clientRows.push({
      clientId: client.id,
      companyName: client.companyName,
      currentStackScore: card.currentStackScore,
      rating,
      maturityStatus: card.maturityStatus,
      scoreChange,
      criticalRecommendationsCount: card.criticalRecommendationsCount,
      openProjectsCount: card.openProjectsCount,
      immediateFocusCount: card.immediateFocusCount,
    });
  }

  const assessedScores = clientRows
    .map((row) => row.currentStackScore)
    .filter((score): score is number => score !== null);

  const averageStackScore =
    assessedScores.length > 0
      ? Math.round(assessedScores.reduce((sum, score) => sum + score, 0) / assessedScores.length)
      : null;

  const averageRating = averageStackScore !== null ? getRating(averageStackScore) : null;

  const portfolioScoreTrend =
    portfolioTrendCount > 0 ? Math.round(portfolioTrendSum / portfolioTrendCount) : null;

  const atRiskClientCount = clientRows.filter(
    (row) => row.currentStackScore !== null && row.currentStackScore < 60,
  ).length;

  clientRows.sort((left, right) => {
    const leftScore = left.currentStackScore ?? 101;
    const rightScore = right.currentStackScore ?? 101;
    if (leftScore !== rightScore) return leftScore - rightScore;
    return left.companyName.localeCompare(right.companyName);
  });

  return {
    kpis: {
      averageStackScore,
      averageRating,
      portfolioScoreTrend,
      immediateFocusTotal,
      openRecommendationsCount,
      criticalRecommendationsCount,
      activeProjectsCount,
      atRiskClientCount,
      clientsImprovingCount,
      clientsDecliningCount,
      assessedClientCount: assessedScores.length,
      totalClientCount: clients.length,
    },
    scoreDistribution,
    clients: clientRows,
    generatedAt: now.toISOString(),
  };
}
