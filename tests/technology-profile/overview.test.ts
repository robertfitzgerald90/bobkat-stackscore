import { describe, expect, it } from "vitest";
import type { ScoreTrendPoint } from "@/lib/analytics/types";
import {
  buildBusinessSnapshot,
  buildCategoryInsights,
  buildProfileDocuments,
  buildRoadmapPreview,
  computeJourneyScores,
  computeScoreDeltaSincePrevious,
  countRecommendationsByV2Category,
  deriveNextRecommendedAction,
  formatComplianceStatus,
  projectScoreFromRecommendations,
  resolveProfileCapabilities,
} from "@/lib/technology-profile/overview";

describe("technology profile overview", () => {
  it("resolves capabilities by role", () => {
    expect(resolveProfileCapabilities("client").canViewPricing).toBe(false);
    expect(resolveProfileCapabilities("technician").canViewPricing).toBe(false);
    expect(resolveProfileCapabilities("admin").canViewPricing).toBe(true);
  });

  it("formats compliance status for CMMC", () => {
    expect(
      formatComplianceStatus("cmmc", { targetCompliance: "Level 2" }),
    ).toBe("Target: Level 2");
  });

  it("builds business snapshot labels", () => {
    const snapshot = buildBusinessSnapshot({
      industry: "Manufacturing",
      employeeCount: 42,
      numberOfLocations: 2,
      primaryBusinessGoal: "support_growth",
      technologyVision: "Modernize operations",
      itSupportModel: "internal",
      environmentType: "hybrid",
      complianceFramework: "none",
      complianceDetails: null,
      primaryContactName: "Alex",
      primaryContactTitle: "Owner",
      primaryContactEmail: "alex@example.com",
      primaryContactPhone: null,
    });

    expect(snapshot.primaryBusinessGoalLabel).toBe("Support Growth");
    expect(snapshot.complianceStatus).toBeNull();
  });

  it("computes score delta since previous assessment", () => {
    const trend: ScoreTrendPoint[] = [
      {
        date: "2025-01-01",
        dateLabel: "Jan 1, 2025",
        overallScore: 50,
        assessmentId: "a1",
        assessmentName: "Initial",
        categories: {},
      },
      {
        date: "2025-06-01",
        dateLabel: "Jun 1, 2025",
        overallScore: 58,
        assessmentId: "a2",
        assessmentName: "Follow-up",
        categories: {},
      },
    ];

    expect(computeScoreDeltaSincePrevious(trend)).toBe(8);
    expect(
      computeJourneyScores({
        scoreTrend: trend,
        currentScore: 58,
        projectedScore: 72,
        longTermTargetScore: 80,
      }),
    ).toMatchObject({
      initialScore: 50,
      currentScore: 58,
      projectedScore: 72,
      scoreDeltaSinceInitial: 8,
      scoreDeltaSincePrevious: 8,
    });
  });

  it("counts recommendations by v2 category", () => {
    const counts = countRecommendationsByV2Category([
      { categoryCode: "security" },
      { categoryCode: "backup" },
      { categoryCode: "endpoint" },
    ]);

    expect(counts.security).toBe(1);
    expect(counts.business_continuity).toBe(1);
    expect(counts.operations).toBe(1);
    expect(counts.productivity).toBe(0);
  });

  it("builds category insights for all display categories", () => {
    const insights = buildCategoryInsights({
      categoryScores: [
        {
          categoryCode: "security",
          categoryName: "Security",
          percentScore: 70,
          maturityTier: "Mature",
          pointsEarned: 70,
          pointsPossible: 100,
        },
      ],
      scoreHistory: [
        {
          securityScore: 60,
          backupScore: 50,
          infrastructureScore: 55,
          endpointScore: 45,
          documentationScore: 40,
          bcdrScore: 50,
          strategicScore: 35,
        },
        {
          securityScore: 70,
          backupScore: 55,
          infrastructureScore: 60,
          endpointScore: 50,
          documentationScore: 45,
          bcdrScore: 55,
          strategicScore: 40,
        },
      ],
      openRecommendations: [{ categoryCode: "security" }],
    });

    expect(insights).toHaveLength(7);
    expect(insights.find((insight) => insight.categoryCode === "security")).toMatchObject({
      percentScore: 70,
      trendDelta: 10,
      openRecommendationCount: 1,
    });
    expect(insights.find((insight) => insight.categoryCode === "productivity")).toMatchObject({
      percentScore: null,
      openRecommendationCount: 0,
    });
  });

  it("projects score from open recommendations", () => {
    const projected = projectScoreFromRecommendations(60, [
      {
        id: "r1",
        title: "Enable MFA",
        businessImpact: "Reduce account takeover risk",
        priority: "high",
        status: "open",
        estimatedImpactPoints: 8,
        categoryName: "Security",
        categoryCode: "security",
        assessmentId: "a1",
      },
    ]);

    expect(projected).toBeGreaterThan(60);
  });

  it("derives next action for draft assessment", () => {
    const action = deriveNextRecommendedAction({
      clientId: "client-1",
      assessmentsCompleted: 1,
      draftAssessmentId: "draft-1",
      openRecommendations: 2,
      activeProjects: 0,
      activeTipId: null,
      activeTipStep: null,
      nextRecommendedAssessmentAt: null,
      journeyPhase: "improve",
    });

    expect(action.kind).toBe("assessment");
    expect(action.href).toBe("/assessments/draft-1");
  });

  it("builds profile documents with assessment export link", () => {
    const documents = buildProfileDocuments({
      clientId: "client-1",
      currentAssessmentId: "assessment-1",
      lastAssessedAt: "2025-06-01T00:00:00.000Z",
      documents: [],
    });

    expect(documents).toHaveLength(1);
    expect(documents[0]?.downloadHref).toBe("/assessments/assessment-1/report");
    expect(documents[0]?.createdAt).toBe("2025-06-01T00:00:00.000Z");
  });

  it("builds roadmap preview from TIP phases", () => {
    const preview = buildRoadmapPreview([
      {
        id: "phase-1",
        label: "Phase 1",
        projectedScore: 72,
        recommendations: [{ id: "r1" }, { id: "r2" }],
      },
    ]);

    expect(preview).toEqual([
      {
        id: "phase-1",
        label: "Phase 1",
        projectedScore: 72,
        recommendationCount: 2,
      },
    ]);
  });
});
