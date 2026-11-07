import type { AssessmentReportData } from "@/lib/pdf/types";
import type { RecommendationSummary } from "@/lib/assessments/results-summary";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";

export function assessmentDocumentFixture(long = false): AssessmentReportData {
  const categoryScores = TECHNOLOGY_PILLARS.map((p, i) => ({
    categoryId: p.code,
    categoryCode: p.code,
    categoryName: p.name,
    percentScore: [78, 72, 65, 58, 80, 60, 55, 68][i],
    rating: "stable" as const,
  }));
  const recommendations: RecommendationSummary[] = Array.from(
    { length: long ? 12 : 3 },
    (_, i) => ({
      id: `rec-${i}`,
      title: `Action ${i + 1}: Validate and document ${categoryScores[i % 8].categoryName.toLowerCase()}`,
      description: `Finding: Control evidence for action ${i + 1} is incomplete.\nRecommended action: ${long ? Array.from({ length: 9 }, (_, j) => `CHECKPOINT-${i + 1}-${j + 1}: Review the current configuration, record the accountable owner, agree an improvement, test the outcome, and retain evidence for the next review.`).join("\n\n") : "Review the current configuration and record the outcome."}\nExpected outcome: EVIDENCE-${i + 1} is documented and available.\nImplementation considerations: Coordinate a maintenance window with the business owner.`,
      businessImpact: `IMPACT-${i + 1}: Reduce interruption to business operations.`,
      suggestedService: "Technology advisory",
      priority: i === 0 ? "critical" : "high",
      status: "open",
      estimatedImpactPoints: 5,
      categoryId: categoryScores[i % 8].categoryId,
      categoryCode: categoryScores[i % 8].categoryCode,
      categoryName: categoryScores[i % 8].categoryName,
      consolidationGroupId: null,
      hasProject: false,
      projectId: null,
    }),
  );
  return {
    clientName: "Northline Studio",
    assessmentName: "Technology Maturity Assessment",
    assessmentType: "full",
    assessmentDate: "November 5, 2026",
    completedAt: "2026-11-05T12:00:00Z",
    executiveSummary:
      "Northline Studio has established core technology practices. The assessment identifies specific opportunities to improve recovery readiness and document repeatable processes.",
    suppressCatalogProjectedMaturity: true,
    summary: {
      overallScore: 67,
      overallRating: "stable",
      overallRatingLabel: "Stable",
      overallMaturityLabel: "Developing",
      projectionImpact: 12,
      rawImpactSum: 15,
      projectedScore: 79,
      hasCriticalExposure: true,
      criticalFindingsCount: 1,
      openRecommendationsCount: recommendations.length,
      activeImprovementOpportunityCount: recommendations.length,
      recommendationCounts: {
        identified: recommendations.length,
        open: recommendations.length,
        accepted: 0,
        inProgress: 0,
        completed: 0,
        activeOpportunities: recommendations.length,
        deferred: 0,
        declined: 0,
      },
      categoryScores,
      topStrengths: [categoryScores[4]],
      topRisks: [categoryScores[6]],
      immediateActions: recommendations.slice(0, 3),
      recommendations,
    },
  };
}
