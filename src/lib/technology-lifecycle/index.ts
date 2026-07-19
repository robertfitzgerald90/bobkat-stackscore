export type {
  ConsultingWorkspaceClient,
  ConsultingWorkspaceSummary,
  LifecycleBudgetPlan,
  LifecycleHealthBand,
  LifecycleInitiativeEffectiveness,
  LifecycleManagedServiceLink,
  LifecycleOpportunityView,
  LifecycleRefreshEvent,
  LifecycleTrendPoint,
  TechnologyLifecycleDashboard,
} from "./types";

export { computeLifecycleBudget } from "./budget";
export { buildRefreshEvents } from "./refresh";
export { evaluatePostPhaseOpportunities } from "./opportunity";
export {
  BOBKAT_MANAGED_SERVICE_CATALOG,
  linkManagedServicesToObjectives,
} from "./managed-services";
export {
  LIFECYCLE_HEALTH_LABELS,
  scoreToBusinessRisk,
  scoreToHealthBand,
  trendLabel,
} from "./health";
export {
  evaluateAndPersistPhaseOpportunities,
  getTechnologyLifecycleDashboard,
} from "./service";
export { getConsultingWorkspaceSummary } from "./consulting-workspace";
