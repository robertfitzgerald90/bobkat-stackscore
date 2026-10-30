import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCustomerOverviewFromDetail,
  CUSTOMER_OVERVIEW_PRIORITY_LIMIT,
} from "@/lib/customer-portal/overview-dto";
import { MEANINGFUL_STRENGTH_MIN_PERCENT } from "@/lib/assessments/customer-trust";
import { clientExplorePillarPath } from "@/lib/clients/paths";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";
import type { Priority, RecommendationStatus } from "@/generated/prisma/client";

function recommendation(input: {
  id: string;
  title: string;
  priority: Priority;
  status?: RecommendationStatus;
  impact?: number;
}) {
  return {
    id: input.id,
    title: input.title,
    description: "desc",
    priority: input.priority,
    status: input.status ?? ("open" as RecommendationStatus),
    estimatedImpactPoints: input.impact ?? 5,
    businessImpact: "impact",
    suggestedService: null,
    categoryName: "Identity & Access",
    categoryCode: "identity_access",
    categoryId: "cat-1",
    assessmentId: "assessment-1",
    latestAssessmentId: "assessment-1",
    latestAssessmentName: null,
    latestTriggerReason: null,
    triggeredInLatestAssessment: true,
    isRecurrence: false,
    recurrenceCount: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    lastTriggeredAt: "2026-01-01T00:00:00.000Z",
    templateCode: "REC-1",
    project: null,
  };
}

function minimalDetail(
  overrides: Partial<TechnologyProfileDetail> = {},
): TechnologyProfileDetail {
  const base = {
    profile: {
      id: "profile-1",
      clientId: "client-abc",
      overallStackScore: 39,
      maturityTier: null,
      maturityTierLabel: null,
      categoryScores: [],
      pillarSnapshots: null,
      scoringEngineVersion: "v2" as const,
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
      openRecommendationCount: 2,
      criticalExposureCount: 0,
    },
    client: {
      id: "client-abc",
      companyName: "ABC LLC",
      primaryContactName: "Alex Contact",
      primaryContactEmail: "alex@example.com",
      industry: null,
      status: "active",
    },
    scoreTrend: [],
    openRecommendations: [
      recommendation({ id: "r1", title: "Critical Control Gap", priority: "critical", impact: 10 }),
      recommendation({ id: "r2", title: "High Priority Fix", priority: "high", impact: 8 }),
      recommendation({ id: "r3", title: "Medium Item", priority: "medium", impact: 3 }),
    ],
    activeProjects: [],
    completedProjects: [],
    journey: {
      phase: "improve" as const,
      phaseLabel: "Improve",
      assessmentsCompleted: 1,
      openRecommendations: 3,
      activeProjects: 0,
      completedProjects: 0,
      scoreDelta: null,
      progressPercent: 33,
    },
    audience: "client" as const,
    capabilities: {
      canEditBusinessProfile: false,
      canEditImprovementPlan: false,
      canViewPricing: false,
      canViewInternalDocuments: false,
    },
    businessSnapshot: {
      industry: null,
      employeeCount: null,
      numberOfLocations: null,
      primaryBusinessGoal: null,
      primaryBusinessGoalLabel: "",
      technologyVision: null,
      itSupportModel: null,
      itSupportModelLabel: "",
      environmentType: null,
      environmentTypeLabel: "",
      complianceFramework: null,
      complianceFrameworkLabel: "",
      complianceStatus: null,
      primaryContactName: "Alex Contact",
      primaryContactTitle: null,
      primaryContactEmail: "alex@example.com",
      primaryContactPhone: null,
    },
    journeyScores: {
      initialScore: 39,
      currentScore: 39,
      projectedScore: null,
      longTermTargetScore: null,
      scoreDeltaSincePrevious: null,
      scoreDeltaSinceInitial: 0,
    },
    nextAction: {
      label: "Review",
      description: "desc",
      href: "/clients/client-abc/recommendations",
      kind: "recommendations" as const,
    },
    categoryInsights: [],
    pillarInsights: TECHNOLOGY_PILLARS.map((pillar, index) => ({
      pillarCode: pillar.code,
      pillarName: pillar.name,
      businessQuestion: pillar.businessQuestion,
      percentScore: [62, 48, 35, 71, 28, 40, 22, 33][index] ?? 30,
      maturityTier: null,
      trendDelta: null,
      openRecommendationCount: 0,
      status: "complete" as const,
      questionsAnswered: 10,
      questionsTotal: 10,
    })),
    roadmapPreview: [],
    documents: [],
    activeTip: null,
    scoreDeltaSincePrevious: null,
    sections: {
      showAssessmentForms: false,
      showAdminActions: false,
      showBusinessSnapshot: false,
      showBusinessSnapshotLimited: false,
      showOpenOpportunities: true,
      showRoadmapPreview: true,
      showRecentProgress: false,
      showActiveProjects: false,
      showAssessmentResultsLink: true,
      showRoadmapBuilderLink: false,
      showNextActionCta: true,
      showRecommendationCounts: true,
      showJourneyTimeline: false,
      showRecommendationsLink: true,
    },
    journeyTimeline: [],
    workspace: {
      kpis: {
        stackScore: 39,
        projectedScore: null,
        openProjectsCount: 0,
        criticalRecommendationsCount: 0,
        immediateFocusCount: 0,
      },
      items: [],
    },
    draftAssessmentId: null,
  };

  return { ...base, ...overrides } as TechnologyProfileDetail;
}

describe("SS-UX-004 premium executive overview", () => {
  it("builds eight canonical pillars with Explore deep links", () => {
    const overview = buildCustomerOverviewFromDetail({
      detail: minimalDetail(),
      companyName: "ABC LLC",
    });

    expect(overview.pillars).toHaveLength(8);
    expect(overview.pillars.map((p) => p.code)).toEqual(TECHNOLOGY_PILLARS.map((p) => p.code));
    expect(overview.stackScore).toBe(39);
    expect(overview.maturityLabel).toBe("Initial");
    expect(overview.maturityExplanation).toContain("Initial");
    for (const pillar of overview.pillars) {
      expect(pillar.href).toBe(clientExplorePillarPath("client-abc", pillar.code));
      expect(pillar.maturityLabel).toBeTruthy();
    }
  });

  it("limits priorities and preserves critical/high ordering", () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      recommendation({
        id: `r-${i}`,
        title: `Rec ${i}`,
        priority: i === 0 ? "critical" : i < 4 ? "high" : "low",
        impact: 20 - i,
      }),
    );
    const overview = buildCustomerOverviewFromDetail({
      detail: minimalDetail({ openRecommendations: many }),
      companyName: "ABC LLC",
    });

    expect(overview.priorities.length).toBeLessThanOrEqual(CUSTOMER_OVERVIEW_PRIORITY_LIMIT);
    expect(overview.priorities[0]?.priority).toBe("critical");
    expect(overview.priorities.some((p) => p.priority === "high")).toBe(true);
  });

  it("uses demonstrated strengths only at Developing threshold or higher", () => {
    const overview = buildCustomerOverviewFromDetail({
      detail: minimalDetail(),
      companyName: "ABC LLC",
    });

    expect(MEANINGFUL_STRENGTH_MIN_PERCENT).toBe(55);
    expect(overview.demonstratedStrengths.every((s) => s.score >= 55)).toBe(true);
    expect(overview.demonstratedStrengths.map((s) => s.name)).toEqual([
      "Data Protection & Recovery",
      "Identity & Access",
    ]);
    expect(overview.comparativeStrengths).toEqual([]);
  });

  it("labels comparative relative areas when no demonstrated strengths exist", () => {
    const weakPillars = TECHNOLOGY_PILLARS.map((pillar, index) => ({
      pillarCode: pillar.code,
      pillarName: pillar.name,
      businessQuestion: pillar.businessQuestion,
      percentScore: 10 + index,
      maturityTier: null,
      trendDelta: null,
      openRecommendationCount: 0,
      status: "complete" as const,
      questionsAnswered: 10,
      questionsTotal: 10,
    }));
    const overview = buildCustomerOverviewFromDetail({
      detail: minimalDetail({ pillarInsights: weakPillars }),
      companyName: "ABC LLC",
    });

    expect(overview.demonstratedStrengths).toEqual([]);
    expect(overview.comparativeStrengths.length).toBeGreaterThan(0);
    expect(overview.comparativeStrengths.every((s) => s.kind === "comparative")).toBe(true);
    expect(overview.comparativeStrengths.every((s) => s.score < 55)).toBe(true);
  });

  it("distinguishes roadmap progress and never invents projected maturity", () => {
    const overview = buildCustomerOverviewFromDetail({
      detail: minimalDetail(),
      companyName: "ABC LLC",
      hasRoadmap: true,
      roadmapProgressPercent: 40,
      vcioAccessState: "FULL_ACCESS",
    });

    expect(overview.roadmap.progressPercent).toBe(40);
    expect(overview.roadmap.footnote).toMatch(/reassessment/i);
    expect(overview.roadmap.stackScoreLabel).toBe("StackScore");
    expect(overview.vcio.show).toBe(true);
    expect(JSON.stringify(overview)).not.toContain("projectedStackScore");
  });

  it("hides vCIO strip for assessment-only customers", () => {
    const overview = buildCustomerOverviewFromDetail({
      detail: minimalDetail(),
      companyName: "ABC LLC",
      vcioAccessState: "NO_ACCESS",
    });
    expect(overview.vcio.show).toBe(false);
  });

  it("wires page to getCustomerOverview and Explore pillar query", () => {
    const page = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/clients/[id]/technology-profile/page.tsx"),
      "utf8",
    );
    const explore = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/clients/[id]/explore/page.tsx"),
      "utf8",
    );
    const dashboard = readFileSync(
      join(process.cwd(), "src/components/customer-portal/customer-executive-dashboard.tsx"),
      "utf8",
    );

    expect(page).toContain("getCustomerOverview");
    expect(page).not.toContain("CustomerExecutiveDashboard detail=");
    expect(explore).toContain("searchParams");
    expect(explore).toContain("query.pillar");
    expect(explore).toContain("getCustomerExplore");
    expect(dashboard).toContain("OverviewPillarGrid");
    expect(dashboard).not.toContain("northstarDemoDashboard");
    expect(dashboard).not.toContain("useProductOverview");
  });
});
