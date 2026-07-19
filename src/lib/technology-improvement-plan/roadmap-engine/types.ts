import type { Priority } from "@/generated/prisma/client";
import type { TipRecommendationView, TipRoadmapPhase } from "../types";

export type RecommendationCostType = "one_time" | "recurring" | "mixed";

export type RoadmapPhaseDefinition = {
  id: string;
  name: string;
  subtitle: string;
  timeline: string;
  sortOrder: number;
  priorities: Priority[];
};

export type RecommendationCostProfile = {
  recommendationId: string;
  costType: RecommendationCostType;
  oneTimeInvestment: number;
  monthlyRecurringInvestment: number;
  annualRecurringInvestment: number;
};

export type RoadmapPhaseInitiative = {
  recommendationId: string;
  title: string;
  priority: Priority;
  sortOrder: number;
  costProfile: RecommendationCostProfile;
};

export type RoadmapPhaseResult = {
  id: string;
  name: string;
  subtitle: string;
  timeline: string;
  sortOrder: number;
  executiveSummary: string;
  stackScoreImprovement: number;
  projectedScore: number;
  oneTimeInvestment: number;
  monthlyRecurringInvestment: number;
  annualRecurringInvestment: number;
  initiatives: RoadmapPhaseInitiative[];
  businessOutcomes: Array<{ title: string; description: string }>;
  recommendationIds: string[];
};

export type TechnologyRoadmapTotals = {
  totalOneTimeInvestment: number;
  totalMonthlyRecurring: number;
  totalAnnualRecurring: number;
  projectedFinalStackScore: number;
  /** Legacy combined total (one-time + first month recurring) for backwards compatibility */
  legacyCombinedTotal: number;
};

export type TechnologyRoadmap = {
  phases: RoadmapPhaseResult[];
  totals: TechnologyRoadmapTotals;
  /** Underlying wizard phase assignments (preserves consultant customization) */
  phaseAssignments: TipRoadmapPhase[];
};

export type BuildTechnologyRoadmapInput = {
  currentScore: number;
  recommendations: TipRecommendationView[];
  phaseAssignments: TipRoadmapPhase[];
  investmentDraft: {
    laborCents: number;
    hardwareCents: number;
    servicesCents: number;
    marginPercent: number;
  };
};
