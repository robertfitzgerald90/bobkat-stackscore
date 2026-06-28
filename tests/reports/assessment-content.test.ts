import { describe, expect, it } from "vitest";
import { buildAssessmentReportData } from "@/lib/assessments/report-data";
import { buildAssessmentResultsSummary } from "@/lib/assessments/results-summary";
import { buildAssessmentReportSections } from "@/lib/reports/assessment-content";

const baseSummary = buildAssessmentResultsSummary(
  62,
  false,
  0,
  [
    {
      categoryId: "cat-1",
      percentScore: 70,
      rating: "stable",
      category: { name: "Security" },
    },
  ],
  [
    {
      id: "rec-1",
      title: "Enable MFA",
      description: "Deploy MFA",
      businessImpact: "Reduce account takeover risk.",
      suggestedService: null,
      priority: "high",
      status: "open",
      estimatedImpactPoints: 8,
      consolidationGroupId: null,
      categoryId: "cat-1",
      category: { name: "Security" },
      project: null,
    },
  ],
);

describe("buildAssessmentReportData", () => {
  it("builds a report contract shared by browser preview and PDF export", () => {
    const report = buildAssessmentReportData({
      clientName: "Acme Corp",
      assessmentName: "Initial Assessment",
      assessmentType: "initial",
      assessmentDate: new Date("2026-03-15T12:00:00.000Z"),
      completedAt: "2026-03-15T12:00:00.000Z",
      executiveSummary: "Strong foundation with room to improve identity controls.",
      summary: baseSummary,
    });

    expect(report.clientName).toBe("Acme Corp");
    expect(report.assessmentDate).toContain("2026");
    expect(report.summary.overallScore).toBe(62);
  });
});

describe("buildAssessmentReportSections", () => {
  it("derives executive bullets and roadmap milestones for browser preview", () => {
    const report = buildAssessmentReportData({
      clientName: "Acme Corp",
      assessmentName: "Initial Assessment",
      assessmentType: "initial",
      assessmentDate: new Date("2026-03-15T12:00:00.000Z"),
      completedAt: "2026-03-15T12:00:00.000Z",
      executiveSummary: null,
      summary: baseSummary,
    });

    const sections = buildAssessmentReportSections(report);

    expect(sections.sortedRecommendations).toHaveLength(1);
    expect(sections.roadmapMilestones.length).toBeGreaterThanOrEqual(4);
    expect(sections.overallRiskBullets[0]).toContain("62");
    expect(sections.priorityBullets[0]).toContain("Enable MFA");
  });
});
