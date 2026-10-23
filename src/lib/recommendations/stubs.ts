import catalog from "../../../data/RecommendationCatalogV2.json";

const STUB_TEMPLATE_CODES = new Set(
  catalog.templates.filter((template) => template.isStub === true).map((template) => template.id),
);

/** True when the v2 catalog marks this template as unapproved stub copy (SS-OPT-003). */
export function isStubRecommendationTemplate(templateCode: string | null | undefined): boolean {
  if (!templateCode) return false;
  return STUB_TEMPLATE_CODES.has(templateCode);
}

export function filterOutStubRecommendations<
  T extends { templateCode?: string | null; recommendationTemplate?: { code: string } | null },
>(recommendations: T[]): T[] {
  return recommendations.filter((recommendation) => {
    const code =
      recommendation.templateCode ?? recommendation.recommendationTemplate?.code ?? null;
    return !isStubRecommendationTemplate(code);
  });
}
