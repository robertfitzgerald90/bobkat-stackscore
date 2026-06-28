import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export const assessmentRecommendationListInclude = {
  category: true,
  project: { select: { id: true } },
} satisfies Prisma.AssessmentRecommendationInclude;

export const assessmentRecommendationListOrderBy = [
  { priority: "asc" as const },
  { estimatedImpactPoints: "desc" as const },
];

export async function getRecommendationsTriggeredByAssessment(assessmentId: string) {
  return prisma.assessmentRecommendation.findMany({
    where: {
      triggers: { some: { assessmentId } },
    },
    orderBy: assessmentRecommendationListOrderBy,
    include: assessmentRecommendationListInclude,
  });
}
