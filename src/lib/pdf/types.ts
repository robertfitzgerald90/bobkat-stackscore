import type { AssessmentResultsSummary } from "@/lib/assessments/results-summary";
import type { Priority, MaturityTier } from "@/generated/prisma/client";
import type { TipRecommendationView, TipRoadmapPhaseView } from "@/lib/technology-improvement-plan/types";
import type { TechnologyRoadmap } from "@/lib/technology-improvement-plan/roadmap-engine";

export type AssessmentReportData = {
  clientName: string;
  assessmentName: string;
  assessmentType: string;
  assessmentDate: string;
  completedAt: string | null;
  executiveSummary: string | null;
  summary: AssessmentResultsSummary;
};

export const PRIORITY_ORDER: Priority[] = ["critical", "high", "medium", "low"];

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: "Critical Priority",
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

export function formatReportDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatGeneratedDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

export type TipCategorySummary = {
  name: string;
  score: number;
  ratingLabel: string;
  hasRecommendations: boolean;
};

export type ExecutiveRiskLevel = "Low" | "Moderate" | "High" | "Critical";
export type ExecutivePriorityLevel = "Immediate" | "High" | "Moderate" | "Planned";

export type TipCategoryFinding = {
  categoryName: string;
  currentState: string;
  businessImpact: string;
  riskLevel: ExecutiveRiskLevel;
  priority: ExecutivePriorityLevel;
  priorityRationale?: string;
};

export type TipStrategicInitiative = {
  id: string;
  name: string;
  businessObjective: string;
  whyItMatters: string;
  expectedBenefits: string[];
  recommendedPhase: string;
  estimatedInvestment: string;
  priority: ExecutivePriorityLevel;
  riskLevel: ExecutiveRiskLevel;
  priorityRationale?: string;
};

export type TipPhaseInvestmentRow = {
  phaseLabel: string;
  businessGoal: string;
  estimatedInvestment: string;
};

export type TipBusinessValueMetric = {
  label: string;
  currentPercent: number;
  projectedPercent: number;
};

export type TipInvestmentLineItem = {
  category: string;
  description: string;
  amount: number;
};

export type TipInvestmentSummary = {
  oneTimeImplementation: {
    amount: number;
    description: string;
  };
  managedTechnologyServices: {
    monthlyAmount: number;
    annualAmount: number;
    description: string;
  };
  strategicItConsulting: {
    monthlyAmount: number;
    includedInRoadmap: boolean;
    label: string;
    description: string;
    optionalNote: string;
  };
  combinedMonthlyTotal: number | null;
  combinedMonthlyLabel: string | null;
};

export type TipBusinessOutcome = {
  title: string;
  description: string;
};

export type TipReportData = {
  clientName: string;
  title: string;
  version: number;
  generatedDate: string;
  assessmentName: string | null;
  executiveSummary: string;
  currentScore: number;
  projectedScore: number;
  scoreImprovement: number;
  maturityTier: MaturityTier | null;
  maturityTierLabel: string | null;
  recommendations: TipRecommendationView[];
  roadmapPhases: TipRoadmapPhaseView[];
  technologyRoadmap: TechnologyRoadmap;
  clientInvestmentTotal: number;
  oneTimeInvestmentTotal: number;
  monthlyRecurringTotal: number;
  annualRecurringTotal: number;
  investmentLineItems: TipInvestmentLineItem[];
  categorySummaries: TipCategorySummary[];
  businessOutcomes: TipBusinessOutcome[];
  journeyPhaseLabel: string;
  journeyProgressPercent: number;
  includeInternalDetails: boolean;
  assessmentDate: string | null;
  overallBusinessRisk: ExecutiveRiskLevel;
  topBusinessRisks: string[];
  topOpportunities: string[];
  categoryFindings: TipCategoryFinding[];
  strategicInitiatives: TipStrategicInitiative[];
  phaseInvestmentRows: TipPhaseInvestmentRow[];
  businessValueSnapshot: TipBusinessValueMetric[];
  investmentSummary: TipInvestmentSummary;
  investmentBreakdown?: {
    labor: number;
    hardware: number;
    services: number;
    marginPercent: number;
    marginAmount: number;
    clientTotal: number;
  };
};
