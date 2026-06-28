import { prisma } from "@/lib/db";
import { OPEN_PROJECT_STATUSES } from "@/lib/projects";
import { buildCompletionReportData } from "@/lib/reports/completion/report-data";
import type { CompletionReportData } from "@/lib/reports/completion/types";
import { computeJourneyProgress } from "@/lib/technology-profile/journey";
import { getTechnologyProfile } from "@/lib/technology-profile";

export async function loadCompletionReport(
  clientId: string,
  projectId: string,
): Promise<CompletionReportData | null> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, clientId, status: "completed" },
    include: {
      client: { select: { id: true, companyName: true } },
      category: { select: { name: true } },
      recommendation: {
        select: { title: true, businessImpact: true },
      },
    },
  });

  if (!project?.completedAt) return null;

  const [
    profileView,
    scoreHistory,
    openRecommendations,
    openRecommendationCount,
    assessmentCount,
    activeProjectCount,
    completedProjectCount,
  ] = await Promise.all([
    getTechnologyProfile(clientId),
    prisma.clientScoreHistory.findMany({
      where: { clientId },
      orderBy: { recordedDate: "asc" },
    }),
    prisma.assessmentRecommendation.findMany({
      where: {
        clientId,
        status: { in: ["open", "accepted", "in_progress"] },
      },
      orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }],
      take: 5,
      select: { title: true },
    }),
    prisma.assessmentRecommendation.count({
      where: {
        clientId,
        status: { in: ["open", "accepted", "in_progress"] },
      },
    }),
    prisma.assessment.count({ where: { clientId, status: "completed" } }),
    prisma.project.count({
      where: { clientId, status: { in: OPEN_PROJECT_STATUSES } },
    }),
    prisma.project.count({ where: { clientId, status: "completed" } }),
  ]);

  const journey = computeJourneyProgress({
    assessmentsCompleted: assessmentCount,
    openRecommendations: openRecommendationCount,
    activeProjects: activeProjectCount,
    completedProjects: completedProjectCount,
    scoreDelta: null,
  });

  return buildCompletionReportData({
    clientId: project.client.id,
    clientName: project.client.companyName,
    project: {
      id: project.id,
      title: project.title,
      completedAt: project.completedAt,
      estimatedImpactPoints: project.estimatedImpactPoints,
      actualImpactPoints: project.actualImpactPoints,
      priority: project.priority,
      createdAt: project.createdAt,
      category: project.category,
      recommendation: project.recommendation,
    },
    currentStackScore: profileView?.overallStackScore ?? null,
    scoreHistory,
    openRecommendations,
    journeyPhaseLabel: journey.phaseLabel,
  });
}

export { buildCompletionReportData } from "@/lib/reports/completion/report-data";
export {
  buildCompletionBusinessImpactBullets,
  buildCompletionExecutiveSummary,
  DEFAULT_WARRANTY_NOTES,
} from "@/lib/reports/completion/executive-summary";
export type * from "@/lib/reports/completion/types";
