import { describe, expect, it } from "vitest";
import { deriveCustomerNextAction } from "@/lib/customer-portal/next-action";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";

function buildDetail(
  overrides: Partial<TechnologyProfileDetail> & {
    profile?: Partial<TechnologyProfileDetail["profile"]>;
    journey?: Partial<TechnologyProfileDetail["journey"]>;
  } = {},
): TechnologyProfileDetail {
  return {
    profile: {
      id: "profile-1",
      clientId: "client-1",
      overallStackScore: 72,
      maturityTier: null,
      maturityTierLabel: "Managed",
      categoryScores: [],
      pillarSnapshots: null,
      scoringEngineVersion: "v2",
      v1CategoryScores: [],
      riskSummary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        criticalExposure: false,
      },
      trendDirection: null,
      lastAssessedAt: "2026-06-01T00:00:00.000Z",
      nextRecommendedAssessmentAt: null,
      currentAssessmentId: "assessment-1",
      openRecommendationCount: 0,
      criticalExposureCount: 0,
      ...overrides.profile,
    },
    client: {
      id: "client-1",
      companyName: "Acme Foundation",
      primaryContactName: "Jane Doe",
      primaryContactEmail: "jane@example.com",
      industry: null,
      status: "active",
    },
    scoreTrend: [],
    openRecommendations: overrides.openRecommendations ?? [],
    activeProjects: [],
    completedProjects: [],
    journey: {
      phase: "improve",
      phaseLabel: "Improve",
      assessmentsCompleted: 1,
      openRecommendations: 0,
      activeProjects: 0,
      completedProjects: 0,
      scoreDelta: null,
      progressPercent: 50,
      ...overrides.journey,
    },
    audience: "client",
    capabilities: {
      canViewInternalDocuments: false,
      canEditProfile: false,
      canManageProjects: false,
      canViewRecommendationCounts: false,
      showRecommendationCounts: false,
      showJourneyTimeline: false,
      showRecommendationsLink: true,
    },
    businessSnapshot: {
      industry: null,
      employeeCount: null,
      numberOfLocations: null,
      primaryBusinessGoal: null,
      technologyVision: null,
      itSupportModel: null,
      environmentType: null,
      complianceFramework: null,
      complianceDetails: null,
      primaryContactName: "Jane Doe",
      primaryContactTitle: null,
      primaryContactEmail: "jane@example.com",
      primaryContactPhone: null,
    },
    journeyScores: {
      initialScore: 72,
      currentScore: 72,
      projectedScore: 85,
      longTermTargetScore: 85,
      scoreDeltaSincePrevious: null,
      scoreDeltaSinceInitial: 0,
    },
    nextAction: {
      label: "Review open opportunities",
      description: "Prioritize recommendations",
      href: "/clients/client-1/recommendations",
      kind: "recommendations",
    },
    categoryInsights: [],
    pillarInsights: [],
    roadmapPreview: [],
    documents: [],
    activeTip: null,
    scoreDeltaSincePrevious: null,
    sections: {
      showAdminActions: false,
      showAssessmentForms: false,
      showAssessmentResultsLink: false,
      showBusinessProfile: false,
      showDocuments: false,
      showImmediateFocus: true,
      showJourney: false,
      showProjects: false,
      showRecommendationCounts: false,
      showJourneyTimeline: false,
      showRecommendationsLink: true,
    },
    journeyTimeline: [],
    workspace: {
      kpis: {
        stackScore: 72,
        projectedScore: 85,
        openProjectsCount: 0,
        criticalRecommendationsCount: 0,
        immediateFocusCount: 0,
      },
      items: [],
    },
    draftAssessmentId: overrides.draftAssessmentId ?? null,
    ...overrides,
  };
}

describe("deriveCustomerNextAction", () => {
  it("returns resume assessment when a draft exists", () => {
    const action = deriveCustomerNextAction(
      buildDetail({ draftAssessmentId: "draft-1" }),
    );

    expect(action).toEqual({
      label: "Resume Assessment",
      description: "Continue where you left off — your answers are saved automatically.",
      href: "/assessment/start",
    });
  });

  it("returns null when no assessment has started", () => {
    const action = deriveCustomerNextAction(
      buildDetail({
        draftAssessmentId: null,
        journey: { assessmentsCompleted: 0 },
        profile: { currentAssessmentId: null, overallStackScore: null, lastAssessedAt: null },
      }),
    );

    expect(action).toBeNull();
  });

  it("returns report review when assessment is complete", () => {
    const action = deriveCustomerNextAction(buildDetail());

    expect(action?.href).toBe("/assessments/assessment-1/report");
    expect(action?.label).toBe("Review Assessment Report");
  });
});
