import type { UserRole } from "@/generated/prisma/client";
import type { ScoreTrendPoint } from "@/lib/analytics/types";
import type { V2CategoryScore } from "@/lib/assessment-library/category-mapping";
import type { CategoryScoreResult } from "@/lib/scoring";
import type {
  ComplianceFramework,
  EnvironmentType,
  ItSupportModel,
  MaturityTier,
  Priority,
  PrimaryBusinessGoal,
  ProjectStatus,
  RecommendationStatus,
  TipWorkflowStep,
  TrendDirection,
  DocumentType,
} from "@/generated/prisma/client";

export type RiskSummary = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  criticalExposure: boolean;
};

export type ProfileAudience = "internal" | "client";

export function resolveProfileAudience(role: UserRole): ProfileAudience {
  return role === "client" ? "client" : "internal";
}

export type TechnologyJourneyPhase = "assess" | "improve" | "maintain";

export type TechnologyJourneyProgress = {
  phase: TechnologyJourneyPhase;
  phaseLabel: string;
  assessmentsCompleted: number;
  openRecommendations: number;
  activeProjects: number;
  completedProjects: number;
  scoreDelta: number | null;
  progressPercent: number;
};

export type ProfileRecommendationSummary = {
  id: string;
  title: string;
  priority: Priority;
  status: RecommendationStatus;
  estimatedImpactPoints: number;
  businessImpact: string;
  categoryName: string;
  categoryCode: string;
  assessmentId: string;
  latestAssessmentId: string;
  triggeredInLatestAssessment: boolean;
  isRecurrence: boolean;
};

export type ProfileProjectSummary = {
  id: string;
  title: string;
  status: ProjectStatus;
  priority: Priority;
  estimatedImpactPoints: number | null;
  actualImpactPoints: number | null;
  estimatedCost: number | null;
  completedAt: string | null;
  recommendationTitle: string | null;
};

export type ProfileBusinessSnapshot = {
  industry: string | null;
  employeeCount: number | null;
  numberOfLocations: number | null;
  primaryBusinessGoal: PrimaryBusinessGoal | null;
  primaryBusinessGoalLabel: string;
  technologyVision: string | null;
  itSupportModel: ItSupportModel | null;
  itSupportModelLabel: string;
  environmentType: EnvironmentType | null;
  environmentTypeLabel: string;
  complianceFramework: ComplianceFramework | null;
  complianceFrameworkLabel: string;
  complianceStatus: string | null;
  primaryContactName: string;
  primaryContactTitle: string | null;
  primaryContactEmail: string;
  primaryContactPhone: string | null;
};

export type ProfileCapabilities = {
  canEditBusinessProfile: boolean;
  canEditImprovementPlan: boolean;
  canViewPricing: boolean;
  canViewInternalDocuments: boolean;
};

export type ProfileSectionVisibility = {
  showAssessmentForms: boolean;
  showAdminActions: boolean;
  showInternalQuickActions: boolean;
  showBusinessSnapshot: boolean;
  showBusinessSnapshotLimited: boolean;
  showOpenOpportunities: boolean;
  showRoadmapPreview: boolean;
  showRecentProgress: boolean;
  showActiveProjects: boolean;
  showAssessmentResultsLink: boolean;
  showRoadmapBuilderLink: boolean;
  showNextActionCta: boolean;
  showRecommendationCounts: boolean;
};

export type NextRecommendedAction = {
  label: string;
  description: string;
  href: string;
  kind: "assessment" | "recommendations" | "tip" | "reassessment" | "projects" | "business_profile";
};

export type TechnologyJourneyScores = {
  initialScore: number | null;
  currentScore: number | null;
  projectedScore: number | null;
  longTermTargetScore: number | null;
  scoreDeltaSincePrevious: number | null;
  scoreDeltaSinceInitial: number | null;
};

export type CategoryScoreInsight = {
  categoryCode: string;
  categoryName: string;
  percentScore: number | null;
  maturityTier: string | null;
  trendDelta: number | null;
  openRecommendationCount: number;
};

export type RoadmapPhasePreview = {
  id: string;
  label: string;
  projectedScore: number;
  recommendationCount: number;
};

export type ProfileDocumentSummary = {
  id: string;
  title: string;
  documentType: DocumentType;
  createdAt: string;
  assessmentId: string | null;
  tipId: string | null;
  downloadHref: string | null;
};

export type ProfileTipSummary = {
  id: string;
  title: string;
  status: string;
  currentStep: TipWorkflowStep;
  projectedScore: number | null;
};

export type TechnologyProfileClientInfo = {
  id: string;
  companyName: string;
  primaryContactName: string;
  primaryContactEmail: string;
  industry: string | null;
  status: string;
};

export type TechnologyProfileDetail = {
  profile: {
    id: string;
    clientId: string;
    overallStackScore: number | null;
    maturityTier: MaturityTier | null;
    maturityTierLabel: string | null;
    categoryScores: V2CategoryScore[];
    v1CategoryScores: CategoryScoreResult[];
    riskSummary: RiskSummary;
    trendDirection: TrendDirection | null;
    lastAssessedAt: string | null;
    nextRecommendedAssessmentAt: string | null;
    currentAssessmentId: string | null;
    openRecommendationCount: number;
    criticalExposureCount: number;
  };
  client: TechnologyProfileClientInfo;
  scoreTrend: ScoreTrendPoint[];
  openRecommendations: ProfileRecommendationSummary[];
  activeProjects: ProfileProjectSummary[];
  completedProjects: ProfileProjectSummary[];
  journey: TechnologyJourneyProgress;
  audience: ProfileAudience;
  capabilities: ProfileCapabilities;
  businessSnapshot: ProfileBusinessSnapshot;
  journeyScores: TechnologyJourneyScores;
  nextAction: NextRecommendedAction;
  categoryInsights: CategoryScoreInsight[];
  roadmapPreview: RoadmapPhasePreview[];
  documents: ProfileDocumentSummary[];
  activeTip: ProfileTipSummary | null;
  scoreDeltaSincePrevious: number | null;
  sections: ProfileSectionVisibility;
};
