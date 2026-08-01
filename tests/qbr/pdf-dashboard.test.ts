import { describe, expect, it } from "vitest";
import {
  buildQbrExecutiveHealthSummary,
  buildQbrPdfDashboardMetrics,
} from "@/lib/qbr/presentation";
import type { QbrReportData } from "@/lib/qbr/types";

function sampleReport(overrides: Partial<QbrReportData> = {}): QbrReportData {
  return {
    id: "qbr-1",
    clientId: "c-1",
    clientName: "Acme Inc.",
    title: "Acme Business Review",
    reviewPeriodLabel: "Apr 1, 2026 to Jun 30, 2026",
    reviewPeriodStart: "2026-04-01T00:00:00.000Z",
    reviewPeriodEnd: "2026-06-30T23:59:59.000Z",
    generatedAt: "2026-07-01T12:00:00.000Z",
    generatedDateLabel: "July 1, 2026",
    executiveSummary: "Strong period.",
    currentStackScore: 72,
    currentMaturityLabel: "Stable",
    scoreAtPeriodStart: 64,
    scoreAtPeriodEnd: 72,
    scoreChange: 8,
    assessmentsCompletedInPeriod: 1,
    projectsCompletedInPeriod: 2,
    recommendationsResolvedInPeriod: 3,
    journeyEvents: [],
    completedProjects: [],
    categoryImprovements: [
      {
        categoryName: "Cybersecurity",
        previousScore: 50,
        currentScore: 78,
        change: 28,
      },
    ],
    resolvedRecommendations: [],
    remainingOpportunities: [
      {
        id: "r1",
        title: "Modernize backups",
        priority: "high",
        status: "open",
        categoryName: "Business Continuity",
        resolvedAt: null,
        businessImpact: "Restore confidence",
      },
    ],
    roadmapPhases: [
      {
        phaseName: "Stabilize",
        timeframe: "Q2",
        initiativeCount: 3,
        summary: "Close gaps",
        status: "completed",
      },
    ],
    budgetForecast: {
      completedInvestment: 12000,
      plannedInvestment: 40000,
      deferredInvestment: 5000,
      monthlyServices: 2500,
      estimatedThreeYearInvestment: 120000,
    },
    technologyRisks: ["Unsupported firewall increases perimeter risk."],
    strategicRecommendations: ["Complete endpoint standardization."],
    businessGoalLabel: null,
    businessGoalProgress: "",
    technologyVision: null,
    visionProgress: "",
    nextQuarterPriorities: ["Deploy EDR"],
    ...overrides,
  };
}

describe("buildQbrPdfDashboardMetrics", () => {
  it("returns exactly six executive metrics for the PDF grid", () => {
    const metrics = buildQbrPdfDashboardMetrics(sampleReport());
    expect(metrics).toHaveLength(6);
    expect(metrics.map((metric) => metric.label)).toEqual([
      "Roadmap Progress",
      "Projects Completed",
      "Recommendations Closed",
      "Open Risks",
      "Budget Utilized",
      "Planned Investment",
    ]);
  });
});

describe("buildQbrExecutiveHealthSummary", () => {
  it("derives health narrative from report data without inventing claims", () => {
    const summary = buildQbrExecutiveHealthSummary(sampleReport());
    expect(summary.overallHealth).toContain("72");
    expect(summary.biggestWin).toContain("Cybersecurity");
    expect(summary.largestConcern).toContain("firewall");
    expect(summary.overallRecommendation).toContain("endpoint standardization");
  });
});
