/**
 * StackScore Marketing UI library.
 *
 * Client-facing presentation components for Bobkat IT, StackScore.tech,
 * sales demos, and product tours. Fixture data only — no production backends.
 */

export {
  TechnologyImprovementPlanDemo,
  MaturityProfileDemo,
  RecommendationsDemo,
  SolutionPlaybooksDemo,
  TechnologyRoadmapDemo,
  ExecutiveReportDemo,
  RecommendationsWorkspaceDemo,
  clientImprovementPlanDemoData,
  clientRecommendationsDemoData,
  TIP_DEMO_STAGES,
  TIP_DEMO_STAGE_LABELS,
  isTipDemoStage,
} from "@/components/marketing-demo";

export type {
  TechnologyImprovementPlanDemoProps,
  RecommendationsWorkspaceDemoProps,
  TipDemoStage,
  TipDemoAudience,
  ClientImprovementPlanDemoData,
  ClientRecommendationsDemoData,
  ClientRecommendationsDemoItem,
} from "@/components/marketing-demo";

export { ClientDashboardPreview } from "./client-dashboard-preview";
