import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  buildPortfolioClientCard,
  type PortfolioProjectRow,
  type PortfolioRecommendationRow,
} from "@/lib/portfolio/build-card";
import { PORTFOLIO_SPARKLINE_POINT_COUNT } from "@/lib/portfolio/constants";
import type { PortfolioScoreTrendPoint, PortfolioSummary } from "@/lib/portfolio/types";

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

function latestDate(dates: Array<Date | null | undefined>): Date | null {
  let latest: Date | null = null;
  for (const date of dates) {
    if (!date) continue;
    if (!latest || date.getTime() > latest.getTime()) {
      latest = date;
    }
  }
  return latest;
}

function maxCompletedAtByClient(
  rows: Array<{ clientId: string; completedAt: Date | null }>,
): Map<string, Date> {
  const map = new Map<string, Date>();
  for (const row of rows) {
    if (!row.completedAt) continue;
    const existing = map.get(row.clientId);
    if (!existing || row.completedAt.getTime() > existing.getTime()) {
      map.set(row.clientId, row.completedAt);
    }
  }
  return map;
}

export type PortfolioSummaryOptions = {
  /** Reference time for overdue and staleness calculations. Defaults to now. */
  now?: Date;
};

/**
 * Returns portfolio card data for all non-archived clients in scope.
 * Batch-loads profiles, projects, recommendations, and score history.
 */
export async function getPortfolioSummary(
  role: UserRole,
  options: PortfolioSummaryOptions = {},
): Promise<PortfolioSummary> {
  if (role === "client" || role === "technician") {
    return { clients: [], generatedAt: new Date().toISOString() };
  }

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
    },
  });

  if (clients.length === 0) {
    return { clients: [], generatedAt: now.toISOString() };
  }

  const clientIds = clients.map((client) => client.id);

  const [
    recommendationRows,
    projectRows,
    draftAssessments,
    scoreHistoryRows,
    completedProjects,
    completedRecommendations,
  ] = await Promise.all([
    prisma.assessmentRecommendation.findMany({
      where: { clientId: { in: clientIds } },
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
    prisma.project.findMany({
      where: { clientId: { in: clientIds } },
      select: {
        clientId: true,
        status: true,
        completedAt: true,
      },
    }),
    prisma.assessment.findMany({
      where: { clientId: { in: clientIds }, status: "draft" },
      select: { clientId: true, id: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.clientScoreHistory.findMany({
      where: { clientId: { in: clientIds } },
      orderBy: { recordedDate: "desc" },
      select: {
        clientId: true,
        recordedDate: true,
        overallScore: true,
      },
    }),
    prisma.project.findMany({
      where: {
        clientId: { in: clientIds },
        status: "completed",
        completedAt: { not: null },
      },
      select: { clientId: true, completedAt: true },
    }),
    prisma.assessmentRecommendation.findMany({
      where: {
        clientId: { in: clientIds },
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
  for (const draft of draftAssessments) {
    if (!draftByClient.has(draft.clientId)) {
      draftByClient.set(draft.clientId, draft.id);
    }
  }

  const scoreTrendByClient = groupScoreHistoryByClient(scoreHistoryRows);

  const projectImprovementByClient = maxCompletedAtByClient(completedProjects);
  const recommendationImprovementByClient = maxCompletedAtByClient(completedRecommendations);

  const cards = clients.map((client) => {
    const profile = client.technologyProfile;
    const lastImprovementAt = latestDate([
      projectImprovementByClient.get(client.id) ?? null,
      recommendationImprovementByClient.get(client.id) ?? null,
    ]);

    return buildPortfolioClientCard({
      clientId: client.id,
      companyName: client.companyName,
      overallStackScore:
        profile?.overallStackScore !== null && profile?.overallStackScore !== undefined
          ? Number(profile.overallStackScore)
          : null,
      maturityTier: profile?.maturityTier ?? null,
      lastAssessedAt: profile?.lastAssessedAt ?? null,
      nextRecommendedAssessmentAt: profile?.nextRecommendedAssessmentAt ?? null,
      scoreTrend: scoreTrendByClient.get(client.id) ?? [],
      recommendations: recommendationsByClient.get(client.id) ?? [],
      projects: projectsByClient.get(client.id) ?? [],
      draftAssessmentId: draftByClient.get(client.id) ?? null,
      lastImprovementAt,
      now,
    });
  });

  cards.sort((left, right) => {
    const scoreDiff = right.recommendedSortScore - left.recommendedSortScore;
    if (scoreDiff !== 0) return scoreDiff;
    return left.companyName.localeCompare(right.companyName);
  });

  return {
    clients: cards,
    generatedAt: now.toISOString(),
  };
}
