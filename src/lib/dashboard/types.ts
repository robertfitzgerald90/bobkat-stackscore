import type { Rating } from "@/generated/prisma/client";

export type DashboardClientRow = {
  clientId: string;
  companyName: string;
  currentStackScore: number | null;
  rating: Rating | null;
  maturityStatus: string | null;
  scoreChange: number | null;
  criticalRecommendationsCount: number;
  openProjectsCount: number;
  immediateFocusCount: number;
};

export type DashboardKpis = {
  averageStackScore: number | null;
  averageRating: Rating | null;
  portfolioScoreTrend: number | null;
  immediateFocusTotal: number;
  openRecommendationsCount: number;
  criticalRecommendationsCount: number;
  activeProjectsCount: number;
  atRiskClientCount: number;
  clientsImprovingCount: number;
  clientsDecliningCount: number;
  assessedClientCount: number;
  totalClientCount: number;
};

export type DashboardSummary = {
  kpis: DashboardKpis;
  scoreDistribution: Record<Rating, number>;
  clients: DashboardClientRow[];
  generatedAt: string;
};
