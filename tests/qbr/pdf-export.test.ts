import { describe, expect, it } from "vitest";
import { generateQbrReportPdf } from "@/lib/pdf/generate";
import type { QbrReportData } from "@/lib/qbr/types";

function baseReport(overrides: Partial<QbrReportData> = {}): QbrReportData {
  return {
    id: "qbr-demo",
    clientId: "client-demo",
    clientName: "Acme Inc.",
    title: "Acme Inc. Business Review",
    reviewPeriodLabel: "Apr 1, 2026 to Jun 30, 2026",
    reviewPeriodStart: "2026-04-01T00:00:00.000Z",
    reviewPeriodEnd: "2026-06-30T23:59:59.000Z",
    generatedAt: "2026-07-01T12:00:00.000Z",
    generatedDateLabel: "July 1, 2026",
    executiveSummary: "Acme strengthened cybersecurity and closed critical recommendations this period.",
    currentStackScore: 72,
    currentMaturityLabel: "Stable",
    scoreAtPeriodStart: 64,
    scoreAtPeriodEnd: 72,
    scoreChange: 8,
    assessmentsCompletedInPeriod: 1,
    projectsCompletedInPeriod: 2,
    recommendationsResolvedInPeriod: 3,
    journeyEvents: [],
    completedProjects: [
      {
        id: "p1",
        title: "MFA rollout",
        completedAt: "2026-05-10T00:00:00.000Z",
        impactPoints: 4,
        description: "Enforced MFA for all privileged accounts.",
      },
    ],
    categoryImprovements: [
      {
        categoryName: "Cybersecurity",
        previousScore: 55,
        currentScore: 78,
        change: 23,
      },
    ],
    resolvedRecommendations: [
      {
        id: "r1",
        title: "Enable MFA",
        priority: "critical",
        status: "completed",
        categoryName: "Cybersecurity",
        resolvedAt: "2026-05-10T00:00:00.000Z",
        businessImpact: "Reduced account takeover risk.",
      },
    ],
    remainingOpportunities: [
      {
        id: "r2",
        title: "Modernize backup strategy",
        priority: "high",
        status: "open",
        categoryName: "Business Continuity",
        resolvedAt: null,
        businessImpact: "Improve restore confidence.",
      },
    ],
    roadmapPhases: [
      {
        phaseName: "Stabilize",
        timeframe: "Q2 2026",
        initiativeCount: 3,
        summary: "Close critical cybersecurity gaps.",
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
    technologyRisks: ["Unsupported edge firewall increases perimeter risk."],
    strategicRecommendations: ["Complete endpoint standardization before next review."],
    businessGoalLabel: "Improve operational resilience",
    businessGoalProgress: "On track after MFA and backup validation.",
    technologyVision: "A managed, measurable technology foundation.",
    visionProgress: "Identity controls improved; endpoint standardization remains.",
    nextQuarterPriorities: ["Deploy managed EDR", "Validate backup restores"],
    ...overrides,
  };
}

describe("generateQbrReportPdf", () => {
  it("renders a non-empty PDF buffer for a standard Business Review", async () => {
    const buffer = await generateQbrReportPdf(baseReport());
    expect(Buffer.isBuffer(buffer) || buffer instanceof Uint8Array).toBe(true);
    expect(buffer.byteLength).toBeGreaterThan(1000);
    const header = Buffer.from(buffer.slice(0, 5)).toString("utf8");
    expect(header).toBe("%PDF-");
  }, 30000);

  it("renders safely when optional sections are empty", async () => {
    const buffer = await generateQbrReportPdf(
      baseReport({
        scoreAtPeriodStart: null,
        scoreChange: null,
        categoryImprovements: [],
        completedProjects: [],
        resolvedRecommendations: [],
        remainingOpportunities: [],
        roadmapPhases: [],
        budgetForecast: null,
        technologyRisks: [],
        strategicRecommendations: [],
        nextQuarterPriorities: [],
        executiveSummary: "",
      }),
    );
    expect(buffer.byteLength).toBeGreaterThan(500);
    expect(Buffer.from(buffer.slice(0, 5)).toString("utf8")).toBe("%PDF-");
  }, 30000);
});
