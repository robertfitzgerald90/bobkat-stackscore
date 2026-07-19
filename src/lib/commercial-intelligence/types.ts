import type { LifecycleHealthBand } from "@/lib/technology-lifecycle/types";
import type { TrendDirection } from "@/generated/prisma/client";

export type SalesFunnelStageKey =
  | "marketing_lead"
  | "assessment_purchased"
  | "assessment_completed"
  | "roadmap_delivered"
  | "proposal_generated"
  | "proposal_approved"
  | "implementation_started"
  | "implementation_completed"
  | "managed_services_active"
  | "strategic_consulting_active";

export type SalesFunnelStage = {
  key: SalesFunnelStageKey;
  label: string;
  count: number;
  conversionFromPreviousPercent: number | null;
};

export type RevenueForecast = {
  monthlyRevenueForecast: number;
  quarterlyRevenueForecast: number;
  annualRevenueForecast: number;
  pipelineValue: number;
  weightedPipelineValue: number;
  recurringMonthly: number;
  pendingProposalValue: number;
  approvedPhaseValue: number;
  expectedAssessmentRevenue: number;
  renewalRevenueNext90Days: number;
};

export type BusinessIntelligenceKpis = {
  assessmentsCompleted: number;
  averageStackScore: number | null;
  averageImprovement: number | null;
  proposalAcceptanceRate: number | null;
  phase1CloseRate: number | null;
  phaseExpansionRate: number | null;
  recurringRevenueMonthly: number;
  projectRevenue: number;
  consultingRevenue: number;
  averageClientLifetimeValue: number | null;
  assessmentConversionRate: number | null;
  averageImplementationDays: number | null;
  roadmapCompletionRate: number | null;
};

export type ClientSuccessMetrics = {
  clientId: string;
  clientName: string;
  technologyScoreGrowth: number | null;
  roadmapCompletionPercent: number;
  serviceAdoptionCount: number;
  riskReductionPercent: number;
  securityImprovement: number;
  infrastructureImprovement: number;
  documentationImprovement: number;
  overallOutcomeScore: number;
};

export type Customer360Dashboard = {
  clientId: string;
  companyName: string;
  industry: string | null;
  primaryContactName: string;
  primaryContactEmail: string;
  status: string;
  currentStackScore: number | null;
  technologyTrend: TrendDirection | null;
  technologyHealth: LifecycleHealthBand;
  overallClientHealthScore: number;
  roadmapProgressPercent: number;
  activeProjects: number;
  completedProjects: number;
  managedServicesCount: number;
  monthlyRecurringRevenue: number;
  proposalPipelineCount: number;
  proposalPipelineValue: number;
  upcomingReviewDate: string | null;
  recentAssessments: Array<{
    id: string;
    name: string;
    completedAt: string | null;
    score: number | null;
  }>;
  openOpportunities: number;
  recentCommunications: Array<{
    id: string;
    subject: string;
    sentAt: string;
  }>;
  upcomingRenewals: Array<{
    title: string;
    dueDate: string;
    kind: string;
  }>;
  activeManagedServices: string[];
  currentPhaseName: string | null;
};

export type ExecutivePortfolioInsight = {
  highestRiskClients: Array<{ clientId: string; clientName: string; score: number | null }>;
  fastestImprovingClients: Array<{
    clientId: string;
    clientName: string;
    delta: number;
  }>;
  largestOpportunities: Array<{
    clientId: string;
    clientName: string;
    value: number;
    label: string;
  }>;
  largestRecurringRevenue: Array<{
    clientId: string;
    clientName: string;
    mrr: number;
  }>;
  lowestTechnologyScores: Array<{ clientId: string; clientName: string; score: number | null }>;
  highestTechnologyScores: Array<{ clientId: string; clientName: string; score: number | null }>;
  upcomingQbrs: Array<{ clientId: string; clientName: string; date: string }>;
  upcomingRenewals: Array<{ clientId: string; clientName: string; title: string; date: string }>;
};

export type CommercialInsightsDashboard = {
  kpis: BusinessIntelligenceKpis;
  funnel: SalesFunnelStage[];
  forecast: RevenueForecast;
  portfolio: ExecutivePortfolioInsight;
  clientSuccess: ClientSuccessMetrics[];
  generatedAt: string;
};

export type ReportLibraryItem = {
  key: string;
  title: string;
  description: string;
  engine: string;
  hrefTemplate: string;
  available: boolean;
};
