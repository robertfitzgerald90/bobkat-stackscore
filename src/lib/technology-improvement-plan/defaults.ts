import type { Priority } from "@/generated/prisma/client";
import { createDefaultPhaseAssignments } from "@/lib/technology-improvement-plan/roadmap-engine";
import type { TipInvestmentDraft, TipRoadmapPhase, TipWizardState } from "./types";

type RecommendationSeed = {
  id: string;
  priority: Priority;
  estimatedImpactPoints: number;
  suggestedService: string | null;
};

const DEFAULT_MARGIN_PERCENT = 35;

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
  recommendationOrder: string[] = recommendations.map((rec) => rec.id),
): TipRoadmapPhase[] {
  return createDefaultPhaseAssignments(recommendations, recommendationOrder);
}

export function createDefaultWizardState(
  recommendations: RecommendationSeed[],
): TipWizardState {
  const active = recommendations.map((rec) => rec.id);

  return {
    removedRecommendationIds: [],
    deferredRecommendationIds: [],
    recommendationOrder: active,
    consultantNotesByRecId: {},
    executiveNotesByRecId: {},
    globalConsultantNotes: "",
    globalExecutiveNotes: "",
    investment: createDefaultInvestment(recommendations),
    roadmapPhases: createDefaultRoadmapPhases(recommendations, active),
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
    deferredRecommendationIds:
      patch.deferredRecommendationIds ?? current.deferredRecommendationIds,
    recommendationOrder: patch.recommendationOrder ?? current.recommendationOrder,
  };
}
