import { prisma } from "@/lib/db";
import { buildBusinessSnapshot } from "@/lib/technology-profile/overview";
import {
  buildJourneyTimelineEvents,
  type JourneyTimelineEvent,
} from "@/lib/technology-profile/timeline";

function roundScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value));
}

export async function getClientJourneyTimeline(
  clientId: string,
): Promise<JourneyTimelineEvent[]> {
  const [
    client,
    profile,
    assessments,
    projects,
    tips,
    documents,
    snapshots,
  ] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        industry: true,
        employeeCount: true,
        numberOfLocations: true,
        primaryBusinessGoal: true,
        technologyVision: true,
        itSupportModel: true,
        environmentType: true,
        complianceFramework: true,
        complianceDetails: true,
        primaryContactName: true,
        primaryContactEmail: true,
        primaryContactPhone: true,
        primaryContactTitle: true,
      },
    }),
    prisma.technologyProfile.findUnique({
      where: { clientId },
      select: {
        createdAt: true,
        overallStackScore: true,
      },
    }),
    prisma.assessment.findMany({
      where: { clientId, status: "completed" },
      orderBy: { completedAt: "asc" },
      select: {
        id: true,
        assessmentName: true,
        assessmentType: true,
        completedAt: true,
        overallScore: true,
      },
    }),
    prisma.project.findMany({
      where: { clientId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        startDate: true,
        completedAt: true,
        actualImpactPoints: true,
        estimatedImpactPoints: true,
      },
    }),
    prisma.technologyImprovementPlan.findMany({
      where: {
        clientId,
        OR: [{ status: "generated" }, { generatedAt: { not: null } }],
      },
      orderBy: [{ generatedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        status: true,
        generatedAt: true,
        createdAt: true,
      },
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
      },
    }),
    prisma.technologyProfileSnapshot.findMany({
      where: { clientId },
      orderBy: { snapshotAt: "asc" },
      select: {
        id: true,
        triggerType: true,
        snapshotAt: true,
        overallStackScore: true,
        maturityTier: true,
        triggerAssessmentId: true,
        metadata: true,
      },
    }),
  ]);

  if (!client || !profile) {
    return [];
  }

  const businessSnapshot = buildBusinessSnapshot(client);

  return buildJourneyTimelineEvents({
    clientId,
    businessSnapshot,
    profileCreatedAt: profile.createdAt,
    profileCreatedScore: roundScore(profile.overallStackScore),
    assessments: assessments.filter(
      (assessment): assessment is typeof assessment & { completedAt: Date } =>
        assessment.completedAt !== null,
    ),
    projects,
    tips,
    documents,
    snapshots,
  });
}
