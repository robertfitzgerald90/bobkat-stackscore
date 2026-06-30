import catalog from "../../../data/RecommendationCatalogV2.json";
import type { Priority } from "@/generated/prisma/client";
import { sortByRecommendationPriority } from "./display";
import type { TriggeredResponse, GeneratedRecommendation } from "./engine";

export type V2TriggeredResponse = TriggeredResponse & {
  pillarCode: string;
};

type CatalogTemplate = (typeof catalog.templates)[number];

export function getRecommendationCatalogV2() {
  return catalog;
}

export function evaluateV2Triggers(
  responses: V2TriggeredResponse[],
): GeneratedRecommendation[] {
  const templateById = new Map(
    catalog.templates.map((template) => [template.id, template]),
  );

  const triggeredTemplateIds = new Set<string>();

  for (const response of responses) {
    const template = templateById.get(response.templateCode);
    if (!template) continue;

    const shouldTrigger =
      template.triggerAnswers.includes(response.answerText) ||
      (template.alsoTriggerOnPartial &&
        response.scoreValue > 0 &&
        response.scoreValue < 100);

    if (shouldTrigger) {
      triggeredTemplateIds.add(template.id);
    }
  }

  const recommendations: GeneratedRecommendation[] = [];

  for (const templateId of triggeredTemplateIds) {
    const template = templateById.get(templateId) as CatalogTemplate | undefined;
    if (!template) continue;

    recommendations.push({
      templateCode: template.id,
      consolidationGroupId: template.consolidationGroupId ?? null,
      title: template.title,
      description: template.description,
      businessImpact: template.businessImpact,
      suggestedService: template.suggestedService,
      priority: template.priority as Priority,
      estimatedImpactPoints: template.estimatedImpactPoints,
      categoryName: template.pillarName,
      isConsolidated: false,
    });
  }

  return sortByRecommendationPriority(recommendations);
}

export function collectV2TriggeredResponses(
  responses: Array<{
    question: { code: string; weight: number; category: { code: string; name: string } };
    scoreEarned: number;
    selectedAnswerOption: {
      answerText: string;
      triggersRecommendation: boolean;
      triggersCriticalFlag: boolean;
      recommendationTemplate: { code: string } | null;
    };
  }>,
): V2TriggeredResponse[] {
  return responses
    .filter((response) => response.selectedAnswerOption.triggersRecommendation)
    .map((response) => ({
      questionCode: response.question.code,
      answerText: response.selectedAnswerOption.answerText,
      scoreValue: response.scoreEarned,
      weight: response.question.weight,
      templateCode: response.selectedAnswerOption.recommendationTemplate?.code ?? "",
      triggersCriticalFlag: response.selectedAnswerOption.triggersCriticalFlag,
      pillarCode: response.question.category.code,
    }))
    .filter((response) => response.templateCode);
}
