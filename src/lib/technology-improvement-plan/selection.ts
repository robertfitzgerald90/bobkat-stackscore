import type { Priority } from "@/generated/prisma/client";
import {
  getPriorityTimeline,
  RECOMMENDATION_PRIORITY_ORDER,
} from "@/lib/recommendations/display";
import {
  buildTechnologyRoadmap,
  createDefaultPhaseAssignments,
  enrichRoadmapPhaseViews,
} from "@/lib/technology-improvement-plan/roadmap-engine";
import type { TechnologyRoadmap } from "@/lib/technology-improvement-plan/roadmap-engine";
import { createDefaultInvestment } from "@/lib/technology-improvement-plan/defaults";
import { buildPlaybookViews } from "@/lib/technology-improvement-plan/playbooks";
import { computeInvestmentView } from "@/lib/technology-improvement-plan/pricing";
import {
  buildRoadmapPhaseViews,
  computeOverallProjectedScore,
} from "@/lib/technology-improvement-plan/roadmap";
import type {
  TipInvestmentView,
  TipPlanDetail,
  TipPlaybookView,
  TipRecommendationView,
  TipRoadmapPhaseView,
  TipSelectionSummary,
  TipWizardState,
} from "@/lib/technology-improvement-plan/types";

export type TipRecommendationStatus = "included" | "excluded" | "deferred";

export type RecommendationSeed = {
  id: string;
  title: string;
  description: string;
  businessImpact: string;
  priority: Priority;
  suggestedService: string | null;
  estimatedImpactPoints: number;
  categoryName: string;
};

export function getRecommendationStatus(
  id: string,
  state: TipWizardState,
): TipRecommendationStatus {
  if (state.deferredRecommendationIds.includes(id)) return "deferred";
  if (state.removedRecommendationIds.includes(id)) return "excluded";
  return "included";
}

export function isActiveInPlan(status: TipRecommendationStatus): boolean {
  return status === "included";
}

function buildRecommendationView(
  seed: RecommendationSeed,
  state: TipWizardState,
  sortOrder: number,
): TipRecommendationView {
  return {
    id: seed.id,
    title: seed.title,
    description: seed.description,
    businessImpact: seed.businessImpact,
    priority: seed.priority,
    suggestedService: seed.suggestedService,
    estimatedImpactPoints: seed.estimatedImpactPoints,
    categoryName: seed.categoryName,
    consultantNote: state.consultantNotesByRecId[seed.id] ?? "",
    executiveNote: state.executiveNotesByRecId[seed.id] ?? "",
    sortOrder,
  };
}

export function orderIncludedRecommendationIds(state: TipWizardState): string[] {
  const inactive = new Set([
    ...state.removedRecommendationIds,
    ...state.deferredRecommendationIds,
  ]);
  return state.recommendationOrder.filter((id) => !inactive.has(id));
}

export function buildIncludedRecommendations(
  seeds: RecommendationSeed[],
  state: TipWizardState,
): TipRecommendationView[] {
  const seedById = new Map(seeds.map((seed) => [seed.id, seed]));
  const orderedIds = orderIncludedRecommendationIds(state);

  return orderedIds
    .map((id, index) => {
      const seed = seedById.get(id);
      if (!seed) return null;
      return buildRecommendationView(seed, state, index);
    })
    .filter((rec): rec is TipRecommendationView => rec !== null);
}

export function buildRecommendationsByStatus(
  seeds: RecommendationSeed[],
  state: TipWizardState,
  status: TipRecommendationStatus,
): TipRecommendationView[] {
  return seeds
    .filter((seed) => getRecommendationStatus(seed.id, state) === status)
    .map((seed, index) => buildRecommendationView(seed, state, index));
}

export function estimateImplementationTimeline(
  recommendations: TipRecommendationView[],
): string {
  if (recommendations.length === 0) return "No active initiatives";

  const prioritiesPresent = new Set(recommendations.map((rec) => rec.priority));
  for (let i = RECOMMENDATION_PRIORITY_ORDER.length - 1; i >= 0; i -= 1) {
    const priority = RECOMMENDATION_PRIORITY_ORDER[i];
    if (prioritiesPresent.has(priority)) {
      return getPriorityTimeline(priority);
    }
  }

  return getPriorityTimeline(recommendations[0].priority);
}

export function recalculateInvestmentForSelection(
  includedSeeds: RecommendationSeed[],
  state: TipWizardState,
): TipWizardState["investment"] {
  const base = createDefaultInvestment(includedSeeds);
  return {
    ...base,
    marginPercent: state.investment.marginPercent,
  };
}

export function recalculateRoadmapForSelection(
  includedSeeds: RecommendationSeed[],
  recommendationOrder: string[],
): TipWizardState["roadmapPhases"] {
  return createDefaultPhaseAssignments(includedSeeds, recommendationOrder);
}

export function syncWizardStateAfterSelectionChange(
  seeds: RecommendationSeed[],
  state: TipWizardState,
): TipWizardState {
  const includedSeeds = seeds.filter(
    (seed) => getRecommendationStatus(seed.id, state) === "included",
  );

  const inactive = new Set([
    ...state.removedRecommendationIds,
    ...state.deferredRecommendationIds,
  ]);
  const recommendationOrder = [
    ...state.recommendationOrder.filter((id) => !inactive.has(id)),
    ...seeds
      .map((seed) => seed.id)
      .filter((id) => !inactive.has(id) && !state.recommendationOrder.includes(id)),
  ];

  return {
    ...state,
    recommendationOrder,
    investment: recalculateInvestmentForSelection(includedSeeds, state),
    roadmapPhases: recalculateRoadmapForSelection(includedSeeds, recommendationOrder),
  };
}

export type TipDerivedPlanState = {
  recommendations: TipRecommendationView[];
  excludedRecommendations: TipRecommendationView[];
  deferredRecommendations: TipRecommendationView[];
  playbooks: TipPlaybookView[];
  investmentInternal: TipInvestmentView;
  roadmapPhases: TipRoadmapPhaseView[];
  technologyRoadmap: TechnologyRoadmap;
  projectedScore: number;
  selectionSummary: TipSelectionSummary;
};

export function computeTipDerivedState(
  seeds: RecommendationSeed[],
  state: TipWizardState,
  currentScore: number,
): TipDerivedPlanState {
  const recommendations = buildIncludedRecommendations(seeds, state);
  const excludedRecommendations = buildRecommendationsByStatus(seeds, state, "excluded");
  const deferredRecommendations = buildRecommendationsByStatus(seeds, state, "deferred");
  const investmentInternal = computeInvestmentView(state.investment);
  const projectedScore = computeOverallProjectedScore(currentScore, recommendations);
  const roadmapPhaseViews = buildRoadmapPhaseViews(
    currentScore,
    recommendations,
    state.roadmapPhases,
  );
  const technologyRoadmap = buildTechnologyRoadmap({
    currentScore,
    recommendations,
    phaseAssignments: state.roadmapPhases,
    investmentDraft: state.investment,
  });
  const roadmapPhases = enrichRoadmapPhaseViews(technologyRoadmap, roadmapPhaseViews);
  const playbooks = buildPlaybookViews(recommendations);

  return {
    recommendations,
    excludedRecommendations,
    deferredRecommendations,
    playbooks,
    investmentInternal,
    roadmapPhases,
    technologyRoadmap,
    projectedScore,
    selectionSummary: {
      includedCount: recommendations.length,
      excludedCount: excludedRecommendations.length,
      deferredCount: deferredRecommendations.length,
      clientInvestmentTotal: investmentInternal.clientTotal,
      oneTimeInvestmentTotal: technologyRoadmap.totals.totalOneTimeInvestment,
      monthlyRecurringTotal: technologyRoadmap.totals.totalMonthlyRecurring,
      annualRecurringTotal: technologyRoadmap.totals.totalAnnualRecurring,
      laborTotal: investmentInternal.labor,
      hardwareTotal: investmentInternal.hardware,
      servicesTotal: investmentInternal.services,
      projectedScoreImprovement: projectedScore - currentScore,
      estimatedTimeline: estimateImplementationTimeline(recommendations),
    },
  };
}

export function excludeRecommendation(
  seeds: RecommendationSeed[],
  state: TipWizardState,
  id: string,
): TipWizardState {
  const removed = new Set(state.removedRecommendationIds);
  removed.add(id);

  const deferred = state.deferredRecommendationIds.filter((recId) => recId !== id);

  return syncWizardStateAfterSelectionChange(seeds, {
    ...state,
    removedRecommendationIds: [...removed],
    deferredRecommendationIds: deferred,
  });
}

export function deferRecommendation(
  seeds: RecommendationSeed[],
  state: TipWizardState,
  id: string,
): TipWizardState {
  const deferred = new Set(state.deferredRecommendationIds);
  deferred.add(id);

  const removed = state.removedRecommendationIds.filter((recId) => recId !== id);

  return syncWizardStateAfterSelectionChange(seeds, {
    ...state,
    deferredRecommendationIds: [...deferred],
    removedRecommendationIds: removed,
  });
}

export function includeRecommendation(
  seeds: RecommendationSeed[],
  state: TipWizardState,
  id: string,
): TipWizardState {
  const removed = state.removedRecommendationIds.filter((recId) => recId !== id);
  const deferred = state.deferredRecommendationIds.filter((recId) => recId !== id);

  const recommendationOrder = state.recommendationOrder.includes(id)
    ? state.recommendationOrder
    : [...state.recommendationOrder, id];

  return syncWizardStateAfterSelectionChange(seeds, {
    ...state,
    removedRecommendationIds: removed,
    deferredRecommendationIds: deferred,
    recommendationOrder,
  });
}

export function moveRecommendationInOrder(
  state: TipWizardState,
  id: string,
  direction: "up" | "down",
): TipWizardState {
  const order = orderIncludedRecommendationIds(state);
  const index = order.indexOf(id);
  if (index < 0) return state;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= order.length) return state;

  const nextIncluded = [...order];
  [nextIncluded[index], nextIncluded[swapWith]] = [nextIncluded[swapWith], nextIncluded[index]];

  const inactive = new Set([
    ...state.removedRecommendationIds,
    ...state.deferredRecommendationIds,
  ]);
  const inactiveTail = state.recommendationOrder.filter((recId) => inactive.has(recId));

  return {
    ...state,
    recommendationOrder: [...nextIncluded, ...inactiveTail],
  };
}

export function validateTipSelection(
  seeds: RecommendationSeed[],
  state: TipWizardState,
): string | null {
  if (orderIncludedRecommendationIds(state).length === 0) {
    return "At least one recommendation must remain included in the plan.";
  }

  const seedById = new Map(seeds.map((seed) => [seed.id, seed]));

  for (const id of state.removedRecommendationIds) {
    const seed = seedById.get(id);
    if (seed?.priority === "critical") {
      const note = state.consultantNotesByRecId[id]?.trim();
      if (!note) {
        return `A consultant note is required when excluding critical recommendation "${seed.title}".`;
      }
    }
  }

  return null;
}

export function shouldConfirmExclusion(priority: Priority): boolean {
  return priority === "critical" || priority === "high";
}

export function seedsFromRecommendationViews(
  views: TipRecommendationView[],
): RecommendationSeed[] {
  return views.map((view) => ({
    id: view.id,
    title: view.title,
    description: view.description,
    businessImpact: view.businessImpact,
    priority: view.priority,
    suggestedService: view.suggestedService,
    estimatedImpactPoints: view.estimatedImpactPoints,
    categoryName: view.categoryName,
  }));
}

export function mergeRecommendationCatalog(
  included: TipRecommendationView[],
  excluded: TipRecommendationView[],
  deferred: TipRecommendationView[],
): RecommendationSeed[] {
  const byId = new Map<string, RecommendationSeed>();
  for (const view of [...included, ...excluded, ...deferred]) {
    byId.set(view.id, {
      id: view.id,
      title: view.title,
      description: view.description,
      businessImpact: view.businessImpact,
      priority: view.priority,
      suggestedService: view.suggestedService,
      estimatedImpactPoints: view.estimatedImpactPoints,
      categoryName: view.categoryName,
    });
  }
  return [...byId.values()];
}

export function applyWizardStateToPlan(
  plan: TipPlanDetail,
  wizardState: TipWizardState,
): TipPlanDetail {
  const seeds = mergeRecommendationCatalog(
    plan.recommendations,
    plan.excludedRecommendations,
    plan.deferredRecommendations,
  );
  const synced = syncWizardStateAfterSelectionChange(seeds, wizardState);
  const derived = computeTipDerivedState(seeds, synced, plan.currentScore);
  const investment = plan.isAdmin
    ? derived.investmentInternal
    : {
        labor: 0,
        hardware: 0,
        services: 0,
        subtotal: 0,
        marginPercent: 0,
        marginAmount: 0,
        clientTotal: derived.investmentInternal.clientTotal,
      };

  return {
    ...plan,
    wizardState: synced,
    recommendations: derived.recommendations,
    excludedRecommendations: derived.excludedRecommendations,
    deferredRecommendations: derived.deferredRecommendations,
    selectionSummary: derived.selectionSummary,
    playbooks: derived.playbooks,
    investment,
    investmentInternal: plan.isAdmin ? derived.investmentInternal : investment,
    roadmapPhases: derived.roadmapPhases,
    technologyRoadmap: derived.technologyRoadmap,
    projectedScore: derived.projectedScore,
  };
}

export function parseWizardState(raw: unknown): TipWizardState {
  const state = raw as TipWizardState;
  return {
    removedRecommendationIds: state.removedRecommendationIds ?? [],
    deferredRecommendationIds: state.deferredRecommendationIds ?? [],
    recommendationOrder: state.recommendationOrder ?? [],
    consultantNotesByRecId: state.consultantNotesByRecId ?? {},
    executiveNotesByRecId: state.executiveNotesByRecId ?? {},
    globalConsultantNotes: state.globalConsultantNotes ?? "",
    globalExecutiveNotes: state.globalExecutiveNotes ?? "",
    investment: state.investment ?? {
      laborCents: 0,
      hardwareCents: 0,
      servicesCents: 0,
      marginPercent: 35,
    },
    roadmapPhases: state.roadmapPhases ?? [],
    executiveSummary: state.executiveSummary ?? "",
    frozenAt: state.frozenAt ?? null,
  };
}
