import type { MaturityTier } from "@/generated/prisma/client";

export type PortfolioReadinessStatus = "ready" | "partial" | "blocked" | "healthy";

export type PortfolioScoreTrendPoint = {
  date: string;
  score: number;
};

export type PortfolioClientCard = {
  clientId: string;
  companyName: string;
  currentStackScore: number | null;
  projectedStackScore: number | null;
  maturityStatus: string | null;
  maturityTier: MaturityTier | null;
  scoreTrend: PortfolioScoreTrendPoint[];
  openProjectsCount: number;
  criticalRecommendationsCount: number;
  immediateFocusCount: number;
  readinessStatus: PortfolioReadinessStatus;
  lastAssessmentDate: string | null;
  recommendedSortScore: number;
};

export type PortfolioSummary = {
  clients: PortfolioClientCard[];
  generatedAt: string;
};
