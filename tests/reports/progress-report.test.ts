import { describe, expect, it } from "vitest";
import { buildProgressReportData } from "@/lib/reports/progress/report-data";

describe("buildProgressReportData", () => {
  it("builds a progress report from profile and delivery data", () => {
    const lastCompletedAt = new Date("2026-04-01T12:00:00.000Z");
    const report = buildProgressReportData({
      clientId: "client-1",
      clientName: "Acme Corp",
      generatedAt: new Date("2026-06-01T12:00:00.000Z"),
      currentStackScore: 72,
      currentMaturityLabel: "Managed",
      lastAssessment: {
        assessmentName: "Initial Assessment",
        completedAt: lastCompletedAt,
        overallScore: 62,
      },
      scoreHistory: [
        {
          recordedDate: lastCompletedAt,
          overallScore: 62,
          securityScore: 60,
          backupScore: 55,
          infrastructureScore: 58,
          endpointScore: 62,
          documentationScore: 50,
          bcdrScore: 52,
          strategicScore: 54,
        },
        {
          recordedDate: new Date("2026-05-15T12:00:00.000Z"),
          overallScore: 72,
          securityScore: 70,
          backupScore: 60,
          infrastructureScore: 65,
          endpointScore: 68,
          documentationScore: 55,
          bcdrScore: 58,
          strategicScore: 60,
        },
      ],
      completedProjects: [
        {
          id: "project-1",
          title: "Deploy MFA",
          completedAt: new Date("2026-05-01T12:00:00.000Z"),
          estimatedImpactPoints: 8,
          actualImpactPoints: 10,
          recommendation: { title: "Enable MFA" },
        },
      ],
      activeProjectCount: 1,
      openRecommendations: [{ title: "Improve backup testing", businessImpact: "Reduce downtime risk." }],
      openRecommendationsCount: 2,
      journeyPhaseLabel: "Improve",
    });

    expect(report.clientName).toBe("Acme Corp");
    expect(report.scoreChange).toBe(10);
    expect(report.completedProjectsSinceAssessment).toHaveLength(1);
    expect(report.executiveSummary).toContain("Acme Corp");
    expect(report.nextSteps.length).toBeGreaterThan(0);
  });
});
