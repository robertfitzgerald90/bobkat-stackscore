import { buildRoadmapPhaseViews } from "../roadmap";
import { computeInvestmentView } from "../pricing";
import type { TipRoadmapPhaseView } from "../types";
import {
  assignRecommendationsToPhases,
  DEFAULT_ROADMAP_PHASE_DEFINITIONS,
  resolvePhaseDefinition,
} from "./phase-config";
import {
  resolveRecommendationCostProfiles,
  sumCostProfiles,
} from "./recommendation-pricing";
import type {
  BuildTechnologyRoadmapInput,
  RoadmapPhaseInitiative,
  RoadmapPhaseResult,
  TechnologyRoadmap,
} from "./types";

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function buildPhaseExecutiveSummary(
  phaseName: string,
  timeline: string,
  initiativeCount: number,
): string {
  if (initiativeCount === 0) {
    return `No initiatives are scheduled for ${phaseName.toLowerCase()} in this planning cycle.`;
  }

  const initiativeLabel = initiativeCount === 1 ? "initiative" : "initiatives";
  return `Complete ${initiativeCount} prioritized ${initiativeLabel} during ${phaseName.toLowerCase()} (${timeline}) to reduce technology risk and improve operational maturity.`;
}

function buildPhaseInitiatives(
  recommendations: BuildTechnologyRoadmapInput["recommendations"],
  recommendationIds: string[],
  costProfiles: ReturnType<typeof resolveRecommendationCostProfiles>,
): RoadmapPhaseInitiative[] {
  const recById = new Map(recommendations.map((rec) => [rec.id, rec]));
  const costById = new Map(costProfiles.map((profile) => [profile.recommendationId, profile]));

  return recommendationIds
    .map((id) => {
      const rec = recById.get(id);
      const costProfile = costById.get(id);
      if (!rec || !costProfile) return null;

      return {
        recommendationId: rec.id,
        title: rec.title,
        priority: rec.priority,
        sortOrder: rec.sortOrder,
        costProfile,
      };
    })
    .filter((initiative): initiative is RoadmapPhaseInitiative => initiative !== null);
}

export function buildTechnologyRoadmap(
  input: BuildTechnologyRoadmapInput,
): TechnologyRoadmap {
  const sortedAssignments = [...input.phaseAssignments].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
  const costProfiles = resolveRecommendationCostProfiles(
    input.recommendations,
    input.investmentDraft,
  );
  const phaseViews = buildRoadmapPhaseViews(
    input.currentScore,
    input.recommendations,
    sortedAssignments,
  );
  const phaseViewById = new Map(phaseViews.map((phase) => [phase.id, phase]));

  const phases: RoadmapPhaseResult[] = sortedAssignments.map((assignment) => {
    const definition =
      resolvePhaseDefinition(assignment.id) ??
      DEFAULT_ROADMAP_PHASE_DEFINITIONS.find((entry) => entry.sortOrder === assignment.sortOrder) ??
      DEFAULT_ROADMAP_PHASE_DEFINITIONS[0];
    const phaseView = phaseViewById.get(assignment.id);
    const initiatives = buildPhaseInitiatives(
      input.recommendations,
      assignment.recommendationIds,
      costProfiles,
    );
    const phaseCosts = sumCostProfiles(initiatives.map((initiative) => initiative.costProfile));
    const businessOutcomes = initiatives.map((initiative) => ({
      title: initiative.title,
      description:
        input.recommendations.find((rec) => rec.id === initiative.recommendationId)
          ?.businessImpact ?? "",
    }));

    return {
      id: assignment.id,
      name: definition.name,
      subtitle: definition.subtitle,
      timeline: definition.timeline,
      sortOrder: assignment.sortOrder,
      executiveSummary: buildPhaseExecutiveSummary(
        definition.name,
        definition.timeline,
        initiatives.length,
      ),
      stackScoreImprovement: phaseView?.scoreDelta ?? 0,
      projectedScore: phaseView?.projectedScore ?? input.currentScore,
      oneTimeInvestment: phaseCosts.oneTimeInvestment,
      monthlyRecurringInvestment: phaseCosts.monthlyRecurringInvestment,
      annualRecurringInvestment: phaseCosts.annualRecurringInvestment,
      initiatives,
      businessOutcomes,
      recommendationIds: assignment.recommendationIds,
    };
  });

  const totalsFromProfiles = sumCostProfiles(costProfiles);
  const planView = computeInvestmentView(input.investmentDraft);
  const projectedFinalStackScore =
    phases.length > 0
      ? phases[phases.length - 1].projectedScore
      : input.currentScore;

  return {
    phases,
    totals: {
      totalOneTimeInvestment: totalsFromProfiles.oneTimeInvestment,
      totalMonthlyRecurring: totalsFromProfiles.monthlyRecurringInvestment,
      totalAnnualRecurring: totalsFromProfiles.annualRecurringInvestment,
      projectedFinalStackScore,
      legacyCombinedTotal: planView.clientTotal,
    },
    phaseAssignments: sortedAssignments,
  };
}

export function enrichRoadmapPhaseViews(
  roadmap: TechnologyRoadmap,
  phaseViews: TipRoadmapPhaseView[],
): TipRoadmapPhaseView[] {
  const roadmapPhaseById = new Map(roadmap.phases.map((phase) => [phase.id, phase]));

  return phaseViews.map((view) => {
    const roadmapPhase = roadmapPhaseById.get(view.id);
    if (!roadmapPhase) return view;

    return {
      ...view,
      executiveSummary: roadmapPhase.executiveSummary,
      timeline: roadmapPhase.timeline,
      oneTimeInvestment: roadmapPhase.oneTimeInvestment,
      monthlyRecurringInvestment: roadmapPhase.monthlyRecurringInvestment,
      annualRecurringInvestment: roadmapPhase.annualRecurringInvestment,
      businessOutcomes: roadmapPhase.businessOutcomes,
    };
  });
}

export function createDefaultPhaseAssignments<
  T extends { id: string; priority: import("@/generated/prisma/client").Priority; estimatedImpactPoints: number },
>(recommendations: T[], recommendationOrder: string[]) {
  return assignRecommendationsToPhases(recommendations, recommendationOrder);
}
