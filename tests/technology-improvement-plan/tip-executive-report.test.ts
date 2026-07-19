import { describe, expect, it } from "vitest";
import {
  buildBusinessValueSnapshot,
  buildCategoryFindings,
  buildExecutiveReportFields,
  buildStrategicInitiatives,
  computeOverallBusinessRisk,
  priorityToExecutiveLevel,
  ratingToExecutiveRisk,
} from "@/lib/reports/tip-executive-report";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";
import type { TechnologyRoadmap } from "@/lib/technology-improvement-plan/roadmap-engine";

const sampleRecommendation: TipRecommendationView = {
  id: "rec-1",
  title: "Backup Modernization",
  description: "Technical detail that should not appear in executive output.",
  businessImpact: "Reduces downtime risk and improves recovery confidence.",
  priority: "high",
  suggestedService: "Managed IT Services",
  estimatedImpactPoints: 5,
  categoryName: "Business Continuity",
  consultantNote: "Internal only",
  executiveNote: "Leadership receives clearer recovery readiness reporting.",
  sortOrder: 0,
};

const sampleRoadmap: TechnologyRoadmap = {
  phases: [
    {
      id: "phase-1",
      name: "Foundation Improvements",
      subtitle: "Phase 1",
      timeline: "0–90 days",
      sortOrder: 0,
      executiveSummary: "Establish foundational controls.",
      stackScoreImprovement: 8,
      projectedScore: 63,
      oneTimeInvestment: 7500,
      monthlyRecurringInvestment: 400,
      annualRecurringInvestment: 4800,
      initiatives: [
        {
          recommendationId: "rec-1",
          title: "Backup Modernization",
          priority: "high",
          sortOrder: 0,
          costProfile: {
            recommendationId: "rec-1",
            costType: "mixed",
            oneTimeInvestment: 7500,
            monthlyRecurringInvestment: 400,
            annualRecurringInvestment: 4800,
          },
        },
      ],
      businessOutcomes: [
        {
          title: "Improved recovery readiness",
          description: "Validated backups reduce business disruption risk.",
        },
      ],
      recommendationIds: ["rec-1"],
    },
  ],
  totals: {
    totalOneTimeInvestment: 7500,
    totalMonthlyRecurring: 400,
    totalAnnualRecurring: 4800,
    projectedFinalStackScore: 72,
    legacyCombinedTotal: 7900,
  },
  phaseAssignments: [],
};

describe("tip-executive-report", () => {
  it("maps ratings and priorities to executive levels", () => {
    expect(ratingToExecutiveRisk("critical")).toBe("Critical");
    expect(priorityToExecutiveLevel("high")).toBe("High");
    expect(computeOverallBusinessRisk(55, { critical: 1, high: 0, medium: 0, low: 0 })).toBe(
      "Critical",
    );
  });

  it("builds category findings without technical implementation language", () => {
    const findings = buildCategoryFindings(
      [{ name: "Business Continuity", score: 48, ratingLabel: "At Risk", hasRecommendations: true }],
      null,
      [sampleRecommendation],
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.riskLevel).toBe("Critical");
    expect(findings[0]?.currentState).toContain("Business Continuity");
    expect(findings[0]?.currentState).not.toContain("Implement");
  });

  it("builds strategic initiatives from business impact only", () => {
    const initiatives = buildStrategicInitiatives(sampleRoadmap, [sampleRecommendation]);

    expect(initiatives).toHaveLength(1);
    expect(initiatives[0]?.name).toBe("Backup Modernization");
    expect(initiatives[0]?.businessObjective).toContain("Leadership");
    expect(initiatives[0]?.priority).toBe("High");
    expect(JSON.stringify(initiatives[0])).not.toContain("Technical detail");
  });

  it("builds business value snapshot dimensions", () => {
    const snapshot = buildBusinessValueSnapshot(
      [{ name: "Business Continuity", score: 48, hasRecommendations: true }],
      55,
      72,
    );

    expect(snapshot).toHaveLength(5);
    expect(snapshot.some((row) => row.label === "Business Continuity")).toBe(true);
    expect(snapshot[0]?.projectedPercent).toBeGreaterThan(snapshot[0]?.currentPercent ?? 0);
  });

  it("builds full executive report fields bundle", () => {
    const fields = buildExecutiveReportFields({
      categorySummaries: [
        { name: "Business Continuity", score: 48, ratingLabel: "At Risk", hasRecommendations: true },
      ],
      recommendations: [sampleRecommendation],
      technologyRoadmap: sampleRoadmap,
      currentScore: 55,
      projectedScore: 72,
      assessmentDate: "June 15, 2026",
    });

    expect(fields.topBusinessRisks.length).toBeGreaterThan(0);
    expect(fields.strategicInitiatives.length).toBe(1);
    expect(fields.phaseInvestmentRows[0]?.estimatedInvestment).toContain("$");
  });
});
