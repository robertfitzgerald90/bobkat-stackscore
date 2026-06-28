import { prisma } from "@/lib/db";
import { OPEN_PROJECT_STATUSES } from "@/lib/projects";
import { buildProgressReportData } from "@/lib/reports/progress/report-data";
import type { ProgressReportData } from "@/lib/reports/progress/types";
import { computeJourneyProgress } from "@/lib/technology-profile/journey";
import { getTechnologyProfile } from "@/lib/technology-profile";
import { MATURITY_TIER_LABELS } from "@/lib/scoring/maturity";

export async function loadProgressReport(clientId: string): Promise<ProgressReportData | null> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, companyName: true },
  });
  if (!client) return null;

  const [
    profileView,
    scoreHistory,
    lastAssessment,
    completedProjects,
    activeProjectCount,
    openRecommendations,
    openRecommendationCount,
    assessmentCount,
    completedProjectCount,
  ] = await Promise.all([
    getTechnologyProfile(clientId),
    prisma.clientScoreHistory.findMany({
      where: { clientId },
      orderBy: { recordedDate: "asc" },
    }),
    prisma.assessment.findFirst({
      where: { clientId, status: "completed" },
      orderBy: { completedAt: "desc" },
      select: {
        assessmentName: true,
        completedAt: true,
        overallScore: true,
      },
    }),
    prisma.project.findMany({
      where: { clientId, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: { recommendation: { select: { title: true } } },
    }),
    prisma.project.count({
      where: { clientId, status: { in: OPEN_PROJECT_STATUSES } },
    }),
    prisma.assessmentRecommendation.findMany({
      where: {
        clientId,
        status: { in: ["open", "accepted", "in_progress"] },
      },
      orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }],
      take: 5,
      select: { title: true, businessImpact: true },
    }),
    prisma.assessmentRecommendation.count({
      where: {
        clientId,
        status: { in: ["open", "accepted", "in_progress"] },
      },
    }),
    prisma.assessment.count({ where: { clientId, status: "completed" } }),
    prisma.project.count({ where: { clientId, status: "completed" } }),
  ]);

  if (!lastAssessment?.completedAt) return null;

  const journey = computeJourneyProgress({
    assessmentsCompleted: assessmentCount,
    openRecommendations: openRecommendationCount,
    activeProjects: activeProjectCount,
    completedProjects: completedProjectCount,
    scoreDelta: null,
  });

  return buildProgressReportData({
    clientId: client.id,
    clientName: client.companyName,
    generatedAt: new Date(),
    currentStackScore: profileView?.overallStackScore ?? null,
    currentMaturityLabel: profileView?.maturityTier
      ? MATURITY_TIER_LABELS[profileView.maturityTier]
      : null,
    lastAssessment: {
      assessmentName: lastAssessment.assessmentName,
      completedAt: lastAssessment.completedAt,
      overallScore: lastAssessment.overallScore,
    },
    scoreHistory,
    completedProjects,
    activeProjectCount,
    openRecommendations,
    openRecommendationsCount: openRecommendationCount,
    journeyPhaseLabel: journey.phaseLabel,
  });
}

export { buildProgressReportData } from "@/lib/reports/progress/report-data";
export { buildProgressExecutiveSummary } from "@/lib/reports/progress/executive-summary";
export type * from "@/lib/reports/progress/types";
