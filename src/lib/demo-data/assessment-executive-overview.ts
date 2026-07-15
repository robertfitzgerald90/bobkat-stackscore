import type { ClientWorkspaceKpis, ImmediateFocusItem } from "@/lib/client-workspace";
import type { TrendDirection } from "@/generated/prisma/client";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";

export type AssessmentExecutiveOverviewData = {
  organizationName: string;
  status: string;
  kpis: ClientWorkspaceKpis;
  focusItems: ImmediateFocusItem[];
  stackScore: number;
  projectedScore: number;
  maturityTierLabel: string;
  primaryBusinessGoalLabel: string;
  trendDirection: TrendDirection;
  technologyVision: string;
  criticalExposureCount: number;
  lastAssessedAt: string;
  scoreDeltaSincePrevious: number;
  nextRecommendedAssessmentAt: string;
  assessmentsCompleted: number;
};

const PINNACLE_FOCUS_ITEMS: ImmediateFocusItem[] = [
  {
    id: "demo-focus-1",
    kind: "project",
    title: "Implement centralized endpoint management",
    pillarName: "Endpoint Management",
    priority: "critical",
    estimatedImpactPoints: 6,
    statusLabel: "In Progress",
    readinessLabel: "Ready",
    sourceLabel: "From recommendation",
    href: "#",
  },
  {
    id: "demo-focus-2",
    kind: "recommendation",
    title: "Deploy infrastructure availability monitoring",
    pillarName: "Security Operations",
    priority: "critical",
    estimatedImpactPoints: 5,
    statusLabel: "Accepted",
    readinessLabel: "Ready",
    sourceLabel: "Recommendation",
    href: "#",
  },
  {
    id: "demo-focus-3",
    kind: "project",
    title: "Standardize Microsoft 365 security baseline",
    pillarName: "Productivity & Collaboration",
    priority: "critical",
    estimatedImpactPoints: 5,
    statusLabel: "In Progress",
    readinessLabel: "Ready",
    sourceLabel: "From recommendation",
    href: "#",
  },
  {
    id: "demo-focus-4",
    kind: "recommendation",
    title: "Establish immutable backup strategy",
    pillarName: "Data Protection & Recovery",
    priority: "critical",
    estimatedImpactPoints: 6,
    statusLabel: "Accepted",
    readinessLabel: "Ready",
    sourceLabel: "Recommendation",
    href: "#",
  },
  {
    id: "demo-focus-5",
    kind: "recommendation",
    title: "Formalize vendor lifecycle documentation",
    pillarName: "Technology Strategy",
    priority: "critical",
    estimatedImpactPoints: 4,
    statusLabel: "Open",
    readinessLabel: "Ready",
    sourceLabel: "Recommendation",
    href: "#",
  },
];

const PINNACLE_TECHNOLOGY_VISION =
  "Pinnacle Engineering is a growing civil and structural engineering firm with 84 employees across two offices. The organization relies on Microsoft 365 Business Premium, hybrid Entra ID, Ubiquiti networking, NinjaOne RMM, Synology backup, and Azure-hosted line-of-business applications.";

/** Static demo data for public marketing previews — never loaded from the database. */
export const assessmentExecutiveOverviewDemoData: AssessmentExecutiveOverviewData = {
  organizationName: "Pinnacle Engineering",
  status: "active",
  kpis: {
    stackScore: 53,
    projectedScore: 84,
    openProjectsCount: 4,
    criticalRecommendationsCount: 7,
    immediateFocusCount: 7,
  },
  focusItems: PINNACLE_FOCUS_ITEMS,
  stackScore: 53,
  projectedScore: 84,
  maturityTierLabel: "Developing",
  primaryBusinessGoalLabel: "Improve Cybersecurity",
  trendDirection: "improving",
  technologyVision: PINNACLE_TECHNOLOGY_VISION,
  criticalExposureCount: 7,
  lastAssessedAt: "2026-06-21T00:00:00.000Z",
  scoreDeltaSincePrevious: 8,
  nextRecommendedAssessmentAt: "2026-12-15T00:00:00.000Z",
  assessmentsCompleted: 2,
};

/** Maps executive overview demo data into the profile detail shape used by dashboard presentation components. */
export function toExecutiveOverviewProfileDetail(
  data: AssessmentExecutiveOverviewData,
  clientId = "demo-pinnacle-engineering",
): TechnologyProfileDetail {
  return {
    profile: {
      id: "demo-profile",
      clientId,
      overallStackScore: data.stackScore,
      maturityTier: "developing",
      maturityTierLabel: data.maturityTierLabel,
      categoryScores: [],
      pillarSnapshots: null,
      scoringEngineVersion: "v2",
      v1CategoryScores: [],
      riskSummary: {
        critical: data.criticalExposureCount,
        high: 4,
        medium: 6,
        low: 2,
        criticalExposure: true,
      },
      trendDirection: data.trendDirection,
      lastAssessedAt: data.lastAssessedAt,
      nextRecommendedAssessmentAt: data.nextRecommendedAssessmentAt,
      currentAssessmentId: "demo-assessment",
      openRecommendationCount: 12,
      criticalExposureCount: data.criticalExposureCount,
    },
    client: {
      id: clientId,
      companyName: data.organizationName,
      primaryContactName: "Jordan Ellis",
      primaryContactEmail: "jordan.ellis@pinnacle-engineering.example",
      industry: "Engineering",
      status: data.status,
    },
    scoreTrend: [],
    openRecommendations: [],
    activeProjects: [],
    completedProjects: [],
    journey: {
      phase: "improve",
      phaseLabel: "Improve",
      assessmentsCompleted: data.assessmentsCompleted,
      openRecommendations: 12,
      activeProjects: data.kpis.openProjectsCount,
      completedProjects: 1,
      scoreDelta: data.scoreDeltaSincePrevious,
      progressPercent: 42,
    },
    audience: "internal",
    capabilities: {
      canEditBusinessProfile: false,
      canEditImprovementPlan: false,
      canViewPricing: false,
      canViewInternalDocuments: false,
    },
    businessSnapshot: {
      industry: "Engineering",
      employeeCount: 84,
      numberOfLocations: 2,
      primaryBusinessGoal: "improve_cybersecurity",
      primaryBusinessGoalLabel: data.primaryBusinessGoalLabel,
      technologyVision: data.technologyVision,
      itSupportModel: "msp",
      itSupportModelLabel: "Managed Service Provider",
      environmentType: "hybrid",
      environmentTypeLabel: "Hybrid",
      complianceFramework: null,
      complianceFrameworkLabel: "—",
      complianceStatus: null,
      primaryContactName: "Jordan Ellis",
      primaryContactTitle: "Director of Operations",
      primaryContactEmail: "jordan.ellis@pinnacle-engineering.example",
      primaryContactPhone: null,
    },
    journeyScores: {
      initialScore: 45,
      currentScore: data.stackScore,
      projectedScore: data.projectedScore,
      longTermTargetScore: 90,
      scoreDeltaSincePrevious: data.scoreDeltaSincePrevious,
      scoreDeltaSinceInitial: data.scoreDeltaSincePrevious,
    },
    nextAction: {
      label: "Review recommendations",
      description: "Prioritize the next improvement initiative.",
      href: "#",
      kind: "recommendations",
    },
    categoryInsights: [],
    pillarInsights: [],
    roadmapPreview: [],
    documents: [],
    activeTip: null,
    scoreDeltaSincePrevious: data.scoreDeltaSincePrevious,
    sections: {
      showAssessmentForms: false,
      showAdminActions: false,
      showBusinessSnapshot: true,
      showBusinessSnapshotLimited: false,
      showOpenOpportunities: false,
      showRoadmapPreview: false,
      showRecentProgress: false,
      showActiveProjects: false,
      showAssessmentResultsLink: false,
      showRoadmapBuilderLink: false,
      showNextActionCta: false,
      showRecommendationCounts: false,
      showJourneyTimeline: false,
      showRecommendationsLink: false,
    },
    journeyTimeline: [],
    workspace: {
      kpis: data.kpis,
      items: data.focusItems,
    },
    draftAssessmentId: null,
  };
}
