import { prisma } from "@/lib/db";
import type { PillarScoreSnapshot } from "@/lib/scoring/v2";

/** Pillar score snapshots recorded when a v2 assessment is completed. */
export async function getAssessmentPillarSnapshots(
  assessmentId: string,
): Promise<PillarScoreSnapshot[] | null> {
  const history = await prisma.clientScoreHistory.findFirst({
    where: { assessmentId },
    select: { pillarScores: true },
    orderBy: { recordedDate: "desc" },
  });

  if (!history?.pillarScores || !Array.isArray(history.pillarScores)) {
    return null;
  }

  return history.pillarScores as PillarScoreSnapshot[];
}
