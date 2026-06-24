import { prisma } from "@/lib/db";
import { DashboardCommandCenter } from "@/components/dashboard/dashboard-command-center";
import { getRating } from "@/lib/scoring";
import type { Rating } from "@/generated/prisma/client";

const EMPTY_DISTRIBUTION: Record<Rating, number> = {
  exceptional: 0,
  strong: 0,
  stable: 0,
  at_risk: 0,
  critical: 0,
};

export default async function DashboardPage() {
  const [
    clients,
    openRecommendationsCount,
    activeProjectsCount,
    recentAssessments,
    recentProjects,
    recentRecommendations,
    urgentRecommendations,
  ] = await Promise.all([
    prisma.client.findMany({
      orderBy: { companyName: "asc" },
      include: {
        assessments: {
          where: { status: "completed", overallScore: { not: null } },
          orderBy: { completedAt: "desc" },
          take: 2,
          select: { id: true, overallScore: true },
        },
      },
    }),
    prisma.assessmentRecommendation.count({
      where: { status: { in: ["open", "accepted", "in_progress"] } },
    }),
    prisma.project.count({
      where: { status: { in: ["approved", "scheduled", "in_progress"] } },
    }),
    prisma.assessment.findMany({
      where: { status: "completed", overallScore: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 5,
      include: { client: { select: { companyName: true } } },
    }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { client: { select: { companyName: true } } },
    }),
    prisma.assessmentRecommendation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        client: { select: { companyName: true, id: true } },
        assessment: { select: { id: true } },
      },
    }),
    prisma.assessmentRecommendation.findMany({
      where: {
        status: { in: ["open", "accepted", "in_progress"] },
        priority: { in: ["critical", "high"] },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        client: { select: { companyName: true, id: true } },
        assessment: { select: { id: true } },
      },
    }),
  ]);

  const clientHealth = clients.map((client) => {
    const latest = client.assessments[0];
    const score = latest?.overallScore != null ? Math.round(Number(latest.overallScore)) : null;

    return {
      id: client.id,
      companyName: client.companyName,
      status: client.status,
      score,
      rating: score !== null ? getRating(score) : null,
      assessmentId: latest?.id ?? null,
    };
  });

  const latestScores = clientHealth
    .map((client) => client.score)
    .filter((score): score is number => score !== null);

  const averageClientScore =
    latestScores.length > 0
      ? Math.round(latestScores.reduce((sum, score) => sum + score, 0) / latestScores.length)
      : null;

  const averageClientRating =
    averageClientScore !== null ? getRating(averageClientScore) : null;

  const clientsWithPriorAssessment = clients.filter((client) => client.assessments.length >= 2);
  const scoreTrend =
    clientsWithPriorAssessment.length > 0
      ? (() => {
          const currentAverage = Math.round(
            clientsWithPriorAssessment.reduce(
              (sum, client) => sum + Number(client.assessments[0]!.overallScore),
              0,
            ) / clientsWithPriorAssessment.length,
          );
          const previousAverage = Math.round(
            clientsWithPriorAssessment.reduce(
              (sum, client) => sum + Number(client.assessments[1]!.overallScore),
              0,
            ) / clientsWithPriorAssessment.length,
          );
          return { change: currentAverage - previousAverage };
        })()
      : null;

  const atRiskClientCount = clientHealth.filter(
    (client) => client.score !== null && client.score < 60,
  ).length;

  const scoreDistribution = { ...EMPTY_DISTRIBUTION };
  for (const client of clientHealth) {
    if (client.rating) {
      scoreDistribution[client.rating] += 1;
    }
  }

  const criticalClients = clientHealth
    .filter((client) => client.score !== null && client.score < 60 && client.rating !== null)
    .map((client) => ({
      id: client.id,
      companyName: client.companyName,
      score: client.score as number,
      rating: client.rating as Rating,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 } as const;
  const sortedUrgentRecommendations = [...urgentRecommendations].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );

  return (
    <DashboardCommandCenter
      averageClientScore={averageClientScore}
      averageClientRating={averageClientRating}
      scoreTrend={scoreTrend}
      atRiskClientCount={atRiskClientCount}
      openRecommendationsCount={openRecommendationsCount}
      activeProjectsCount={activeProjectsCount}
      clientHealth={clientHealth}
      scoreDistribution={scoreDistribution}
      recentAssessments={recentAssessments.map((assessment) => ({
        id: assessment.id,
        assessmentName: assessment.assessmentName,
        companyName: assessment.client.companyName,
        clientId: assessment.clientId,
        score: Math.round(Number(assessment.overallScore)),
        completedAt: assessment.completedAt,
      }))}
      recentProjects={recentProjects.map((project) => ({
        id: project.id,
        title: project.title,
        companyName: project.client.companyName,
        status: project.status,
        priority: project.priority,
        updatedAt: project.updatedAt,
      }))}
      recentRecommendations={recentRecommendations.map((recommendation) => ({
        id: recommendation.id,
        title: recommendation.title,
        companyName: recommendation.client.companyName,
        clientId: recommendation.clientId,
        assessmentId: recommendation.assessment.id,
        priority: recommendation.priority,
        status: recommendation.status,
        updatedAt: recommendation.updatedAt,
      }))}
      criticalClients={criticalClients}
      urgentRecommendations={sortedUrgentRecommendations.map((recommendation) => ({
        id: recommendation.id,
        title: recommendation.title,
        companyName: recommendation.client.companyName,
        clientId: recommendation.clientId,
        assessmentId: recommendation.assessment.id,
        priority: recommendation.priority,
      }))}
    />
  );
}
