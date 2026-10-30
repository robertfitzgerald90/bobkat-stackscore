/**
 * SS-UX-005 — Customer Explore / pillar detail service (authorized).
 */

import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getClientRecommendations } from "@/lib/recommendations/client-list";
import {
  buildCustomerPillarDetail,
  buildCustomerPillarTiles,
  isTechnologyPillarCode,
  type CustomerExploreDto,
  type CustomerPillarDetailDto,
  type PillarResponseEvidence,
} from "@/lib/customer-portal/pillar-detail-dto";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";
import {
  TECHNOLOGY_PILLARS,
  type TechnologyPillarCode,
} from "@/lib/technology-maturity/pillars";

async function loadPillarResponses(
  assessmentId: string | null,
  pillarCode: TechnologyPillarCode,
): Promise<PillarResponseEvidence[]> {
  if (!assessmentId) return [];

  const responses = await prisma.assessmentResponse.findMany({
    where: {
      assessmentId,
      question: { category: { code: pillarCode } },
    },
    select: {
      scoreEarned: true,
      question: {
        select: {
          code: true,
          questionText: true,
          answerOptions: { select: { id: true, scoreValue: true } },
        },
      },
      selectedAnswerOption: {
        select: {
          answerText: true,
          scoreValue: true,
          triggersCriticalFlag: true,
        },
      },
    },
  });

  return responses.map((row) => {
    const maxScore = Math.max(
      0,
      ...row.question.answerOptions.map((opt) => opt.scoreValue ?? 0),
    );
    return {
      questionText: row.question.questionText,
      answerText: row.selectedAnswerOption.answerText,
      scoreEarned: row.scoreEarned ?? row.selectedAnswerOption.scoreValue ?? 0,
      maxScore: maxScore || 1,
      isCritical: Boolean(row.selectedAnswerOption.triggersCriticalFlag),
      questionCode: row.question.code,
    };
  });
}

/**
 * Assemble interactive Explore payload for a customer-owned client.
 * Caller must enforce tenant ownership before invoking.
 */
export async function getCustomerExplore(
  clientId: string,
  role: UserRole,
  companyName: string,
  selectedPillarRaw?: string | null,
): Promise<CustomerExploreDto | null> {
  const detail = await getTechnologyProfileDetail(clientId, role);
  if (!detail) return null;

  const hasCompletedAssessment = detail.journey.assessmentsCompleted > 0;
  const assessmentId = detail.profile.currentAssessmentId;
  const tiles = buildCustomerPillarTiles(clientId, detail.pillarInsights);
  const selectedPillarCode = isTechnologyPillarCode(selectedPillarRaw)
    ? selectedPillarRaw
    : tiles.find((t) => t.score !== null)?.code ?? TECHNOLOGY_PILLARS[0]!.code;

  const detailsEntries = await Promise.all(
    TECHNOLOGY_PILLARS.map(async (pillar) => {
      const [responses, recommendations] = await Promise.all([
        loadPillarResponses(assessmentId, pillar.code),
        getClientRecommendations(clientId, { pillarCode: pillar.code }, role),
      ]);
      const insight =
        detail.pillarInsights.find((p) => p.pillarCode === pillar.code) ?? null;
      const built = buildCustomerPillarDetail({
        clientId,
        pillarCode: pillar.code,
        insight,
        responses,
        recommendations: recommendations.map((row) => ({
          id: row.id,
          title: row.title,
          priority: row.priority,
          status: row.status,
          estimatedImpactPoints: row.estimatedImpactPoints,
          suggestedService: row.suggestedService,
        })),
        hasCompletedAssessment,
      });
      return [pillar.code, built] as const;
    }),
  );

  const detailsByCode = Object.fromEntries(detailsEntries) as Record<
    TechnologyPillarCode,
    CustomerPillarDetailDto
  >;

  return {
    clientId,
    companyName,
    hasCompletedAssessment,
    assessmentInProgress: Boolean(detail.draftAssessmentId),
    selectedPillarCode,
    pillars: tiles,
    detailsByCode,
  };
}
