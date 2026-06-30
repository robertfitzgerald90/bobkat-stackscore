import type { Prisma } from "@/generated/prisma/client";
import type { GeneratedRecommendation, TriggeredResponse } from "./engine";
import {
  ACTIVE_RECOMMENDATION_STATUSES,
  buildDedupeKey,
  buildTriggerReasonMap,
  resolveStatusOnRetrigger,
  shouldReopenDeclinedRecommendation,
} from "./dedupe";

type SyncTransaction = Prisma.TransactionClient;

type CategoryLookup = {
  categoryNameToId: Map<string, string>;
  fallbackCategoryId: string;
};

export type SyncClientRecommendationsInput = {
  clientId: string;
  assessmentId: string;
  userId: string;
  generated: GeneratedRecommendation[];
  triggeredResponses: TriggeredResponse[];
};

function recommendationPayload(
  recommendation: GeneratedRecommendation,
  template: { id: string; categoryId: string } | null,
  lookup: CategoryLookup,
) {
  return {
    categoryId:
      template?.categoryId ??
      lookup.categoryNameToId.get(recommendation.categoryName) ??
      lookup.fallbackCategoryId,
    recommendationTemplateId: template?.id ?? null,
    consolidationGroupId: recommendation.consolidationGroupId,
    title: recommendation.title,
    description: recommendation.description,
    businessImpact: recommendation.businessImpact,
    suggestedService: recommendation.suggestedService,
    priority: recommendation.priority,
    estimatedImpactPoints: recommendation.estimatedImpactPoints,
  };
}

async function upsertAssessmentTrigger(
  tx: SyncTransaction,
  recommendationId: string,
  assessmentId: string,
  triggeredAt: Date,
  triggerReason: string | null,
) {
  await tx.recommendationAssessmentTrigger.upsert({
    where: {
      recommendationId_assessmentId: {
        recommendationId,
        assessmentId,
      },
    },
    create: {
      recommendationId,
      assessmentId,
      triggeredAt,
      triggerReason,
    },
    update: {
      triggeredAt,
      triggerReason,
    },
  });
}

/**
 * Upsert client-level recommendations on assessment completion.
 * One active row per (clientId, dedupeKey); preserves workflow status and createdAt.
 */
export async function syncClientRecommendations(
  tx: SyncTransaction,
  input: SyncClientRecommendationsInput,
): Promise<void> {
  const { clientId, assessmentId, userId, generated, triggeredResponses } = input;
  const now = new Date();
  const triggerReasons = buildTriggerReasonMap(generated, triggeredResponses);
  const generatedDedupeKeys = new Set<string>();

  const categoryRecords = await tx.assessmentCategory.findMany();
  const lookup: CategoryLookup = {
    categoryNameToId: new Map(categoryRecords.map((category) => [category.name, category.id])),
    fallbackCategoryId: categoryRecords[0]?.id ?? "",
  };

  for (const recommendation of generated) {
    const template = await tx.recommendationTemplate.findUnique({
      where: { code: recommendation.templateCode },
      select: { id: true, categoryId: true },
    });

    const dedupeKey = buildDedupeKey({
      recommendationTemplateId: template?.id,
      templateCode: recommendation.templateCode,
      categoryId:
        template?.categoryId ??
        lookup.categoryNameToId.get(recommendation.categoryName),
    });
    generatedDedupeKeys.add(dedupeKey);

    const triggerReason = triggerReasons.get(recommendation.templateCode) ?? null;
    const content = recommendationPayload(recommendation, template, lookup);

    const active = await tx.assessmentRecommendation.findFirst({
      where: {
        clientId,
        dedupeKey,
        status: { in: ACTIVE_RECOMMENDATION_STATUSES },
      },
      orderBy: { createdAt: "asc" },
    });

    if (active) {
      await tx.assessmentRecommendation.update({
        where: { id: active.id },
        data: {
          ...content,
          dedupeKey,
          latestAssessmentId: assessmentId,
          lastTriggeredAt: now,
          latestTriggerReason: triggerReason,
          triggeredInLatestAssessment: true,
          status: resolveStatusOnRetrigger(active.status),
        },
      });
      await upsertAssessmentTrigger(tx, active.id, assessmentId, now, triggerReason);
      continue;
    }

    const declined = await tx.assessmentRecommendation.findFirst({
      where: { clientId, dedupeKey, status: "declined" },
      orderBy: { updatedAt: "desc" },
    });

    if (declined) {
      if (!shouldReopenDeclinedRecommendation(recommendation.priority)) {
        continue;
      }

      await tx.assessmentRecommendation.update({
        where: { id: declined.id },
        data: {
          ...content,
          dedupeKey,
          latestAssessmentId: assessmentId,
          lastTriggeredAt: now,
          latestTriggerReason: triggerReason,
          triggeredInLatestAssessment: true,
          status: "open",
        },
      });
      await upsertAssessmentTrigger(tx, declined.id, assessmentId, now, triggerReason);
      continue;
    }

    const completed = await tx.assessmentRecommendation.findFirst({
      where: { clientId, dedupeKey, status: "completed" },
      orderBy: { completedAt: "desc" },
    });

    if (completed) {
      await tx.assessmentRecommendation.update({
        where: { id: completed.id },
        data: {
          ...content,
          dedupeKey,
          latestAssessmentId: assessmentId,
          lastTriggeredAt: now,
          latestTriggerReason: triggerReason,
          triggeredInLatestAssessment: true,
          status: "open",
          isRecurrence: true,
          recurrenceCount: completed.recurrenceCount + 1,
          completedAt: null,
        },
      });
      await upsertAssessmentTrigger(tx, completed.id, assessmentId, now, triggerReason);
      continue;
    }

    const priorCount = await tx.assessmentRecommendation.count({
      where: { clientId, dedupeKey },
    });
    const isRecurrence = priorCount > 0;

    const created = await tx.assessmentRecommendation.create({
      data: {
        assessmentId,
        clientId,
        dedupeKey,
        latestAssessmentId: assessmentId,
        lastTriggeredAt: now,
        latestTriggerReason: triggerReason,
        triggeredInLatestAssessment: true,
        isRecurrence,
        recurrenceCount: isRecurrence ? priorCount : 0,
        ...content,
        createdByUserId: userId,
        status: "open",
      },
    });
    await upsertAssessmentTrigger(tx, created.id, assessmentId, now, triggerReason);
  }

  await tx.assessmentRecommendation.updateMany({
    where: {
      clientId,
      status: { in: ACTIVE_RECOMMENDATION_STATUSES },
      dedupeKey: { notIn: [...generatedDedupeKeys] },
    },
    data: {
      triggeredInLatestAssessment: false,
    },
  });
}
