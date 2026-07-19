import {
  approvedTechnologySpendDollars,
  annualTechnologyPlanDollars,
  NORTHSTAR_DEMO_FINANCIAL_PROFILE,
} from "@/lib/demo-data/demo-financial-profile";

const financials = NORTHSTAR_DEMO_FINANCIAL_PROFILE;

/** Shared Northstar demo budget figures — derived from centralized financial assumptions. */
export const NORTHSTAR_DEMO_BUDGET = {
  planned: annualTechnologyPlanDollars(financials),
  approved: approvedTechnologySpendDollars(financials),
  committed: financials.annualPlan.committedCents / 100,
  remaining: financials.annualPlan.remainingCents / 100,
  utilizationPercent: financials.annualPlan.utilizationPercent,
  operatingAnnual: financials.operating.totalOperatingAnnualCents / 100,
  managedEndpointMonthly: financials.operating.managedEndpointMonthlyCents / 100,
  managedEndpointAnnual: financials.operating.managedEndpointAnnualCents / 100,
  m365Annual: financials.operating.m365AnnualCents / 100,
} as const;

export function formatNorthstarBudgetPlanLabel(): string {
  return `$${NORTHSTAR_DEMO_BUDGET.planned.toLocaleString("en-US")}`;
}

export function formatNorthstarBudgetUtilizationLabel(): string {
  return `${NORTHSTAR_DEMO_BUDGET.utilizationPercent}% budget utilization`;
}
