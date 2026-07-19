import type { Priority } from "@/generated/prisma/client";
import { PRIORITY_TIMELINES } from "@/lib/recommendations/display";
import type { TipRoadmapPhase } from "../types";
import type { RoadmapPhaseDefinition } from "./types";

export type PhaseAssignmentSeed = {
  id: string;
  priority: Priority;
  estimatedImpactPoints: number;
};

export const DEFAULT_ROADMAP_PHASE_DEFINITIONS: RoadmapPhaseDefinition[] = [
  {
    id: "phase-critical-stabilization",
    name: "Critical Stabilization",
    subtitle: "Phase 1",
    timeline: PRIORITY_TIMELINES.critical,
    sortOrder: 0,
    priorities: ["critical"],
  },
  {
    id: "phase-high-priority",
    name: "High Priority Improvements",
    subtitle: "Phase 2",
    timeline: PRIORITY_TIMELINES.high,
    sortOrder: 1,
    priorities: ["high"],
  },
  {
    id: "phase-operational-maturity",
    name: "Operational Maturity",
    subtitle: "Phase 3",
    timeline: PRIORITY_TIMELINES.medium,
    sortOrder: 2,
    priorities: ["medium"],
  },
  {
    id: "phase-strategic-enhancements",
    name: "Strategic Enhancements",
    subtitle: "Phase 4",
    timeline: PRIORITY_TIMELINES.low,
    sortOrder: 3,
    priorities: ["low"],
  },
];

const PRIORITY_TO_DEFINITION = new Map<Priority, RoadmapPhaseDefinition>(
  DEFAULT_ROADMAP_PHASE_DEFINITIONS.flatMap((definition) =>
    definition.priorities.map((priority) => [priority, definition] as const),
  ),
);

function formatPhaseLabel(definition: RoadmapPhaseDefinition): string {
  return `${definition.subtitle} — ${definition.name}`;
}

export function assignRecommendationsToPhases(
  recommendations: PhaseAssignmentSeed[],
  recommendationOrder: string[],
  definitions: RoadmapPhaseDefinition[] = DEFAULT_ROADMAP_PHASE_DEFINITIONS,
): TipRoadmapPhase[] {
  const orderIndex = new Map(recommendationOrder.map((id, index) => [id, index]));
  const sortedDefinitions = [...definitions].sort((left, right) => left.sortOrder - right.sortOrder);

  const phases: TipRoadmapPhase[] = [];

  for (const definition of sortedDefinitions) {
    const ids = recommendations
      .filter((rec) => definition.priorities.includes(rec.priority))
      .sort((left, right) => {
        const leftOrder = orderIndex.get(left.id) ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = orderIndex.get(right.id) ?? Number.MAX_SAFE_INTEGER;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        return right.estimatedImpactPoints - left.estimatedImpactPoints;
      })
      .map((rec) => rec.id);

    if (ids.length === 0) continue;

    phases.push({
      id: definition.id,
      label: formatPhaseLabel(definition),
      sortOrder: phases.length,
      recommendationIds: ids,
    });
  }

  if (phases.length === 0 && recommendations.length > 0) {
    const fallback = sortedDefinitions[0];
    phases.push({
      id: fallback?.id ?? "phase-1",
      label: fallback ? formatPhaseLabel(fallback) : "Phase 1 — Foundation",
      sortOrder: 0,
      recommendationIds: recommendations.map((rec) => rec.id),
    });
  }

  return phases;
}

export function resolvePhaseDefinition(
  phaseId: string,
  definitions: RoadmapPhaseDefinition[] = DEFAULT_ROADMAP_PHASE_DEFINITIONS,
): RoadmapPhaseDefinition | null {
  return definitions.find((definition) => definition.id === phaseId) ?? null;
}

export function resolvePhaseDefinitionForPriority(
  priority: Priority,
  definitions: RoadmapPhaseDefinition[] = DEFAULT_ROADMAP_PHASE_DEFINITIONS,
): RoadmapPhaseDefinition {
  return PRIORITY_TO_DEFINITION.get(priority) ?? definitions[definitions.length - 1];
}
