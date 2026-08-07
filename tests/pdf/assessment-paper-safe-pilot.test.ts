import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { generateAssessmentReportPdf } from "@/lib/pdf/generate";
import type { AssessmentReportData } from "@/lib/pdf/types";

describe("assessment paper-safe pilot PDF", () => {
  it("renders with embedded fonts and paper palette", async () => {
    const sample: AssessmentReportData = {
      clientName: "Pinnacle Engineering",
      assessmentName: "Spring Technology Maturity Assessment",
      assessmentType: "full",
      assessmentDate: "July 15, 2026",
      completedAt: "2026-07-15T12:00:00.000Z",
      executiveSummary:
        "Pinnacle Engineering shows solid foundations with clear opportunities in identity hardening and backup readiness.",
      summary: {
        overallScore: 68,
        overallRating: "stable",
        overallRatingLabel: "Stable",
        projectedScore: 86,
        hasCriticalExposure: true,
        criticalFindingsCount: 2,
        openRecommendationsCount: 2,
        categoryScores: [
          {
            categoryId: "c1",
            categoryCode: "IAM",
            categoryName: "Identity & Access",
            percentScore: 61,
            rating: "stable",
          },
          {
            categoryId: "c2",
            categoryCode: "BKP",
            categoryName: "Backup & Recovery",
            percentScore: 48,
            rating: "at_risk",
          },
        ],
        topStrengths: [
          {
            categoryId: "c3",
            categoryCode: "EPM",
            categoryName: "Endpoint Management",
            percentScore: 82,
            rating: "strong",
          },
        ],
        topRisks: [
          {
            categoryId: "c2",
            categoryCode: "BKP",
            categoryName: "Backup & Recovery",
            percentScore: 48,
            rating: "at_risk",
          },
        ],
        immediateActions: [],
        recommendations: [
          {
            id: "r1",
            title: "Centralize endpoint management",
            description: "Roll out centralized endpoint management.",
            businessImpact: "Reduces unpatched device exposure.",
            suggestedService: "Managed IT",
            priority: "critical",
            status: "open",
            estimatedImpactPoints: 8,
            categoryId: "c3",
            categoryCode: "EPM",
            categoryName: "Endpoint Management",
            consolidationGroupId: null,
            hasProject: false,
            projectId: null,
          },
        ],
      },
    };

    const buffer = await generateAssessmentReportPdf(sample);
    expect(buffer.byteLength).toBeGreaterThan(5_000);
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    writeFileSync("tmp-assessment-paper-safe.pdf", buffer);
  }, 60_000);
});
