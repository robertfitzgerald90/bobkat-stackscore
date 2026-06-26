import type { UserRole } from "@/generated/prisma/client";
import type { ScoreTrendPoint } from "@/lib/analytics/types";
import type { V2CategoryScore } from "@/lib/assessment-library/category-mapping";
import type { CategoryScoreResult } from "@/lib/scoring";
import type {
  MaturityTier,
  Priority,
  ProjectStatus,
  RecommendationStatus,
  TrendDirection,
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
  categoryName: string;
  assessmentId: string;
};

export type ProfileProjectSummary = {
  id: string;
  title: string;
  status: ProjectStatus;
  priority: Priority;
  estimatedImpactPoints: number | null;
  estimatedCost: number | null;
  completedAt: string | null;
  recommendationTitle: string | null;
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
};
