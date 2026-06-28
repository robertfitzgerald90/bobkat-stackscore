import { describe, expect, it } from "vitest";
import { buildCompletionReportData } from "@/lib/reports/completion/report-data";

describe("buildCompletionReportData", () => {
  it("builds a completion report for a delivered project", () => {
    const createdAt = new Date("2026-03-01T12:00:00.000Z");
    const completedAt = new Date("2026-05-20T12:00:00.000Z");

    const report = buildCompletionReportData({
      clientId: "client-1",
      clientName: "Acme Corp",
      project: {
        id: "project-1",
        title: "Deploy MFA",
        completedAt,
        estimatedImpactPoints: 8,
        actualImpactPoints: 10,
        priority: "high",
        createdAt,
        category: { name: "Security" },
        recommendation: {
          title: "Enable MFA",
          businessImpact: "Reduce account takeover risk across the organization.",
        },
      },
      currentStackScore: 72,
      scoreHistory: [
        {
          recordedDate: createdAt,
          overallScore: 62,
          securityScore: 55,
          backupScore: 60,
          infrastructureScore: 58,
          endpointScore: 62,
          documentationScore: 50,
          bcdrScore: 52,
          strategicScore: 54,
        },
        {
          recordedDate: completedAt,
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
      openRecommendations: [{ title: "Improve backup testing" }],
      journeyPhaseLabel: "Improve",
    });

    expect(report.projectTitle).toBe("Deploy MFA");
    expect(report.scoreChange).toBe(10);
    expect(report.businessImpactBullets.length).toBeGreaterThan(0);
    expect(report.executiveSummary).toContain("Deploy MFA");
    expect(report.warrantyNotes.length).toBeGreaterThan(0);
  });
});
