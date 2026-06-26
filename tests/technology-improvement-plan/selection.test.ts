import { describe, expect, it } from "vitest";
import { createDefaultWizardState } from "@/lib/technology-improvement-plan/defaults";
import {
  buildIncludedRecommendations,
  computeTipDerivedState,
  excludeRecommendation,
  includeRecommendation,
  moveRecommendationInOrder,
  validateTipSelection,
  type RecommendationSeed,
} from "@/lib/technology-improvement-plan/selection";

const seeds: RecommendationSeed[] = [
  {
    id: "rec-critical",
    title: "Enable MFA",
    description: "Deploy MFA",
    businessImpact: "Reduce account takeover risk",
    priority: "critical",
    suggestedService: "MFA Deployment",
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
];

describe("TIP recommendation selection", () => {
  it("excludes recommendations from derived plan totals", () => {
    const base = createDefaultWizardState(seeds);
    const excluded = excludeRecommendation(seeds, base, "rec-high");
    const derived = computeTipDerivedState(seeds, excluded, 55);

    expect(derived.recommendations).toHaveLength(2);
    expect(derived.excludedRecommendations).toHaveLength(1);
    expect(derived.projectedScore).toBeLessThan(
      computeTipDerivedState(seeds, base, 55).projectedScore,
    );
    expect(derived.investmentInternal.clientTotal).toBeLessThan(
      computeTipDerivedState(seeds, base, 55).investmentInternal.clientTotal,
    );
  });

  it("restores excluded recommendations and investment", () => {
    const base = createDefaultWizardState(seeds);
    const excluded = excludeRecommendation(seeds, base, "rec-high");
    const restored = includeRecommendation(seeds, excluded, "rec-high");
    const derived = computeTipDerivedState(seeds, restored, 55);

    expect(derived.recommendations).toHaveLength(3);
    expect(derived.excludedRecommendations).toHaveLength(0);
    expect(derived.investmentInternal.clientTotal).toBe(
      computeTipDerivedState(seeds, base, 55).investmentInternal.clientTotal,
    );
  });

  it("preserves custom order for included recommendations", () => {
    const base = createDefaultWizardState(seeds);
    let state = moveRecommendationInOrder(base, "rec-medium", "up");
    state = moveRecommendationInOrder(state, "rec-medium", "up");

    const ordered = buildIncludedRecommendations(seeds, state);
    expect(ordered.map((rec) => rec.id)).toEqual([
      "rec-medium",
      "rec-critical",
      "rec-high",
    ]);
  });

  it("requires a consultant note when excluding critical recommendations", () => {
    const base = createDefaultWizardState(seeds);
    const excluded = excludeRecommendation(seeds, base, "rec-critical");

    expect(validateTipSelection(seeds, excluded)).toMatch(/consultant note/i);
    expect(
      validateTipSelection(seeds, {
        ...excluded,
        consultantNotesByRecId: { "rec-critical": "Client deferred until Q4 budget approval." },
      }),
    ).toBeNull();
  });

  it("requires at least one included recommendation", () => {
    let state = createDefaultWizardState(seeds);
    state = {
      ...state,
      consultantNotesByRecId: {
        "rec-critical": "Deferred by client choice for this planning cycle.",
      },
    };
    state = excludeRecommendation(seeds, state, "rec-high");
    state = excludeRecommendation(seeds, state, "rec-medium");
    state = excludeRecommendation(seeds, state, "rec-critical");

    expect(validateTipSelection(seeds, state)).toMatch(/at least one recommendation/i);
  });
});
