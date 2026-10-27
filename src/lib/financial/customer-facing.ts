/**
 * Customer portal financial visibility (SS-REL-011)
 * -------------------------------------------------
 * Customers must not see automatically generated TIP / roadmap investment
 * quotations. Verified records (completed/approved spend, contracted billing,
 * refresh budgets with entered amounts) may remain visible.
 *
 * Staff (admin / technician) retain full internal planning figures.
 */

import type { LifecycleBudgetPlan, TechnologyLifecycleDashboard } from "@/lib/technology-lifecycle/types";
import type { ClientRoadmapDashboard, ClientRoadmapPhaseDetail, RoadmapPhaseView } from "@/lib/client-roadmap/types";
import type { QbrBudgetForecast } from "@/lib/qbr/types";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

export function shouldHideSpeculativeFinancials(role: string): boolean {
  return isCustomerMode(role);
}

/** Strip TIP/proposed estimate fields while keeping verified financial signals. */
export function scrubBudgetPlanForCustomer(budget: LifecycleBudgetPlan): LifecycleBudgetPlan {
  const completedInvestment = budget.completedInvestment;
  const approvedInvestment = budget.approvedInvestment;
  const contractedMonthlyServices = budget.contractedMonthlyServices;
  const contractedAnnualServices = budget.contractedAnnualServices;
  const futureRefreshBudget = budget.futureRefreshBudget;

  const hasVerifiedFinancials =
    completedInvestment > 0 ||
    approvedInvestment > 0 ||
    contractedMonthlyServices > 0 ||
    contractedAnnualServices > 0 ||
    futureRefreshBudget > 0;

  return {
    completedInvestment,
    approvedInvestment,
    proposedInvestment: 0,
    plannedInvestment: approvedInvestment,
    deferredInvestment: 0,
    contractedMonthlyServices,
    contractedAnnualServices,
    proposedMonthlyServices: 0,
    proposedAnnualServices: 0,
    monthlyServices: contractedMonthlyServices,
    annualServices: contractedAnnualServices,
    futureRefreshBudget,
    // Never expose multi-year speculative rollups to customers.
    estimatedThreeYearInvestment: 0,
    hasVerifiedFinancials,
    hasProposedEstimates: false,
    presentationMode: hasVerifiedFinancials ? "verified" : "empty",
  };
}

export function scrubLifecycleDashboardForCustomer(
  dashboard: TechnologyLifecycleDashboard,
): TechnologyLifecycleDashboard {
  return {
    ...dashboard,
    budget: scrubBudgetPlanForCustomer(dashboard.budget),
    phases: dashboard.phases.map((phase) => ({
      ...phase,
      oneTimeInvestment: 0,
      monthlyRecurringInvestment: 0,
    })),
    opportunities: dashboard.opportunities.map((item) => ({
      ...item,
      estimatedOneTimeInvestment: 0,
    })),
    initiativeEffectiveness: dashboard.initiativeEffectiveness.map((item) => ({
      ...item,
      estimatedCost: null,
      // actualCost preserved when recorded
    })),
  };
}

function scrubRoadmapPhaseForCustomer(phase: RoadmapPhaseView): RoadmapPhaseView {
  return {
    ...phase,
    oneTimeInvestment: 0,
    monthlyRecurringInvestment: 0,
    annualRecurringInvestment: 0,
  };
}

export function scrubRoadmapDashboardForCustomer(
  dashboard: ClientRoadmapDashboard,
): ClientRoadmapDashboard {
  return {
    ...dashboard,
    metrics: {
      ...dashboard.metrics,
      remainingOneTimeInvestment: 0,
      remainingMonthlyRecurring: 0,
      currentMonthlyServices: 0,
      projectedMonthlyServicesAfterCompletion: 0,
    },
    phases: dashboard.phases.map(scrubRoadmapPhaseForCustomer),
  };
}

export function scrubRoadmapPhaseDetailForCustomer(
  phase: ClientRoadmapPhaseDetail,
): ClientRoadmapPhaseDetail {
  return {
    ...scrubRoadmapPhaseForCustomer(phase),
    roadmapId: phase.roadmapId,
    roadmapTitle: phase.roadmapTitle,
    roadmapStatus: phase.roadmapStatus,
    clientId: phase.clientId,
    scoreJourney: phase.scoreJourney,
    events: phase.events,
    isConsultant: phase.isConsultant,
  };
}

/** QBR customer views: drop speculative roadmap budget forecast block. */
export function scrubQbrBudgetForecastForCustomer(
  forecast: QbrBudgetForecast | null | undefined,
): QbrBudgetForecast | null {
  if (!forecast) return null;
  // Only keep completed spend; drop speculative planned / multi-year TIP modeling.
  const completed = forecast.completedInvestment ?? 0;
  if (completed <= 0) {
    return null;
  }
  return {
    completedInvestment: completed,
    plannedInvestment: 0,
    deferredInvestment: 0,
    monthlyServices: 0,
    estimatedThreeYearInvestment: 0,
  };
}

