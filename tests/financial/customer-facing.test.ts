import { describe, expect, it } from "vitest";
import {
  scrubBudgetPlanForCustomer,
  scrubLifecycleDashboardForCustomer,
  scrubQbrBudgetForecastForCustomer,
  scrubRoadmapDashboardForCustomer,
  shouldHideSpeculativeFinancials,
} from "@/lib/financial/customer-facing";
import type { LifecycleBudgetPlan, TechnologyLifecycleDashboard } from "@/lib/technology-lifecycle/types";
import type { ClientRoadmapDashboard } from "@/lib/client-roadmap/types";

function sampleBudget(overrides: Partial<LifecycleBudgetPlan> = {}): LifecycleBudgetPlan {
  return {
    completedInvestment: 0,
    approvedInvestment: 0,
    proposedInvestment: 120_000,
    plannedInvestment: 120_000,
    deferredInvestment: 8_000,
    contractedMonthlyServices: 0,
    contractedAnnualServices: 0,
    proposedMonthlyServices: 32_319,
    proposedAnnualServices: 387_828,
    monthlyServices: 32_319,
    annualServices: 387_828,
    futureRefreshBudget: 0,
    estimatedThreeYearInvestment: 1_264_480.88,
    hasVerifiedFinancials: false,
    hasProposedEstimates: true,
    presentationMode: "estimates_only",
    ...overrides,
  };
}

describe("shouldHideSpeculativeFinancials", () => {
  it("hides speculative figures for client role only", () => {
    expect(shouldHideSpeculativeFinancials("client")).toBe(true);
    expect(shouldHideSpeculativeFinancials("admin")).toBe(false);
    expect(shouldHideSpeculativeFinancials("technician")).toBe(false);
  });
});

describe("scrubBudgetPlanForCustomer", () => {
  it("removes proposed one-time, monthly, annual, and three-year estimates", () => {
    const scrubbed = scrubBudgetPlanForCustomer(sampleBudget());

    expect(scrubbed.proposedInvestment).toBe(0);
    expect(scrubbed.proposedMonthlyServices).toBe(0);
    expect(scrubbed.proposedAnnualServices).toBe(0);
    expect(scrubbed.deferredInvestment).toBe(0);
    expect(scrubbed.estimatedThreeYearInvestment).toBe(0);
    expect(scrubbed.hasProposedEstimates).toBe(false);
    expect(scrubbed.presentationMode).toBe("empty");
  });

  it("preserves verified completed, approved, contracted, and refresh amounts", () => {
    const scrubbed = scrubBudgetPlanForCustomer(
      sampleBudget({
        completedInvestment: 5_000,
        approvedInvestment: 2_000,
        contractedMonthlyServices: 500,
        contractedAnnualServices: 6_000,
        futureRefreshBudget: 1_500,
        hasVerifiedFinancials: true,
        presentationMode: "verified",
      }),
    );

    expect(scrubbed.completedInvestment).toBe(5_000);
    expect(scrubbed.approvedInvestment).toBe(2_000);
    expect(scrubbed.contractedMonthlyServices).toBe(500);
    expect(scrubbed.contractedAnnualServices).toBe(6_000);
    expect(scrubbed.futureRefreshBudget).toBe(1_500);
    expect(scrubbed.proposedInvestment).toBe(0);
    expect(scrubbed.estimatedThreeYearInvestment).toBe(0);
    expect(scrubbed.presentationMode).toBe("verified");
  });
});

describe("scrubLifecycleDashboardForCustomer", () => {
  it("zeros phase and opportunity investment estimates", () => {
    const dashboard = {
      clientId: "c1",
      clientName: "ABC",
      budget: sampleBudget(),
      phases: [
        {
          id: "p1",
          name: "Phase 1",
          subtitle: "Foundation",
          status: "planned",
          statusLabel: "Planned",
          oneTimeInvestment: 40_000,
          monthlyRecurringInvestment: 1_200,
        },
      ],
      opportunities: [
        {
          id: "o1",
          source: "assessment",
          status: "open",
          title: "Opportunity",
          description: "Desc",
          priority: "high",
          estimatedImpactPoints: 5,
          estimatedOneTimeInvestment: 9_999,
          relatedServiceKey: null,
          createdAt: new Date().toISOString(),
        },
      ],
      initiativeEffectiveness: [
        {
          initiativeId: "i1",
          title: "Done",
          completionDate: null,
          estimatedCost: 3_000,
          actualCost: 2_500,
          estimatedScoreIncrease: 4,
          actualScoreIncrease: 3,
          businessValue: null,
          status: "completed",
        },
      ],
    } as unknown as TechnologyLifecycleDashboard;

    const scrubbed = scrubLifecycleDashboardForCustomer(dashboard);

    expect(scrubbed.phases[0]?.oneTimeInvestment).toBe(0);
    expect(scrubbed.phases[0]?.monthlyRecurringInvestment).toBe(0);
    expect(scrubbed.opportunities[0]?.estimatedOneTimeInvestment).toBe(0);
    expect(scrubbed.initiativeEffectiveness[0]?.estimatedCost).toBeNull();
    expect(scrubbed.initiativeEffectiveness[0]?.actualCost).toBe(2_500);
    expect(scrubbed.budget.proposedInvestment).toBe(0);
  });
});

describe("scrubRoadmapDashboardForCustomer", () => {
  it("clears remaining investment KPIs while leaving score metrics intact", () => {
    const dashboard = {
      scoreJourney: { baselineScore: 40, effectiveScore: 45, projectedFinalScore: 70 },
      metrics: {
        completionPercent: 25,
        remainingOneTimeInvestment: 90_000,
        remainingMonthlyRecurring: 2_000,
        currentMonthlyServices: 500,
        projectedMonthlyServicesAfterCompletion: 2_500,
        domainImprovements: {
          securityImprovement: 1,
          infrastructureImprovement: 2,
          businessContinuityImprovement: 0,
          operationalMaturityImprovement: 1,
        },
      },
      phases: [
        {
          oneTimeInvestment: 45_000,
          monthlyRecurringInvestment: 1_000,
          annualRecurringInvestment: 12_000,
        },
      ],
    } as unknown as ClientRoadmapDashboard;

    const scrubbed = scrubRoadmapDashboardForCustomer(dashboard);

    expect(scrubbed.metrics.remainingOneTimeInvestment).toBe(0);
    expect(scrubbed.metrics.remainingMonthlyRecurring).toBe(0);
    expect(scrubbed.metrics.currentMonthlyServices).toBe(0);
    expect(scrubbed.metrics.projectedMonthlyServicesAfterCompletion).toBe(0);
    expect(scrubbed.metrics.completionPercent).toBe(25);
    expect(scrubbed.phases[0]?.oneTimeInvestment).toBe(0);
    expect(scrubbed.phases[0]?.monthlyRecurringInvestment).toBe(0);
    expect(scrubbed.phases[0]?.annualRecurringInvestment).toBe(0);
  });
});

describe("scrubQbrBudgetForecastForCustomer", () => {
  it("returns null when only speculative planned figures exist", () => {
    expect(
      scrubQbrBudgetForecastForCustomer({
        completedInvestment: 0,
        plannedInvestment: 100_000,
        deferredInvestment: 5_000,
        monthlyServices: 1_000,
        estimatedThreeYearInvestment: 400_000,
      }),
    ).toBeNull();
  });

  it("keeps completed investment and clears speculative fields", () => {
    expect(
      scrubQbrBudgetForecastForCustomer({
        completedInvestment: 12_000,
        plannedInvestment: 100_000,
        deferredInvestment: 5_000,
        monthlyServices: 1_000,
        estimatedThreeYearInvestment: 400_000,
      }),
    ).toEqual({
      completedInvestment: 12_000,
      plannedInvestment: 0,
      deferredInvestment: 0,
      monthlyServices: 0,
      estimatedThreeYearInvestment: 0,
    });
  });
});
