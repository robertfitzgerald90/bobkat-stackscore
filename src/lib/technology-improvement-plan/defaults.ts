import type { Priority } from "@/generated/prisma/client";
import type { TipInvestmentDraft, TipRoadmapPhase, TipWizardState } from "./types";

const DEFAULT_MARGIN_PERCENT = 35;

const PRIORITY_PHASE_LABELS: Record<Priority, string> = {
  critical: "Phase 1 — Critical Stabilization",
  high: "Phase 2 — High-Priority Improvements",
  medium: "Phase 3 — Operational Maturity",
  low: "Phase 4 — Strategic Enhancements",
};

type RecommendationSeed = {
  id: string;
  priority: Priority;
  estimatedImpactPoints: number;
  suggestedService: string | null;
};

export function createDefaultInvestment(
  recommendations: RecommendationSeed[],
): TipInvestmentDraft {
  const impactTotal = recommendations.reduce(
    (sum, rec) => sum + rec.estimatedImpactPoints,
    0,
  );
  const laborCents = Math.max(250_000, impactTotal * 15_000);
  const hardwareCents = Math.round(laborCents * 0.25);
  const servicesCents = Math.round(laborCents * 0.4);

  return {
    laborCents,
    hardwareCents,
    servicesCents,
    marginPercent: DEFAULT_MARGIN_PERCENT,
  };
}

export function createDefaultRoadmapPhases(
  recommendations: RecommendationSeed[],
): TipRoadmapPhase[] {
  const priorityOrder: Priority[] = ["critical", "high", "medium", "low"];
  const phases: TipRoadmapPhase[] = [];

  for (const priority of priorityOrder) {
    const ids = recommendations
      .filter((rec) => rec.priority === priority)
      .map((rec) => rec.id);
    if (ids.length === 0) continue;

    phases.push({
      id: `phase-${priority}`,
      label: PRIORITY_PHASE_LABELS[priority],
      sortOrder: phases.length,
      recommendationIds: ids,
    });
  }

  if (phases.length === 0 && recommendations.length > 0) {
    phases.push({
      id: "phase-1",
      label: "Phase 1 — Foundation",
      sortOrder: 0,
      recommendationIds: recommendations.map((rec) => rec.id),
    });
  }

  return phases;
}

export function createDefaultWizardState(
  recommendations: RecommendationSeed[],
): TipWizardState {
  const active = recommendations.map((rec) => rec.id);

  return {
    removedRecommendationIds: [],
    recommendationOrder: active,
    consultantNotesByRecId: {},
    executiveNotesByRecId: {},
    globalConsultantNotes: "",
    globalExecutiveNotes: "",
    investment: createDefaultInvestment(recommendations),
    roadmapPhases: createDefaultRoadmapPhases(recommendations),
    executiveSummary: "",
    frozenAt: null,
  };
}

export function mergeWizardState(
  current: TipWizardState,
  patch: Partial<TipWizardState>,
): TipWizardState {
  return {
    ...current,
    ...patch,
    investment: patch.investment ? { ...current.investment, ...patch.investment } : current.investment,
    roadmapPhases: patch.roadmapPhases ?? current.roadmapPhases,
    consultantNotesByRecId: patch.consultantNotesByRecId ?? current.consultantNotesByRecId,
    executiveNotesByRecId: patch.executiveNotesByRecId ?? current.executiveNotesByRecId,
    removedRecommendationIds:
      patch.removedRecommendationIds ?? current.removedRecommendationIds,
    recommendationOrder: patch.recommendationOrder ?? current.recommendationOrder,
  };
}
