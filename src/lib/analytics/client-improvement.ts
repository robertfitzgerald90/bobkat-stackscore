import { prisma } from "@/lib/db";
import { SCORE_HISTORY_CATEGORY_FIELDS } from "@/lib/analytics/categories";
import type {
  CategoryTrendSeries,
  ClientImprovementAnalytics,
  MaturityTimelineEvent,
  ScoreTrendPoint,
} from "@/lib/analytics/types";
import { formatDisplayDate } from "@/lib/display";
import { formatAssessmentType } from "@/lib/assessments/display";
import { RECOMMENDATION_STATUS_LABELS } from "@/lib/assessments/results-summary";
import { formatProjectStatus } from "@/lib/projects";

function roundScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value));
}

export async function getClientImprovementAnalytics(
  clientId: string,
): Promise<ClientImprovementAnalytics | null> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      companyName: true,
      scoreHistory: {
        orderBy: { recordedDate: "asc" },
        include: {
          assessment: { select: { assessmentName: true } },
        },
      },
      assessments: {
        where: { status: "completed" },
        orderBy: { completedAt: "asc" },
        select: {
          id: true,
          assessmentName: true,
          assessmentType: true,
          completedAt: true,
          overallScore: true,
        },
      },
      projects: {
        where: { status: "completed" },
        orderBy: { completedAt: "asc" },
        select: { id: true, title: true, completedAt: true },
      },
      recommendations: {
        where: { status: { in: ["completed", "declined", "archived"] } },
        orderBy: { updatedAt: "asc" },
        select: {
          id: true,
          title: true,
          status: true,
          completedAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!client) return null;

  const scoreTrend: ScoreTrendPoint[] = client.scoreHistory.map((entry) => {
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

  const categoryTrends: CategoryTrendSeries[] = SCORE_HISTORY_CATEGORY_FIELDS.map((category) => ({
    categoryCode: category.code,
    categoryName: category.label,
    points: client.scoreHistory.map((entry) => ({
      date: entry.recordedDate.toISOString(),
      dateLabel: formatDisplayDate(entry.recordedDate),
      score: roundScore(entry[category.field]),
    })),
  }));

  const timeline: MaturityTimelineEvent[] = [
    ...client.assessments
      .filter((assessment) => assessment.completedAt)
      .map((assessment) => ({
        id: `assessment-${assessment.id}`,
        date: assessment.completedAt!.toISOString(),
        dateLabel: formatDisplayDate(assessment.completedAt),
        type: "assessment" as const,
        title: assessment.assessmentName,
        subtitle: `${formatAssessmentType(assessment.assessmentType)} completed`,
        score: roundScore(assessment.overallScore) ?? undefined,
      })),
    ...client.projects
      .filter((project) => project.completedAt)
      .map((project) => ({
        id: `project-${project.id}`,
        date: project.completedAt!.toISOString(),
        dateLabel: formatDisplayDate(project.completedAt),
        type: "project" as const,
        title: project.title,
        subtitle: `${formatProjectStatus("completed")} project`,
      })),
    ...client.recommendations.map((recommendation) => ({
      id: `recommendation-${recommendation.id}`,
      date: (recommendation.completedAt ?? recommendation.updatedAt).toISOString(),
      dateLabel: formatDisplayDate(recommendation.completedAt ?? recommendation.updatedAt),
      type: "recommendation" as const,
      title: recommendation.title,
      subtitle: `Recommendation ${RECOMMENDATION_STATUS_LABELS[recommendation.status].toLowerCase()}`,
    })),
  ].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

  const initialScore = scoreTrend[0]?.overallScore ?? null;
  const currentScore = scoreTrend[scoreTrend.length - 1]?.overallScore ?? null;
  const netImprovement =
    initialScore !== null && currentScore !== null ? currentScore - initialScore : null;

  return {
    clientId: client.id,
    clientName: client.companyName,
    initialScore,
    currentScore,
    netImprovement,
    assessmentCount: client.assessments.length,
    projectsCompleted: client.projects.length,
    recommendationsClosed: client.recommendations.length,
    scoreTrend,
    categoryTrends,
    timeline,
  };
}

export async function getClientScoreDelta(clientId: string): Promise<number | null> {
  const history = await prisma.clientScoreHistory.findMany({
    where: { clientId },
    orderBy: { recordedDate: "desc" },
    take: 2,
    select: { overallScore: true },
  });

  if (history.length < 2) return null;

  return (
    Math.round(Number(history[0].overallScore)) - Math.round(Number(history[1].overallScore))
  );
}
