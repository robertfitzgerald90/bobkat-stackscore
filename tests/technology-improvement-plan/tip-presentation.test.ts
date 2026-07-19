import { describe, expect, it } from "vitest";
import {
  buildApprovalIntro,
  buildPhaseExecutiveNarrative,
  getRoadmapOverviewMetrics,
  isPhaseRecurringCoveredByRetainer,
  isRetainerCoveredService,
} from "@/lib/reports/tip-presentation";
import type { RoadmapPhaseResult, TechnologyRoadmap } from "@/lib/technology-improvement-plan/roadmap-engine";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";

function buildPhase(overrides: Partial<RoadmapPhaseResult> = {}): RoadmapPhaseResult {
  return {
    id: "phase-critical-stabilization",
    name: "Critical Stabilization",
    subtitle: "Phase 1",
    timeline: "0-30 days",
    sortOrder: 0,
    executiveSummary: "Complete 1 prioritized initiative during critical stabilization.",
    stackScoreImprovement: 8,
    projectedScore: 63,
    oneTimeInvestment: 5000,
    monthlyRecurringInvestment: 400,
    annualRecurringInvestment: 4800,
    initiatives: [
      {
        recommendationId: "rec-1",
        title: "Enable MFA",
        priority: "critical",
        sortOrder: 0,
        costProfile: {
          recommendationId: "rec-1",
          costType: "mixed",
          oneTimeInvestment: 5000,
          monthlyRecurringInvestment: 400,
          annualRecurringInvestment: 4800,
        },
      },
    ],
    businessOutcomes: [
      { title: "Enable MFA", description: "Reduce account takeover risk" },
    ],
    recommendationIds: ["rec-1"],
    ...overrides,
  };
}

describe("TIP presentation helpers", () => {
  it("builds a consulting-style phase executive narrative", () => {
    const narrative = buildPhaseExecutiveNarrative(buildPhase());
    expect(narrative).toMatch(/comes first/i);
    expect(narrative).toMatch(/critical/i);
  });

  it("detects Strategic IT Consulting retainer coverage", () => {
    expect(isRetainerCoveredService("vCIO Consulting")).toBe(true);
    expect(isRetainerCoveredService("Documentation Services")).toBe(false);

    const phase = buildPhase({
      initiatives: [
        {
          recommendationId: "rec-vcio",
          title: "Strategic planning retainer",
          priority: "high",
          sortOrder: 0,
          costProfile: {
            recommendationId: "rec-vcio",
            costType: "recurring",
            oneTimeInvestment: 0,
            monthlyRecurringInvestment: 1500,
            annualRecurringInvestment: 18000,
          },
        },
      ],
      recommendationIds: ["rec-vcio"],
    });

    const recommendations: TipRecommendationView[] = [
      {
        id: "rec-vcio",
        title: "Strategic planning retainer",
        description: "",
        businessImpact: "Ongoing guidance",
        priority: "high",
        suggestedService: "vCIO Consulting",
        estimatedImpactPoints: 5,
        categoryName: "Governance",
        consultantNote: "",
        executiveNote: "",
        sortOrder: 0,
      },
    ];

    expect(isPhaseRecurringCoveredByRetainer(phase, recommendations)).toBe(true);
  });

  it("computes roadmap overview metrics from the engine object", () => {
    const roadmap: TechnologyRoadmap = {
      phases: [buildPhase(), buildPhase({ id: "phase-high-priority", name: "High Priority Improvements", subtitle: "Phase 2", sortOrder: 1 })],
      totals: {
        totalOneTimeInvestment: 10000,
        totalMonthlyRecurring: 800,
        totalAnnualRecurring: 9600,
        projectedFinalStackScore: 78,
        legacyCombinedTotal: 10800,
      },
      phaseAssignments: [],
    };

    const metrics = getRoadmapOverviewMetrics(55, roadmap, [
      { id: "a" } as TipRecommendationView,
      { id: "b" } as TipRecommendationView,
      { id: "c" } as TipRecommendationView,
    ]);

    expect(metrics.phaseCount).toBe(2);
    expect(metrics.initiativeCount).toBe(3);
    expect(metrics.scoreImprovement).toBe(23);
    expect(metrics.projectedScore).toBe(78);
  });

  it("uses independent-phase approval language", () => {
    expect(buildApprovalIntro("Acme Foundation")).toMatch(/approved separately/i);
    expect(buildApprovalIntro("Acme Foundation")).not.toMatch(/approves the proposed initiatives and investment summarized above/i);
  });
});
