import { describe, expect, it } from "vitest";
import {
  computeLifecycleBudget,
  effectivePhaseAnnualRecurring,
} from "@/lib/technology-lifecycle/budget";
import { buildRefreshEvents } from "@/lib/technology-lifecycle/refresh";
import { evaluatePostPhaseOpportunities } from "@/lib/technology-lifecycle/opportunity";
import { scoreToHealthBand, trendLabel } from "@/lib/technology-lifecycle/health";

describe("effectivePhaseAnnualRecurring", () => {
  it("converts monthly-only to annual without inventing extras", () => {
    expect(effectivePhaseAnnualRecurring(100, 0)).toBe(1200);
  });

  it("preserves annual-only charges", () => {
    expect(effectivePhaseAnnualRecurring(0, 5000)).toBe(5000);
  });

  it("does not double-count when annual equals monthly × 12", () => {
    expect(effectivePhaseAnnualRecurring(32319, 387828)).toBe(387828);
    expect(effectivePhaseAnnualRecurring(100, 1200)).toBe(1200);
  });

  it("uses the larger figure when annual is independently higher", () => {
    expect(effectivePhaseAnnualRecurring(100, 5000)).toBe(5000);
  });
});

describe("technology lifecycle budget", () => {
  it("separates completed, approved, proposed, and deferred one-time investment", () => {
    const budget = computeLifecycleBudget(
      [
        {
          status: "completed",
          oneTimeInvestment: 5000,
          monthlyRecurringInvestment: 0,
          annualRecurringInvestment: 0,
        },
        {
          status: "approved",
          oneTimeInvestment: 2000,
          monthlyRecurringInvestment: 0,
          annualRecurringInvestment: 0,
        },
        {
          status: "planned",
          oneTimeInvestment: 3000,
          monthlyRecurringInvestment: 0,
          annualRecurringInvestment: 0,
        },
        {
          status: "deferred",
          oneTimeInvestment: 8000,
          monthlyRecurringInvestment: 0,
          annualRecurringInvestment: 0,
        },
      ],
      [],
      0,
    );

    expect(budget.completedInvestment).toBe(5000);
    expect(budget.approvedInvestment).toBe(2000);
    expect(budget.proposedInvestment).toBe(3000);
    expect(budget.plannedInvestment).toBe(5000);
    expect(budget.deferredInvestment).toBe(8000);
    expect(budget.hasVerifiedFinancials).toBe(true);
    expect(budget.hasProposedEstimates).toBe(true);
    expect(budget.presentationMode).toBe("verified");
  });

  it("annualizes monthly recurring once when annual mirrors monthly × 12", () => {
    const budget = computeLifecycleBudget(
      [
        {
          status: "planned",
          oneTimeInvestment: 100997,
          monthlyRecurringInvestment: 32319,
          annualRecurringInvestment: 387828,
        },
      ],
      [],
      0,
    );

    expect(budget.proposedMonthlyServices).toBe(32319);
    expect(budget.proposedAnnualServices).toBe(387828);
    expect(budget.annualServices).toBe(387828);
    expect(budget.annualServices).toBe(budget.proposedMonthlyServices * 12);
    expect(budget.estimatedThreeYearInvestment).toBe(
      100997 + 387828 * 3,
    );
    expect(budget.estimatedThreeYearInvestment).not.toBe(100997 + 32319 * 72);
    expect(budget.presentationMode).toBe("estimates_only");
  });

  it("projects three years of recurring, not six", () => {
    const budget = computeLifecycleBudget(
      [
        {
          status: "awaiting_approval",
          oneTimeInvestment: 1000,
          monthlyRecurringInvestment: 100,
          annualRecurringInvestment: 1200,
        },
      ],
      [],
      0,
    );

    expect(budget.annualServices).toBe(1200);
    expect(budget.estimatedThreeYearInvestment).toBe(1000 + 1200 * 3);
  });

  it("preserves independently defined annual-only charges", () => {
    const budget = computeLifecycleBudget(
      [
        {
          status: "planned",
          oneTimeInvestment: 0,
          monthlyRecurringInvestment: 0,
          annualRecurringInvestment: 2400,
        },
      ],
      [],
      0,
    );

    expect(budget.proposedMonthlyServices).toBe(0);
    expect(budget.proposedAnnualServices).toBe(2400);
    expect(budget.annualServices).toBe(2400);
    expect(budget.estimatedThreeYearInvestment).toBe(7200);
  });

  it("does not double-count contracted billing and overlapping roadmap estimates", () => {
    const budget = computeLifecycleBudget(
      [
        {
          status: "planned",
          oneTimeInvestment: 0,
          monthlyRecurringInvestment: 500,
          annualRecurringInvestment: 6000,
        },
      ],
      [],
      400,
    );

    expect(budget.contractedMonthlyServices).toBe(400);
    expect(budget.proposedMonthlyServices).toBe(500);
    expect(budget.monthlyServices).toBe(500);
    expect(budget.annualServices).toBe(6000);
    expect(budget.monthlyServices).not.toBe(900);
  });

  it("prefers higher contracted monthly over lower roadmap estimate without summing", () => {
    const budget = computeLifecycleBudget(
      [
        {
          status: "planned",
          oneTimeInvestment: 0,
          monthlyRecurringInvestment: 100,
          annualRecurringInvestment: 1200,
        },
      ],
      [],
      250,
    );

    expect(budget.monthlyServices).toBe(250);
    expect(budget.annualServices).toBe(3000);
    expect(budget.hasVerifiedFinancials).toBe(true);
    expect(budget.presentationMode).toBe("verified");
  });

  it("excludes deferred phases from recurring and proposed one-time", () => {
    const budget = computeLifecycleBudget(
      [
        {
          status: "planned",
          oneTimeInvestment: 1000,
          monthlyRecurringInvestment: 50,
          annualRecurringInvestment: 600,
        },
        {
          status: "deferred",
          oneTimeInvestment: 9000,
          monthlyRecurringInvestment: 500,
          annualRecurringInvestment: 6000,
        },
      ],
      [],
      0,
    );

    expect(budget.proposedInvestment).toBe(1000);
    expect(budget.deferredInvestment).toBe(9000);
    expect(budget.proposedMonthlyServices).toBe(50);
    expect(budget.annualServices).toBe(600);
  });

  it("uses empty presentation when no financial data exists", () => {
    const budget = computeLifecycleBudget([], [], 0);
    expect(budget.presentationMode).toBe("empty");
    expect(budget.hasVerifiedFinancials).toBe(false);
    expect(budget.hasProposedEstimates).toBe(false);
    expect(budget.estimatedThreeYearInvestment).toBe(0);
  });

  it("classifies TIP planned phases as proposed, not approved", () => {
    const budget = computeLifecycleBudget(
      [
        {
          status: "planned",
          oneTimeInvestment: 100997,
          monthlyRecurringInvestment: 32319,
          annualRecurringInvestment: 387828,
        },
        {
          status: "awaiting_approval",
          oneTimeInvestment: 500,
          monthlyRecurringInvestment: 0,
          annualRecurringInvestment: 0,
        },
      ],
      [],
      0,
    );

    expect(budget.approvedInvestment).toBe(0);
    expect(budget.proposedInvestment).toBe(101497);
    expect(budget.completedInvestment).toBe(0);
    expect(budget.contractedMonthlyServices).toBe(0);
    expect(budget.presentationMode).toBe("estimates_only");
  });

  it("preserves existing verified financial records alongside proposed estimates", () => {
    const budget = computeLifecycleBudget(
      [
        {
          status: "completed",
          oneTimeInvestment: 12000,
          monthlyRecurringInvestment: 0,
          annualRecurringInvestment: 0,
        },
        {
          status: "in_progress",
          oneTimeInvestment: 4000,
          monthlyRecurringInvestment: 0,
          annualRecurringInvestment: 0,
        },
        {
          status: "planned",
          oneTimeInvestment: 50000,
          monthlyRecurringInvestment: 1000,
          annualRecurringInvestment: 12000,
        },
      ],
      [],
      800,
    );

    expect(budget.completedInvestment).toBe(12000);
    expect(budget.approvedInvestment).toBe(4000);
    expect(budget.proposedInvestment).toBe(50000);
    expect(budget.contractedMonthlyServices).toBe(800);
    expect(budget.monthlyServices).toBe(1000);
    expect(budget.presentationMode).toBe("verified");
  });

  it("keeps tenant budgets isolated by operating only on caller-supplied phase inputs", () => {
    const tenantA = computeLifecycleBudget(
      [
        {
          status: "planned",
          oneTimeInvestment: 1000,
          monthlyRecurringInvestment: 10,
          annualRecurringInvestment: 120,
        },
      ],
      [],
      0,
    );
    const tenantB = computeLifecycleBudget(
      [
        {
          status: "planned",
          oneTimeInvestment: 999999,
          monthlyRecurringInvestment: 5000,
          annualRecurringInvestment: 60000,
        },
      ],
      [],
      0,
    );

    expect(tenantA.proposedInvestment).toBe(1000);
    expect(tenantA.annualServices).toBe(120);
    expect(tenantB.proposedInvestment).toBe(999999);
    expect(tenantA.estimatedThreeYearInvestment).not.toBe(
      tenantB.estimatedThreeYearInvestment,
    );
  });

  it("includes refresh budget and treats it as verified financial signal", () => {
    const budget = computeLifecycleBudget(
      [],
      [
        {
          budgetAmountCents: 120000,
          budgetPeriod: "one_time",
          plannedReplacementDate: new Date("2027-01-01"),
        },
      ],
      0,
      new Date("2026-07-19"),
    );

    expect(budget.futureRefreshBudget).toBe(1200);
    expect(budget.hasVerifiedFinancials).toBe(true);
    expect(budget.presentationMode).toBe("verified");
    expect(budget.estimatedThreeYearInvestment).toBe(1200);
  });

  it("keeps existing mixed-status regression totals coherent", () => {
    const budget = computeLifecycleBudget(
      [
        {
          status: "completed",
          oneTimeInvestment: 5000,
          monthlyRecurringInvestment: 200,
          annualRecurringInvestment: 0,
        },
        {
          status: "awaiting_approval",
          oneTimeInvestment: 3000,
          monthlyRecurringInvestment: 150,
          annualRecurringInvestment: 500,
        },
        {
          status: "deferred",
          oneTimeInvestment: 8000,
          monthlyRecurringInvestment: 0,
          annualRecurringInvestment: 0,
        },
      ],
      [
        {
          budgetAmountCents: 120000,
          budgetPeriod: "one_time",
          plannedReplacementDate: new Date("2027-01-01"),
        },
      ],
      0,
      new Date("2026-07-19"),
    );

    expect(budget.completedInvestment).toBe(5000);
    expect(budget.proposedInvestment).toBe(3000);
    expect(budget.plannedInvestment).toBe(3000);
    expect(budget.deferredInvestment).toBe(8000);
    expect(budget.monthlyServices).toBe(350);
    // annual = max(200*12, 0) + max(150*12, 500) = 2400 + 1800 = 4200
    expect(budget.annualServices).toBe(4200);
    expect(budget.futureRefreshBudget).toBe(1200);
    expect(budget.estimatedThreeYearInvestment).toBe(5000 + 3000 + 4200 * 3 + 1200);
  });
});

describe("technology refresh events", () => {
  it("surfaces upcoming warranty and renewal events within a year", () => {
    const now = new Date("2026-07-19T00:00:00.000Z");
    const events = buildRefreshEvents(
      [
        {
          id: "tech-1",
          displayName: "Firewall Cluster",
          technologyName: "Ubiquiti Gateway",
          categoryName: "Network",
          lifecycleStatus: "replacement_planned",
          warrantyExpiresAt: new Date("2026-08-01T00:00:00.000Z"),
          licenseRenewalDate: null,
          renewalDate: null,
          plannedReplacementDate: new Date("2026-09-15T00:00:00.000Z"),
        },
      ],
      now,
    );

    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events[0]?.urgency).toBe("upcoming");
    expect(events.some((event) => event.eventType === "warranty_expiration")).toBe(true);
  });
});

describe("opportunity engine", () => {
  it("creates post-phase candidates for high-priority open work and aging tech", () => {
    const candidates = evaluatePostPhaseOpportunities({
      completedPhaseName: "Phase 1 — Critical Stabilization",
      openRecommendations: [
        {
          id: "rec-1",
          title: "Enable MFA everywhere",
          description: "Close remaining identity gaps.",
          priority: "critical",
          estimatedImpactPoints: 8,
          alreadyOnRoadmap: false,
        },
        {
          id: "rec-2",
          title: "Already planned",
          description: "Skip",
          priority: "high",
          estimatedImpactPoints: 4,
          alreadyOnRoadmap: true,
        },
      ],
      refreshEvents: [
        {
          title: "Backup appliance",
          eventType: "planned_replacement",
          urgency: "overdue",
          daysUntilDue: -10,
        },
      ],
      criticalOpenCount: 3,
    });

    expect(candidates.some((item) => item.title === "Enable MFA everywhere")).toBe(true);
    expect(
      candidates.some(
        (item) => item.source === "refresh_cycle" || item.source === "technology_aging",
      ),
    ).toBe(true);
    expect(candidates.some((item) => item.source === "emerging_risk")).toBe(true);
  });
});

describe("lifecycle health", () => {
  it("maps scores and trend labels", () => {
    expect(scoreToHealthBand(85)).toBe("healthy");
    expect(scoreToHealthBand(55)).toBe("critical");
    expect(trendLabel("improving", 4)).toBe("Improving");
    expect(trendLabel("declining", -3)).toBe("Declining");
  });
});
