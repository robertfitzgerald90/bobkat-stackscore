import { proposalStageWeight } from "./funnel";
import type { RevenueForecast } from "./types";

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function computeRevenueForecast(input: {
  recurringMonthly: number;
  pendingProposals: Array<{ oneTimeInvestment: number; status: string }>;
  approvedPhaseOneTimeRemaining: number;
  expectedAssessmentRevenue: number;
  renewalRevenueNext90Days: number;
}): RevenueForecast {
  const pendingProposalValue = roundCurrency(
    input.pendingProposals.reduce((sum, item) => sum + item.oneTimeInvestment, 0),
  );
  const weightedPipelineValue = roundCurrency(
    input.pendingProposals.reduce(
      (sum, item) => sum + item.oneTimeInvestment * proposalStageWeight(item.status),
      0,
    ),
  );

  const pipelineValue = roundCurrency(
    pendingProposalValue +
      input.approvedPhaseOneTimeRemaining +
      input.expectedAssessmentRevenue +
      input.renewalRevenueNext90Days,
  );

  const monthlyRevenueForecast = roundCurrency(
    input.recurringMonthly +
      weightedPipelineValue / 12 +
      input.expectedAssessmentRevenue / 12 +
      input.renewalRevenueNext90Days / 3,
  );

  return {
    monthlyRevenueForecast,
    quarterlyRevenueForecast: roundCurrency(monthlyRevenueForecast * 3),
    annualRevenueForecast: roundCurrency(monthlyRevenueForecast * 12),
    pipelineValue,
    weightedPipelineValue,
    recurringMonthly: roundCurrency(input.recurringMonthly),
    pendingProposalValue,
    approvedPhaseValue: roundCurrency(input.approvedPhaseOneTimeRemaining),
    expectedAssessmentRevenue: roundCurrency(input.expectedAssessmentRevenue),
    renewalRevenueNext90Days: roundCurrency(input.renewalRevenueNext90Days),
  };
}
