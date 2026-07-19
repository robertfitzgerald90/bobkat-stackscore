import { describe, expect, it } from "vitest";
import {
  assignRecommendationsToPhases,
  buildTechnologyRoadmap,
  DEFAULT_ROADMAP_PHASE_DEFINITIONS,
  resolveRecommendationCostProfiles,
  resolveServicePricingRule,
} from "@/lib/technology-improvement-plan/roadmap-engine";
import { createDefaultWizardState } from "@/lib/technology-improvement-plan/defaults";
import { computeTipDerivedState, type RecommendationSeed } from "@/lib/technology-improvement-plan/selection";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";

const seeds: RecommendationSeed[] = [
  {
    id: "rec-critical",
    title: "Enable MFA",
    description: "Deploy MFA",
    businessImpact: "Reduce account takeover risk",
    priority: "critical",
    suggestedService: "Microsoft 365 Protection",
    estimatedImpactPoints: 10,
    categoryName: "Security",
  },
  {
    id: "rec-high",
    title: "Backup validation",
    description: "Test restores",
    businessImpact: "Improve recovery confidence",
    priority: "high",
    suggestedService: "Backup & Disaster Recovery",
    estimatedImpactPoints: 8,
    categoryName: "Business Continuity",
  },
  {
    id: "rec-medium",
    title: "Document assets",
    description: "Improve inventory",
    businessImpact: "Improve operational visibility",
    priority: "medium",
    suggestedService: "Documentation Services",
    estimatedImpactPoints: 5,
    categoryName: "Operations",
  },
  {
    id: "rec-low",
    title: "Lifecycle planning",
    description: "Plan refresh cycles",
    businessImpact: "Reduce unplanned spend",
    priority: "low",
    suggestedService: "Lifecycle Management",
    estimatedImpactPoints: 4,
    categoryName: "Operations",
  },
];

function toRecommendationViews(
  includedSeeds: RecommendationSeed[],
): TipRecommendationView[] {
  return includedSeeds.map((seed, sortOrder) => ({
    id: seed.id,
    title: seed.title,
    description: seed.description,
    businessImpact: seed.businessImpact,
    priority: seed.priority,
    suggestedService: seed.suggestedService,
    estimatedImpactPoints: seed.estimatedImpactPoints,
    categoryName: seed.categoryName,
    consultantNote: "",
    executiveNote: "",
    sortOrder,
  }));
}

describe("Technology Roadmap Engine", () => {
  it("uses configurable default phase definitions", () => {
    expect(DEFAULT_ROADMAP_PHASE_DEFINITIONS).toHaveLength(4);
    expect(DEFAULT_ROADMAP_PHASE_DEFINITIONS[0].name).toBe("Critical Stabilization");
    expect(DEFAULT_ROADMAP_PHASE_DEFINITIONS[0].timeline).toBe("0-30 days");
  });

  it("assigns recommendations to phases by priority while preserving order", () => {
    const phases = assignRecommendationsToPhases(seeds, [
      "rec-medium",
      "rec-critical",
      "rec-high",
      "rec-low",
    ]);

    expect(phases).toHaveLength(4);
    expect(phases[0].recommendationIds).toEqual(["rec-critical"]);
    expect(phases[1].recommendationIds).toEqual(["rec-high"]);
    expect(phases[2].recommendationIds).toEqual(["rec-medium"]);
    expect(phases[3].recommendationIds).toEqual(["rec-low"]);
  });

  it("classifies service pricing by cost type", () => {
    expect(resolveServicePricingRule("Managed IT Services").costType).toBe("recurring");
    expect(resolveServicePricingRule("Documentation Services").costType).toBe("one_time");
    expect(resolveServicePricingRule("Backup & Disaster Recovery").costType).toBe("mixed");
  });

  it("separates one-time and recurring investment totals", () => {
    const state = createDefaultWizardState(seeds);
    const recommendations = toRecommendationViews(seeds);
    const profiles = resolveRecommendationCostProfiles(recommendations, state.investment);
    const derived = computeTipDerivedState(seeds, state, 55);

    const oneTime = profiles.reduce((sum, profile) => sum + profile.oneTimeInvestment, 0);
    const monthly = profiles.reduce(
      (sum, profile) => sum + profile.monthlyRecurringInvestment,
      0,
    );

    expect(oneTime).toBeGreaterThan(0);
    expect(monthly).toBeGreaterThan(0);
    expect(oneTime + monthly).toBeCloseTo(derived.investmentInternal.clientTotal, 0);
  });

  it("builds a structured roadmap with phase summaries and totals", () => {
    const state = createDefaultWizardState(seeds);
    const recommendations = toRecommendationViews(seeds);
    const derived = computeTipDerivedState(seeds, state, 55);
    const roadmap = buildTechnologyRoadmap({
      currentScore: 55,
      recommendations,
      phaseAssignments: state.roadmapPhases,
      investmentDraft: state.investment,
    });

    expect(roadmap.phases).toHaveLength(4);
    expect(roadmap.phases[0].executiveSummary).toMatch(/critical stabilization/i);
    expect(roadmap.phases[0].stackScoreImprovement).toBeGreaterThan(0);
    expect(roadmap.phases[0].initiatives).toHaveLength(1);
    expect(roadmap.phases[0].businessOutcomes[0].title).toBe("Enable MFA");
    expect(roadmap.totals.totalOneTimeInvestment).toBeGreaterThan(0);
    expect(roadmap.totals.totalMonthlyRecurring).toBeGreaterThan(0);
    expect(roadmap.totals.totalAnnualRecurring).toBe(
      roadmap.totals.totalMonthlyRecurring * 12,
    );
    expect(roadmap.totals.projectedFinalStackScore).toBeGreaterThan(55);
    expect(roadmap.totals.legacyCombinedTotal).toBe(derived.investmentInternal.clientTotal);
  });

  it("documents one-time-only recommendations without recurring charges", () => {
    const state = createDefaultWizardState([seeds[2]]);
    const recommendations = toRecommendationViews([seeds[2]]);
    const profiles = resolveRecommendationCostProfiles(recommendations, state.investment);

    expect(profiles[0].costType).toBe("one_time");
    expect(profiles[0].monthlyRecurringInvestment).toBe(0);
    expect(profiles[0].oneTimeInvestment).toBeGreaterThan(0);
  });

  it("integrates with computeTipDerivedState without changing assessment totals", () => {
    const state = createDefaultWizardState(seeds);
    const derived = computeTipDerivedState(seeds, state, 55);

    expect(derived.technologyRoadmap.phases).toHaveLength(4);
    expect(derived.selectionSummary.oneTimeInvestmentTotal).toBe(
      derived.technologyRoadmap.totals.totalOneTimeInvestment,
    );
    expect(derived.selectionSummary.clientInvestmentTotal).toBe(
      derived.investmentInternal.clientTotal,
    );
    expect(derived.roadmapPhases[0].oneTimeInvestment).toBe(
      derived.technologyRoadmap.phases[0].oneTimeInvestment,
    );
  });
});
