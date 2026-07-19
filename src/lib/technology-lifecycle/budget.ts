import type { RoadmapPhaseStatus } from "@/generated/prisma/client";
import type { LifecycleBudgetPlan } from "./types";

type PhaseBudgetInput = {
  status: RoadmapPhaseStatus;
  oneTimeInvestment: number;
  monthlyRecurringInvestment: number;
  annualRecurringInvestment: number;
};

type RefreshBudgetInput = {
  budgetAmountCents: number | null;
  budgetPeriod: string | null;
  plannedReplacementDate: Date | null;
};

const COMPLETED: RoadmapPhaseStatus[] = ["completed"];
const PLANNED: RoadmapPhaseStatus[] = [
  "planned",
  "awaiting_approval",
  "approved",
  "in_progress",
];
const DEFERRED: RoadmapPhaseStatus[] = ["deferred"];

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function refreshAnnualized(item: RefreshBudgetInput, now: Date): number {
  if (item.budgetAmountCents == null || item.budgetAmountCents <= 0) return 0;
  const dollars = item.budgetAmountCents / 100;
  const period = (item.budgetPeriod ?? "one_time").toLowerCase();
  if (period.includes("month")) return dollars * 12;
  if (period.includes("year") || period.includes("annual")) return dollars;
  // one-time refresh within 3 years counts toward future refresh budget
  if (
    item.plannedReplacementDate &&
    item.plannedReplacementDate.getTime() <= now.getTime() + 3 * 365.25 * 24 * 60 * 60 * 1000
  ) {
    return dollars;
  }
  return dollars;
}

export function computeLifecycleBudget(
  phases: PhaseBudgetInput[],
  refreshItems: RefreshBudgetInput[],
  activeMonthlyServices: number,
  now: Date = new Date(),
): LifecycleBudgetPlan {
  const completedInvestment = roundCurrency(
    phases
      .filter((phase) => COMPLETED.includes(phase.status))
      .reduce((sum, phase) => sum + phase.oneTimeInvestment, 0),
  );
  const plannedInvestment = roundCurrency(
    phases
      .filter((phase) => PLANNED.includes(phase.status))
      .reduce((sum, phase) => sum + phase.oneTimeInvestment, 0),
  );
  const deferredInvestment = roundCurrency(
    phases
      .filter((phase) => DEFERRED.includes(phase.status))
      .reduce((sum, phase) => sum + phase.oneTimeInvestment, 0),
  );

  const roadmapMonthly = roundCurrency(
    phases
      .filter((phase) => !DEFERRED.includes(phase.status) && phase.status !== "cancelled")
      .reduce((sum, phase) => sum + phase.monthlyRecurringInvestment, 0),
  );
  const roadmapAnnual = roundCurrency(
    phases
      .filter((phase) => !DEFERRED.includes(phase.status) && phase.status !== "cancelled")
      .reduce((sum, phase) => sum + phase.annualRecurringInvestment, 0),
  );

  const monthlyServices = roundCurrency(Math.max(activeMonthlyServices, roadmapMonthly));
  const annualServices = roundCurrency(roadmapAnnual + monthlyServices * 12);
  const futureRefreshBudget = roundCurrency(
    refreshItems.reduce((sum, item) => sum + refreshAnnualized(item, now), 0),
  );

  const estimatedThreeYearInvestment = roundCurrency(
    completedInvestment +
      plannedInvestment +
      monthlyServices * 36 +
      roadmapAnnual * 3 +
      futureRefreshBudget,
  );

  return {
    completedInvestment,
    plannedInvestment,
    deferredInvestment,
    monthlyServices,
    annualServices,
    futureRefreshBudget,
    estimatedThreeYearInvestment,
  };
}
