import type {
  DemoBudgetPeriod,
  DemoConnectionMap,
  DemoDashboard,
  DemoExecutiveReport,
  DemoExecutiveReview,
  DemoRecommendation,
  DemoReportPreview,
  DemoRoadmapInitiative,
  DemoTimelineSnapshot,
  JourneyStage,
} from "@/lib/product-overview/types";

export type DemoIndustryId =
  | "manufacturing"
  | "professional-services"
  | "healthcare"
  | "construction"
  | "distribution"
  | "engineering"
  | "financial-services"
  | "retail";

export type DemoBusinessGoal =
  | "reduce-it-risk"
  | "improve-cybersecurity"
  | "plan-investments"
  | "support-growth"
  | "modernize-infrastructure";

export type DemoPersonalization = {
  companyName: string;
  industryId: DemoIndustryId;
  employeeCount: number;
  locationCount: number;
  businessGoal: DemoBusinessGoal;
};

export type DemoProfileBundle = {
  id: DemoIndustryId;
  label: string;
  dashboard: DemoDashboard;
  recommendations: DemoRecommendation[];
  roadmapInitiatives: DemoRoadmapInitiative[];
  connections: DemoConnectionMap[];
  journeyStages: JourneyStage[];
  executiveReview: DemoExecutiveReview;
  executiveReports: DemoExecutiveReport[];
  reportPreviews: Record<string, DemoReportPreview>;
  budgetPeriods: DemoBudgetPeriod[];
  timelineSnapshots: DemoTimelineSnapshot[];
};

export type DemoIndustryOption = {
  id: DemoIndustryId;
  label: string;
  defaultCompanyName: string;
};
