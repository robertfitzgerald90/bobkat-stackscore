/**
 * Portable StackScore marketing demos.
 *
 * Safe for client-facing marketing reuse. Uses only local fixture data.
 * Does not connect to auth, Prisma, APIs, billing, or production records.
 */

export { TechnologyImprovementPlanDemo } from "./TechnologyImprovementPlanDemo";
export type { TechnologyImprovementPlanDemoProps } from "./TechnologyImprovementPlanDemo";

export { RecommendationsWorkspaceDemo } from "./RecommendationsWorkspaceDemo";
export type { RecommendationsWorkspaceDemoProps } from "./RecommendationsWorkspaceDemo";

export { MaturityProfileDemo } from "./stages/MaturityProfileDemo";
export { RecommendationsDemo } from "./stages/RecommendationsDemo";
export { SolutionPlaybooksDemo } from "./stages/SolutionPlaybooksDemo";
export { TechnologyRoadmapDemo } from "./stages/TechnologyRoadmapDemo";
export { ExecutiveReportDemo } from "./stages/ExecutiveReportDemo";

export { clientImprovementPlanDemoData } from "./data/client-improvement-plan-demo-data";
export {
  clientRecommendationsDemoData,
} from "./data/client-recommendations-demo-data";

export type {
  ClientRecommendationsDemoData,
  ClientRecommendationsDemoItem,
  DemoRecommendationPriority,
  DemoRecommendationStatus,
  DemoRecommendationType,
} from "./data/client-recommendations-demo-data";

export {
  TIP_DEMO_STAGES,
  TIP_DEMO_STAGE_LABELS,
  isTipDemoStage,
} from "./types";

export type {
  TipDemoStage,
  TipDemoAudience,
  TipDemoPriority,
  TipDemoPillarScore,
  TipDemoRecommendation,
  TipDemoPlaybook,
  TipDemoRoadmapItem,
  TipDemoRoadmapPhase,
  TipDemoReportSection,
  ClientImprovementPlanDemoData,
} from "./types";
