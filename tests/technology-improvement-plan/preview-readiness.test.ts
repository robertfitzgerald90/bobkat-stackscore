import { describe, expect, it } from "vitest";
import {
  evaluateTipReportReadiness,
  isTipReportReadyForGeneration,
  resolveExecutiveSummaryText,
} from "@/lib/technology-improvement-plan/preview-readiness";
import type { TipPlanDetail } from "@/lib/technology-improvement-plan/types";

function buildPlan(overrides: Partial<TipPlanDetail> = {}): TipPlanDetail {
  return {
    id: "tip-1",
    clientId: "client-1",
    assessmentId: "assessment-1",
    status: "draft",
    currentStep: "preview",
    version: 1,
    title: "Technology Improvement Plan",
    generatedAt: null,
    documentId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    wizardState: {
      removedRecommendationIds: [],
      deferredRecommendationIds: [],
      recommendationOrder: [],
      consultantNotesByRecId: {},
      executiveNotesByRecId: {},
      globalConsultantNotes: "",
      globalExecutiveNotes: "",
      investment: { laborCents: 100000, hardwareCents: 0, servicesCents: 0, marginPercent: 20 },
      roadmapPhases: [{ id: "p1", label: "Phase 1", sortOrder: 0, recommendationIds: ["r1"] }],
      executiveSummary: "",
      frozenAt: null,
    },
    executiveSummary: null,
    isEditable: true,
    isAdmin: true,
    profile: {} as TipPlanDetail["profile"],
    recommendations: [
      {
        id: "r1",
        title: "MFA rollout",
        description: "",
        businessImpact: "Reduce account takeover risk",
        priority: "high",
        suggestedService: null,
        estimatedImpactPoints: 5,
        categoryName: "Identity",
        consultantNote: "",
        executiveNote: "",
        sortOrder: 0,
      },
    ],
    excludedRecommendations: [],
    deferredRecommendations: [],
    selectionSummary: {
      includedCount: 1,
      excludedCount: 0,
      deferredCount: 0,
      clientInvestmentTotal: 1200,
      oneTimeInvestmentTotal: 1200,
      monthlyRecurringTotal: 0,
      annualRecurringTotal: 0,
      laborTotal: 1000,
      hardwareTotal: 0,
      servicesTotal: 0,
      projectedScoreImprovement: 5,
      estimatedTimeline: "0–90 days",
    },
    playbooks: [{ id: "pb1" } as TipPlanDetail["playbooks"][number]],
    investment: {
      labor: 1000,
      hardware: 0,
      services: 0,
      subtotal: 1000,
      marginPercent: 20,
      marginAmount: 200,
      clientTotal: 1200,
    },
    investmentInternal: {
      labor: 1000,
      hardware: 0,
      services: 0,
      subtotal: 1000,
      marginPercent: 20,
      marginAmount: 200,
      clientTotal: 1200,
    },
    roadmapPhases: [
      {
        id: "p1",
        label: "Phase 1",
        sortOrder: 0,
        recommendationIds: ["r1"],
        recommendations: [
          {
            id: "r1",
            title: "MFA rollout",
            description: "",
            businessImpact: "Reduce account takeover risk",
            priority: "high",
            suggestedService: null,
            estimatedImpactPoints: 5,
            categoryName: "Identity",
            consultantNote: "",
            executiveNote: "",
            sortOrder: 0,
          },
        ],
        projectedScore: 70,
        scoreDelta: 5,
      },
    ],
    technologyRoadmap: {
      phases: [
        {
          id: "p1",
          name: "High Priority Improvements",
          subtitle: "Phase 2",
          timeline: "30-90 days",
          sortOrder: 0,
          executiveSummary: "Complete 1 prioritized initiative during high priority improvements (30-90 days).",
          stackScoreImprovement: 5,
          projectedScore: 70,
          oneTimeInvestment: 1200,
          monthlyRecurringInvestment: 0,
          annualRecurringInvestment: 0,
          initiatives: [],
          businessOutcomes: [{ title: "MFA rollout", description: "Reduce account takeover risk" }],
          recommendationIds: ["r1"],
        },
      ],
      totals: {
        totalOneTimeInvestment: 1200,
        totalMonthlyRecurring: 0,
        totalAnnualRecurring: 0,
        projectedFinalStackScore: 70,
        legacyCombinedTotal: 1200,
      },
      phaseAssignments: [{ id: "p1", label: "Phase 1", sortOrder: 0, recommendationIds: ["r1"] }],
    },
    currentScore: 65,
    projectedScore: 70,
    assessmentName: "Baseline Assessment",
    clientName: "Acme Foundation",
    ...overrides,
  };
}

describe("preview-readiness", () => {
  it("resolves executive summary from wizard state fields", () => {
    const plan = buildPlan({
      wizardState: {
        ...buildPlan().wizardState,
        executiveSummary: "Custom summary",
      },
    });

    expect(resolveExecutiveSummaryText(plan, "")).toBe("Custom summary");
  });

  it("marks required sections ready when plan data is complete", () => {
    const plan = buildPlan({
      wizardState: {
        ...buildPlan().wizardState,
        executiveSummary: "Executive narrative for the board.",
      },
    });

    const items = evaluateTipReportReadiness(plan, plan.wizardState.executiveSummary);
    expect(isTipReportReadyForGeneration(items)).toBe(true);
  });

  it("blocks generation when executive summary is missing", () => {
    const items = evaluateTipReportReadiness(buildPlan(), "");
    expect(isTipReportReadyForGeneration(items)).toBe(false);
    expect(items.find((item) => item.id === "executive-summary")?.ready).toBe(false);
  });
});
