import type { RoadmapPhaseStatus } from "@/generated/prisma/client";
import type {
  LifecycleBudgetPlan,
  LifecycleBudgetPresentationMode,
} from "./types";

/**
 * Technology lifecycle budget rules (SS-REL-010)
 * ----------------------------------------------
 * ONE-TIME
 * - completedInvestment: phases with status `completed`
 * - approvedInvestment: `approved` | `in_progress` (customer/staff-approved work)
 * - proposedInvestment: `planned` | `awaiting_approval` (TIP / roadmap estimates — not committed)
 * - plannedInvestment: approved + proposed (legacy aggregate for QBR / callers)
 * - deferredInvestment: `deferred` only
 *
 * RECURRING (per phase, then summed)
 * - TIP stores both monthly and annual where annual ≈ monthly × 12. Never add both.
 * - Effective annual for a phase = max(annual, monthly × 12).
 *   • Equal values → counted once
 *   • Annual-only (monthly 0) → preserves independent annual charges
 *   • Annual > monthly×12 → treats annual as the fuller independent total
 * - Roadmap proposed monthly = Σ monthly on non-deferred/non-cancelled phases
 * - Contracted monthly = active billing recurring services (caller-supplied)
 * - Display / projection monthly = max(contracted, proposed) — never sum both
 * - annualServices = max(contractedMonthly, proposedMonthly) related annual:
 *     max(contractedMonthly × 12, Σ phase effective annual)
 *
 * THREE-YEAR ESTIMATE (labeled preliminary when only proposed data exists)
 * - completed + approved + proposed one-time
 * - + annualServices × 3  (exactly three years of effective annual recurring)
 * - + futureRefreshBudget
 * - Must NOT also add monthly × 36 when annual already includes that recurring.
 */

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
const APPROVED_ACTIVE: RoadmapPhaseStatus[] = ["approved", "in_progress"];
const PROPOSED: RoadmapPhaseStatus[] = ["planned", "awaiting_approval"];
/** Legacy “in-flight” one-time statuses (approved path + proposed estimates). */
const PLANNED_LEGACY: RoadmapPhaseStatus[] = [
  "planned",
  "awaiting_approval",
  "approved",
  "in_progress",
];
const DEFERRED: RoadmapPhaseStatus[] = ["deferred"];

const CURRENCY_EPSILON = 0.02;

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function approximatelyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= CURRENCY_EPSILON;
}

/**
 * Single annualized recurring amount for a phase without double-counting
 * monthly and its annualized twin.
 */
export function effectivePhaseAnnualRecurring(
  monthlyRecurringInvestment: number,
  annualRecurringInvestment: number,
): number {
  const monthly = Math.max(0, monthlyRecurringInvestment);
  const annual = Math.max(0, annualRecurringInvestment);
  const fromMonthly = roundCurrency(monthly * 12);

  if (fromMonthly <= 0) return roundCurrency(annual);
  if (annual <= 0) return fromMonthly;
  if (approximatelyEqual(annual, fromMonthly)) return fromMonthly;
  // Independent annual total that already exceeds (or differs from) monthly×12:
  // take the larger figure once — do not add them.
  return roundCurrency(Math.max(annual, fromMonthly));
}

function refreshAnnualized(item: RefreshBudgetInput, now: Date): number {
  if (item.budgetAmountCents == null || item.budgetAmountCents <= 0) return 0;
  const dollars = item.budgetAmountCents / 100;
  const period = (item.budgetPeriod ?? "one_time").toLowerCase();
  if (period.includes("month")) return dollars * 12;
  if (period.includes("year") || period.includes("annual")) return dollars;
  if (
    item.plannedReplacementDate &&
    item.plannedReplacementDate.getTime() <= now.getTime() + 3 * 365.25 * 24 * 60 * 60 * 1000
  ) {
    return dollars;
  }
  return dollars;
}

function sumOneTime(
  phases: PhaseBudgetInput[],
  statuses: RoadmapPhaseStatus[],
): number {
  return roundCurrency(
    phases
      .filter((phase) => statuses.includes(phase.status))
      .reduce((sum, phase) => sum + Math.max(0, phase.oneTimeInvestment), 0),
  );
}

function isRecurringEligible(status: RoadmapPhaseStatus): boolean {
  return !DEFERRED.includes(status) && status !== "cancelled";
}

function resolvePresentationMode(input: {
  hasVerifiedFinancials: boolean;
  hasProposedEstimates: boolean;
}): LifecycleBudgetPresentationMode {
  if (input.hasVerifiedFinancials) return "verified";
  if (input.hasProposedEstimates) return "estimates_only";
  return "empty";
}

export function computeLifecycleBudget(
  phases: PhaseBudgetInput[],
  refreshItems: RefreshBudgetInput[],
  activeMonthlyServices: number,
  now: Date = new Date(),
): LifecycleBudgetPlan {
  const completedInvestment = sumOneTime(phases, COMPLETED);
  const approvedInvestment = sumOneTime(phases, APPROVED_ACTIVE);
  const proposedInvestment = sumOneTime(phases, PROPOSED);
  const plannedInvestment = sumOneTime(phases, PLANNED_LEGACY);
  const deferredInvestment = sumOneTime(phases, DEFERRED);

  const recurringPhases = phases.filter((phase) => isRecurringEligible(phase.status));

  const proposedMonthlyServices = roundCurrency(
    recurringPhases.reduce(
      (sum, phase) => sum + Math.max(0, phase.monthlyRecurringInvestment),
      0,
    ),
  );

  const proposedAnnualFromPhases = roundCurrency(
    recurringPhases.reduce(
      (sum, phase) =>
        sum +
        effectivePhaseAnnualRecurring(
          phase.monthlyRecurringInvestment,
          phase.annualRecurringInvestment,
        ),
      0,
    ),
  );

  const contractedMonthlyServices = roundCurrency(Math.max(0, activeMonthlyServices));
  const contractedAnnualServices = roundCurrency(contractedMonthlyServices * 12);

  // Never sum contracted billing with overlapping roadmap estimates.
  const monthlyServices = roundCurrency(
    Math.max(contractedMonthlyServices, proposedMonthlyServices),
  );
  const annualServices = roundCurrency(
    Math.max(contractedAnnualServices, proposedAnnualFromPhases),
  );

  const futureRefreshBudget = roundCurrency(
    refreshItems.reduce((sum, item) => sum + refreshAnnualized(item, now), 0),
  );

  const estimatedThreeYearInvestment = roundCurrency(
    completedInvestment +
      approvedInvestment +
      proposedInvestment +
      annualServices * 3 +
      futureRefreshBudget,
  );

  const hasVerifiedFinancials =
    completedInvestment > 0 ||
    approvedInvestment > 0 ||
    contractedMonthlyServices > 0 ||
    futureRefreshBudget > 0;

  const hasProposedEstimates =
    proposedInvestment > 0 ||
    proposedMonthlyServices > 0 ||
    proposedAnnualFromPhases > 0 ||
    deferredInvestment > 0;

  return {
    completedInvestment,
    approvedInvestment,
    proposedInvestment,
    plannedInvestment,
    deferredInvestment,
    contractedMonthlyServices,
    contractedAnnualServices,
    proposedMonthlyServices,
    proposedAnnualServices: proposedAnnualFromPhases,
    monthlyServices,
    annualServices,
    futureRefreshBudget,
    estimatedThreeYearInvestment,
    hasVerifiedFinancials,
    hasProposedEstimates,
    presentationMode: resolvePresentationMode({
      hasVerifiedFinancials,
      hasProposedEstimates,
    }),
  };
}
