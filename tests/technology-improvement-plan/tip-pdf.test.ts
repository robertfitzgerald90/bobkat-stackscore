import { describe, expect, it } from "vitest";
import { generateTipReportPdf } from "@/lib/pdf/generate";
import { buildExecutiveReportFields } from "@/lib/reports/tip-executive-report";
import { finalizeTipReportData } from "@/lib/technology-improvement-plan/report-validation";
import type { TipReportData } from "@/lib/pdf/types";
import { createTestInvestmentSummary } from "./tip-test-helpers";

const minimalTipReport: TipReportData = {
  clientName: "Fixture Client",
  title: "Technology Improvement Plan",
  version: 1,
  generatedDate: "July 19, 2026",
  assessmentName: "Assessment Q2 2026",
  executiveSummary: "Executive summary for fixture PDF generation.",
  currentScore: 55,
  projectedScore: 72,
  scoreImprovement: 17,
  maturityTier: null,
  maturityTierLabel: "Developing",
  recommendations: [
    {
      id: "rec-1",
      title: "Backup Modernization",
      description: "Improve backup coverage and recovery testing.",
      businessImpact: "Reduces downtime risk and improves recovery confidence.",
      priority: "high",
      suggestedService: "Managed IT Services",
      estimatedImpactPoints: 5,
      categoryName: "Business Continuity",
      consultantNote: "",
      executiveNote: "Leadership receives clearer recovery readiness reporting.",
      sortOrder: 0,
    },
  ],
  roadmapPhases: [],
  technologyRoadmap: {
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
            description: "Validated backups and tested recovery workflows reduce business disruption risk.",
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
  },
  clientInvestmentTotal: 7500,
  oneTimeInvestmentTotal: 7500,
  monthlyRecurringTotal: 400,
  annualRecurringTotal: 4800,
  investmentLineItems: [],
  categorySummaries: [
    {
      name: "Business Continuity",
      score: 48,
      ratingLabel: "At Risk",
      hasRecommendations: true,
    },
  ],
  businessOutcomes: [],
  journeyPhaseLabel: "Improve",
  journeyProgressPercent: 35,
  includeInternalDetails: false,
};

const executiveFields = buildExecutiveReportFields({
  categorySummaries: minimalTipReport.categorySummaries,
  recommendations: minimalTipReport.recommendations,
  technologyRoadmap: minimalTipReport.technologyRoadmap,
  currentScore: minimalTipReport.currentScore,
  projectedScore: minimalTipReport.projectedScore,
  assessmentDate: "June 15, 2026",
});

const fullTipReport: TipReportData = finalizeTipReportData({
  ...minimalTipReport,
  ...executiveFields,
  investmentSummary: createTestInvestmentSummary(
    minimalTipReport.technologyRoadmap,
    minimalTipReport.recommendations,
  ),
});

describe("generateTipReportPdf", () => {
  it("renders a non-empty executive PDF buffer", async () => {
    const buffer = await generateTipReportPdf(fullTipReport);
    expect(buffer.byteLength).toBeGreaterThan(5000);
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
  });
});
