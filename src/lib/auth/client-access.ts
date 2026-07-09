import { prisma } from "@/lib/db";

/** Resolves the latest draft v2 assessment for a client portal user. */
export async function getLatestDraftAssessmentForClientUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { clientId: true, role: true },
  });

  if (!user?.clientId || user.role !== "client") return null;

  return prisma.assessment.findFirst({
    where: {
      clientId: user.clientId,
      status: "draft",
      scoringEngineVersion: "v2",
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, assessmentName: true },
  });
}
