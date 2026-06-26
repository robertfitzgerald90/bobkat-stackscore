import type { AssessmentResultsSummary } from "@/lib/assessments/results-summary";
import type { Priority, MaturityTier } from "@/generated/prisma/client";
import type { TipRecommendationView, TipRoadmapPhaseView } from "@/lib/technology-improvement-plan/types";

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

export type TipReportData = {
  clientName: string;
  title: string;
  version: number;
  generatedDate: string;
  assessmentName: string | null;
  executiveSummary: string;
  currentScore: number;
  projectedScore: number;
  maturityTier: MaturityTier | null;
  recommendations: TipRecommendationView[];
  roadmapPhases: TipRoadmapPhaseView[];
  clientInvestmentTotal: number;
  journeyPhaseLabel: string;
  journeyProgressPercent: number;
  includeInternalDetails: boolean;
  investmentBreakdown?: {
    labor: number;
    hardware: number;
    services: number;
    marginPercent: number;
    clientTotal: number;
  };
};
