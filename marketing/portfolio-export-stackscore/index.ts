/**
 * StackScore portfolio export package.
 * Copy the entire marketing/portfolio-export folder into another Next.js project.
 */

export { portfolioPreviewData } from "./data/preview-data";
export { default as previewData } from "./data/preview-data";

export { ExecutiveDashboardPreview } from "./components/ExecutiveDashboardPreview";
export type { ExecutiveDashboardPreviewProps } from "./components/ExecutiveDashboardPreview";

export { TechnologyMaturityPreview } from "./components/TechnologyMaturityPreview";
export type { TechnologyMaturityPreviewProps } from "./components/TechnologyMaturityPreview";

export { RecommendationsWorkspacePreview } from "./components/RecommendationsWorkspacePreview";
export type { RecommendationsWorkspacePreviewProps } from "./components/RecommendationsWorkspacePreview";

export { TechnologyRoadmapPreview } from "./components/TechnologyRoadmapPreview";
export type { TechnologyRoadmapPreviewProps } from "./components/TechnologyRoadmapPreview";

export { ExecutiveReportPreview } from "./components/ExecutiveReportPreview";
export type { ExecutiveReportPreviewProps } from "./components/ExecutiveReportPreview";

export type {
  StackScorePortfolioPreviewData,
  PortfolioExecutiveDashboardData,
  PortfolioMaturityData,
  PortfolioRecommendationsData,
  PortfolioRoadmapData,
  PortfolioExecutiveReportData,
  PortfolioPriority,
  PortfolioRecommendation,
  PortfolioPillarScore,
  PortfolioRoadmapPhase,
  PortfolioMetric,
} from "./types";
