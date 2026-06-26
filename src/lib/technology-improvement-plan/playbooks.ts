import catalog from "../../../data/SolutionPlaybookCatalog.json";
import type { TipPlaybookView, TipRecommendationView } from "./types";

type PlaybookCatalogEntry = (typeof catalog.playbooks)[number];

const playbookById = new Map(catalog.playbooks.map((entry) => [entry.id, entry]));

export function resolvePlaybookIdForService(service: string | null | undefined): string {
  if (!service) return "strategic_it";
  const mapped = catalog.serviceMappings[service as keyof typeof catalog.serviceMappings];
  return mapped ?? "strategic_it";
}

export function getPlaybookById(id: string): PlaybookCatalogEntry | null {
  return playbookById.get(id) ?? null;
}

export function buildPlaybookViews(
  recommendations: TipRecommendationView[],
): TipPlaybookView[] {
  const grouped = new Map<string, TipPlaybookView>();

  for (const recommendation of recommendations) {
    const playbookId = resolvePlaybookIdForService(recommendation.suggestedService);
    const catalogEntry = getPlaybookById(playbookId);
    if (!catalogEntry) continue;

    const existing = grouped.get(playbookId);
    if (existing) {
      existing.recommendationIds.push(recommendation.id);
      existing.estimatedImpactPoints += recommendation.estimatedImpactPoints;
      if (
        recommendation.suggestedService &&
        !existing.services.includes(recommendation.suggestedService)
      ) {
        existing.services.push(recommendation.suggestedService);
      }
      continue;
    }

    grouped.set(playbookId, {
      id: catalogEntry.id,
      name: catalogEntry.name,
      description: catalogEntry.description,
      effortLevel: catalogEntry.effortLevel,
      estimatedEffortWeeks: catalogEntry.estimatedEffortWeeks,
      services: recommendation.suggestedService ? [recommendation.suggestedService] : [],
      technologies: [...catalogEntry.typicalTechnologies],
      recommendationIds: [recommendation.id],
      estimatedImpactPoints: recommendation.estimatedImpactPoints,
    });
  }

  return [...grouped.values()].sort(
    (left, right) => right.estimatedImpactPoints - left.estimatedImpactPoints,
  );
}
