import { describe, expect, it } from "vitest";
import { buildQbrExecutiveSummary } from "@/lib/qbr/executive-summary";
import { buildQbrReportData } from "@/lib/qbr/report-data";
import type { JourneyTimelineEvent } from "@/lib/technology-profile/timeline";

const periodStart = new Date("2026-04-01T00:00:00.000Z");
const periodEnd = new Date("2026-06-30T23:59:59.999Z");

const journeyEvent: JourneyTimelineEvent = {
  id: "event-1",
  occurredAt: "2026-05-15T12:00:00.000Z",
  dateLabel: "May 15, 2026",
  eventType: "project_completed",
  filterCategory: "projects",
  title: "MFA Rollout completed",
  description: "Multi-factor authentication deployed across the organization.",
  href: "/clients/client-1/projects/p1",
  score: 8,
  profileImpact: null,
};

describe("buildQbrReportData", () => {
  it("aggregates quarter progress and excludes out-of-period work", () => {
    const report = buildQbrReportData({
      qbr: {
        id: "qbr-1",
        clientId: "client-1",
        title: "Q2 2026 Quarterly Business Review — Acme Corp",
        reviewPeriodStart: periodStart,
        reviewPeriodEnd: periodEnd,
        generatedAt: new Date("2026-06-28T12:00:00.000Z"),
        executiveSummary: null,
      },
      clientName: "Acme Corp",
      currentStackScore: 72,
      currentMaturityLabel: "Managed",
      scoreHistory: [
        {
          recordedDate: new Date("2026-03-01T12:00:00.000Z"),
          overallScore: 65,
          infrastructureScore: 60,
          securityScore: 62,
          backupScore: 68,
          endpointScore: 66,
          documentationScore: 70,
          bcdrScore: 64,
          strategicScore: 66,
        },
        {
          recordedDate: new Date("2026-05-01T12:00:00.000Z"),
          overallScore: 70,
          infrastructureScore: 66,
          securityScore: 70,
          backupScore: 69,
          endpointScore: 67,
          documentationScore: 71,
          bcdrScore: 68,
          strategicScore: 72,
        },
      ],
      journeyEvents: [journeyEvent],
      completedProjects: [
        {
          id: "p1",
          title: "MFA Rollout",
          description: "Deployed MFA",
          completedAt: new Date("2026-05-15T12:00:00.000Z"),
          actualImpactPoints: 8,
          estimatedImpactPoints: 8,
        },
        {
          id: "p-old",
          title: "Old Project",
          description: null,
          completedAt: new Date("2026-01-10T12:00:00.000Z"),
          actualImpactPoints: 5,
          estimatedImpactPoints: 5,
        },
      ],
      resolvedRecommendations: [
        {
          id: "r1",
          title: "Enable MFA",
          priority: "high",
          status: "completed",
          categoryName: "Security",
          businessImpact: "Reduce account takeover risk.",
          completedAt: new Date("2026-05-15T12:00:00.000Z"),
          updatedAt: new Date("2026-05-15T12:00:00.000Z"),
        },
      ],
      openRecommendations: [
        {
          id: "r2",
          title: "Backup validation",
          priority: "medium",
          status: "open",
          categoryName: "Business Continuity",
          businessImpact: "Verify recoverability.",
        },
      ],
      assessmentsCompletedInPeriod: 1,
      roadmapPhases: [
        {
          id: "phase-1",
          label: "Foundation",
          sortOrder: 0,
          recommendationIds: ["r2"],
          recommendations: [
            {
              id: "r2",
              title: "Backup validation",
              description: "",
              businessImpact: "Verify recoverability.",
              priority: "medium",
              suggestedService: null,
              estimatedImpactPoints: 6,
              categoryName: "Business Continuity",
              consultantNote: "",
              executiveNote: "",
              sortOrder: 0,
            },
          ],
          projectedScore: 78,
          scoreDelta: 6,
        },
      ],
      businessGoalLabel: "Improve Cybersecurity",
      technologyVision: "Secure, modern, and reliable technology.",
    });

    expect(report.scoreAtPeriodStart).toBe(65);
    expect(report.scoreAtPeriodEnd).toBe(72);
    expect(report.scoreChange).toBe(7);
    expect(report.completedProjects).toHaveLength(1);
    expect(report.resolvedRecommendations).toHaveLength(1);
    expect(report.journeyEvents).toHaveLength(1);
    expect(report.nextQuarterPriorities[0]).toBe("Backup validation");
    expect(report.executiveSummary).toContain("Acme Corp");
    expect(report.executiveSummary).toContain("BobKat IT");
    expect(report.executiveSummary).not.toMatch(/margin|pricing/i);
  });
});

describe("buildQbrExecutiveSummary", () => {
  it("uses business language and highlights delivery", () => {
    const summary = buildQbrExecutiveSummary({
      clientName: "Acme Corp",
      reviewPeriodLabel: "Q2 2026",
      scoreAtPeriodStart: 65,
      scoreAtPeriodEnd: 72,
      scoreChange: 7,
      projectsCompletedInPeriod: 1,
      recommendationsResolvedInPeriod: 1,
      assessmentsCompletedInPeriod: 1,
      completedProjects: [],
      resolvedRecommendations: [],
      remainingOpportunities: [{ id: "r2" } as never],
      categoryImprovements: [
        {
          categoryName: "Security",
          previousScore: 62,
          currentScore: 70,
          change: 8,
        },
      ],
      businessGoalLabel: "Improve Cybersecurity",
      nextQuarterPriorities: ["Backup validation"],
    });

    expect(summary).toContain("Technology Profile improved by 7 points");
    expect(summary).toContain("BobKat IT delivered measurable progress");
    expect(summary).toContain("improve cybersecurity");
    expect(summary).toContain("Next priority: Backup validation");
  });
});
