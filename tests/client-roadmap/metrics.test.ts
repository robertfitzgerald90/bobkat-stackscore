import { describe, expect, it } from "vitest";
import { computeRoadmapProgressMetrics } from "@/lib/client-roadmap/metrics";

describe("roadmap progress metrics", () => {
  it("computes completion and remaining investment for incomplete phases", () => {
    const metrics = computeRoadmapProgressMetrics(
      [
        {
          status: "completed",
          oneTimeInvestment: 5000,
          monthlyRecurringInvestment: 200,
          name: "Critical Stabilization",
          sortOrder: 0,
        },
        {
          status: "awaiting_approval",
          oneTimeInvestment: 3000,
          monthlyRecurringInvestment: 150,
          name: "High Priority Improvements",
          sortOrder: 1,
        },
      ],
      [
        {
          id: "a",
          title: "MFA",
          description: "",
          businessImpact: "",
          suggestedService: null,
          priority: "critical",
          estimatedImpactPoints: 10,
          categoryName: "Security",
          status: "completed",
        },
        {
          id: "b",
          title: "Backup",
          description: "",
          businessImpact: "",
          suggestedService: null,
          priority: "high",
          estimatedImpactPoints: 8,
          categoryName: "Business Continuity",
          status: "open",
        },
      ],
    );

    expect(metrics.completionPercent).toBe(50);
    expect(metrics.initiativesCompleted).toBe(1);
    expect(metrics.initiativesRemaining).toBe(1);
    expect(metrics.currentPhaseName).toBe("High Priority Improvements");
    expect(metrics.remainingOneTimeInvestment).toBe(3000);
    expect(metrics.remainingMonthlyRecurring).toBe(150);
    expect(metrics.currentMonthlyServices).toBe(200);
    expect(metrics.projectedMonthlyServicesAfterCompletion).toBe(350);
    expect(metrics.currentPhaseImplementationStatusLabel).toBe("Awaiting Approval");
    expect(metrics.domainImprovements.securityImprovement).toBe(10);
    expect(metrics.domainImprovements.businessContinuityImprovement).toBe(0);
  });
});
