import { prisma } from "@/lib/db";
import type { ClientPortalState } from "@/lib/command-center/types";

/** Lightweight client state for command palette authorization and suggestions. */
export async function getClientPortalState(clientId: string): Promise<ClientPortalState> {
  const [profile, draftAssessment, recommendationCount] = await Promise.all([
    prisma.technologyProfile.findUnique({
      where: { clientId },
      select: { currentAssessmentId: true },
    }),
    prisma.assessment.findFirst({
      where: { clientId, status: "draft", scoringEngineVersion: "v2" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    }),
    prisma.assessmentRecommendation.count({
      where: {
        clientId,
        status: { in: ["open", "in_progress"] },
      },
    }),
  ]);

  const completedCount = await prisma.assessment.count({
    where: { clientId, status: "completed" },
  });

  const currentAssessmentId = profile?.currentAssessmentId ?? null;

  return {
    draftAssessmentId: draftAssessment?.id ?? null,
    currentAssessmentId,
    hasCompletedAssessment: completedCount > 0,
    hasRecommendations: recommendationCount > 0,
    reportHref: currentAssessmentId ? `/assessments/${currentAssessmentId}/report` : null,
    pdfHref: currentAssessmentId
      ? `/api/v1/assessments/${currentAssessmentId}/export/pdf`
      : null,
  };
}

export const EMPTY_CLIENT_PORTAL_STATE: ClientPortalState = {
  draftAssessmentId: null,
  currentAssessmentId: null,
  hasCompletedAssessment: false,
  hasRecommendations: false,
  reportHref: null,
  pdfHref: null,
};
