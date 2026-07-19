import { describe, expect, it } from "vitest";
import { computeLifecycleBudget } from "@/lib/technology-lifecycle/budget";
import { buildRefreshEvents } from "@/lib/technology-lifecycle/refresh";
import { evaluatePostPhaseOpportunities } from "@/lib/technology-lifecycle/opportunity";
import { scoreToHealthBand, trendLabel } from "@/lib/technology-lifecycle/health";

describe("technology lifecycle budget", () => {
  it("separates completed, planned, and deferred investment and projects 3-year spend", () => {
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
    expect(budget.plannedInvestment).toBe(3000);
    expect(budget.deferredInvestment).toBe(8000);
    expect(budget.monthlyServices).toBe(350);
    expect(budget.futureRefreshBudget).toBe(1200);
    expect(budget.estimatedThreeYearInvestment).toBeGreaterThan(budget.plannedInvestment);
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
    expect(candidates.some((item) => item.source === "refresh_cycle" || item.source === "technology_aging")).toBe(
      true,
    );
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
