import catalog from "../../../data/RecommendationRuleCatalog.json";
import type { Priority } from "@/generated/prisma/client";
import { sortByRecommendationPriority } from "./display";

export type TriggeredResponse = {
  questionCode: string;
  answerText: string;
  scoreValue: number;
  weight: number;
  templateCode: string;
  triggersCriticalFlag: boolean;
};

export type GeneratedRecommendation = {
  templateCode: string;
  consolidationGroupId: string | null;
  title: string;
  description: string;
  businessImpact: string;
  suggestedService: string;
  priority: Priority;
  estimatedImpactPoints: number;
  categoryName: string;
  isConsolidated: boolean;
};

type CatalogTemplate = (typeof catalog.templates)[number];
type ConsolidationGroup = (typeof catalog.consolidationGroups)[number];

export function getRecommendationCatalog() {
  return catalog;
}

export function evaluateTriggers(
  responses: TriggeredResponse[],
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
        response.scoreValue < response.weight);

    if (shouldTrigger) {
      triggeredTemplateIds.add(template.id);
    }
  }

  const consolidatedGroupIds = new Set<string>();
  const recommendations: GeneratedRecommendation[] = [];

  for (const group of catalog.consolidationGroups as ConsolidationGroup[]) {
    const memberMatches = group.memberTemplateIds.filter((id) =>
      triggeredTemplateIds.has(id),
    );

    if (memberMatches.length >= 2 && group.supersedesIndividuals) {
      consolidatedGroupIds.add(group.id);
      recommendations.push({
        templateCode: group.id,
        consolidationGroupId: group.id,
        title: group.title,
        description: group.description,
        businessImpact: group.businessImpact,
        suggestedService: group.suggestedService,
        priority: group.priority as Priority,
        estimatedImpactPoints: group.estimatedImpactPoints,
        categoryName: inferCategoryName(group.memberTemplateIds[0], templateById),
        isConsolidated: true,
      });
    }
  }

  for (const templateId of triggeredTemplateIds) {
    const template = templateById.get(templateId) as CatalogTemplate | undefined;
    if (!template) continue;

    if (
      template.consolidationGroupId &&
      consolidatedGroupIds.has(template.consolidationGroupId)
    ) {
      continue;
    }

    recommendations.push({
      templateCode: template.id,
      consolidationGroupId: template.consolidationGroupId ?? null,
      title: template.title,
      description: template.description,
      businessImpact: template.businessImpact,
      suggestedService: template.suggestedService,
      priority: template.priority as Priority,
      estimatedImpactPoints: template.estimatedImpactPoints,
      categoryName: template.category,
      isConsolidated: false,
    });
  }

  return sortByRecommendationPriority(recommendations);
}

/**
 * Per-category max impact cap used for projected StackScore (DOC-152).
 * Prevents summing duplicate pillar impacts when multiple recommendations share a category.
 */
export function calculateProjectionImpacts(
  recommendations: GeneratedRecommendation[],
): number {
  const byCategory = new Map<string, number>();

  for (const recommendation of recommendations) {
    const current = byCategory.get(recommendation.categoryName) ?? 0;
    byCategory.set(
      recommendation.categoryName,
      Math.max(current, recommendation.estimatedImpactPoints),
    );
  }

  return Array.from(byCategory.values()).reduce((sum, value) => sum + value, 0);
}

function inferCategoryName(
  templateId: string,
  templateById: Map<string, CatalogTemplate>,
): string {
  return templateById.get(templateId)?.category ?? "General";
}

export function buildExecutiveSummary(input: {
  overallScore: number;
  overallRating: string;
  hasCriticalExposure: boolean;
  strengths: string[];
  risks: string[];
  topRecommendations: string[];
  projectedScore?: number;
}): string {
  const lines = [
    `Overall StackScore: ${input.overallScore} / 100 — ${input.overallRating}`,
  ];

  if (input.hasCriticalExposure) {
    lines.push(
      "Critical Exposure Warning: Critical security or recovery gaps were identified.",
    );
  }

  if (input.strengths.length > 0) {
    lines.push(`Top strengths: ${input.strengths.join(", ")}`);
  }

  if (input.risks.length > 0) {
    lines.push(`Top risks: ${input.risks.join(", ")}`);
  }

  if (input.topRecommendations.length > 0) {
    lines.push(`Recommended next actions: ${input.topRecommendations.join("; ")}`);
  }

  if (input.projectedScore !== undefined) {
    lines.push(`Projected score if recommendations are addressed: ${input.projectedScore}`);
  }

  return lines.join("\n\n");
}
