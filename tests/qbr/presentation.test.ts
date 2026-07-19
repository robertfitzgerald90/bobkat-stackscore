import { describe, expect, it } from "vitest";
import {
  buildQbrDashboardKpis,
  formatSignedPoints,
  getBudgetUtilizationPercent,
  getRoadmapCompletionPercent,
  groupOpportunitiesByPriority,
} from "@/lib/qbr/presentation";
import type { QbrReportData } from "@/lib/qbr/types";

function baseReport(overrides: Partial<QbrReportData> = {}): QbrReportData {
  return {
    id: "qbr-1",
    clientId: "client-1",
    clientName: "Acme Corp",
    title: "Business Review — Acme Corp",
    reviewPeriodLabel: "Apr 1, 2026 – Jun 30, 2026",
    reviewPeriodStart: "2026-04-01T00:00:00.000Z",
    reviewPeriodEnd: "2026-06-30T23:59:59.999Z",
    generatedAt: "2026-06-28T12:00:00.000Z",
    generatedDateLabel: "Jun 28, 2026",
    executiveSummary: "Strong quarter.",
    currentStackScore: 72,
    currentMaturityLabel: "Managed",
    scoreAtPeriodStart: 65,
    scoreAtPeriodEnd: 72,
    scoreChange: 7,
    assessmentsCompletedInPeriod: 1,
    projectsCompletedInPeriod: 2,
    recommendationsResolvedInPeriod: 3,
    journeyEvents: [],
    completedProjects: [],
    categoryImprovements: [],
    resolvedRecommendations: [],
    remainingOpportunities: [
      {
        id: "r1",
        title: "Critical MFA gap",
        priority: "critical",
        status: "open",
        categoryName: "Security",
        resolvedAt: null,
        businessImpact: "Reduces account takeover risk.",
      },
      {
        id: "r2",
        title: "Backup monitoring",
        priority: "medium",
        status: "open",
        categoryName: "Backup & Recovery",
        resolvedAt: null,
        businessImpact: "Improves restore confidence.",
      },
    ],
    roadmapPhases: [
      {
        phaseName: "Phase 1",
        timeframe: "Q3",
        initiativeCount: 2,
        summary: "Stabilize",
        status: "completed",
      },
      {
        phaseName: "Phase 2",
        timeframe: "Q4",
        initiativeCount: 3,
        summary: "Modernize",
        status: "in_progress",
      },
    ],
    budgetForecast: {
      completedInvestment: 18000,
      plannedInvestment: 48000,
      deferredInvestment: 6000,
      monthlyServices: 1500,
      estimatedThreeYearInvestment: 120000,
    },
    technologyRisks: ["Legacy firewall"],
    strategicRecommendations: ["Approve Phase 2"],
    businessGoalLabel: "Reduce downtime",
    businessGoalProgress: "On track",
    technologyVision: "Managed IT maturity",
    visionProgress: "Advancing",
    nextQuarterPriorities: ["Complete Phase 2"],
    ...overrides,
  };
}

describe("qbr presentation helpers", () => {
  it("formats signed score deltas", () => {
    expect(formatSignedPoints(7)).toBe("+7");
    expect(formatSignedPoints(-2)).toBe("-2");
    expect(formatSignedPoints(null)).toBe("—");
  });

  it("computes roadmap and budget utilization", () => {
    const report = baseReport();
    expect(getRoadmapCompletionPercent(report.roadmapPhases)).toBe(50);
    expect(getBudgetUtilizationPercent(report.budgetForecast)).toBe(38);
  });

  it("builds executive dashboard KPIs and groups opportunities", () => {
    const report = baseReport();
    const kpis = buildQbrDashboardKpis(report);
    expect(kpis.some((kpi) => kpi.label === "Technology Score" && kpi.value === "72")).toBe(true);
    expect(kpis.some((kpi) => kpi.label === "Improvement Since Last Review" && kpi.value === "+7")).toBe(true);

    const groups = groupOpportunitiesByPriority(report.remainingOpportunities);
    expect(groups[0]?.priority).toBe("critical");
    expect(groups[0]?.items).toHaveLength(1);
    expect(groups.some((group) => group.priority === "medium")).toBe(true);
  });
});
