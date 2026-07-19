import { computeInvestmentView } from "../pricing";
import type { TipInvestmentDraft, TipRecommendationView } from "../types";
import { resolveServicePricingRule } from "./service-pricing-catalog";
import type { RecommendationCostProfile } from "./types";

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function applyMarginShare(amount: number, marginPercent: number): number {
  return roundCurrency(amount * (1 + marginPercent / 100));
}

export function resolveRecommendationCostProfiles(
  recommendations: TipRecommendationView[],
  investmentDraft: TipInvestmentDraft,
): RecommendationCostProfile[] {
  if (recommendations.length === 0) return [];

  const planView = computeInvestmentView(investmentDraft);
  const impactTotal = recommendations.reduce(
    (sum, rec) => sum + rec.estimatedImpactPoints,
    0,
  );
  const safeImpactTotal = impactTotal > 0 ? impactTotal : recommendations.length;

  const profiles = recommendations.map((rec) => {
    const weight = rec.estimatedImpactPoints / safeImpactTotal;
    const serviceRule = resolveServicePricingRule(rec.suggestedService);
    const allocatedLabor = planView.labor * weight;
    const allocatedHardware = planView.hardware * weight;
    const allocatedServices = planView.services * weight;
    const implementationSubtotal = allocatedLabor + allocatedHardware;
    const recurringSubtotal = allocatedServices;
    const totalSubtotal = implementationSubtotal + recurringSubtotal;
    const grossAmount = applyMarginShare(totalSubtotal, planView.marginPercent);

    if (serviceRule.costType === "one_time") {
      return {
        recommendationId: rec.id,
        costType: serviceRule.costType,
        oneTimeInvestment: grossAmount,
        monthlyRecurringInvestment: 0,
        annualRecurringInvestment: 0,
      };
    }

    if (serviceRule.costType === "recurring") {
      return {
        recommendationId: rec.id,
        costType: serviceRule.costType,
        oneTimeInvestment: 0,
        monthlyRecurringInvestment: grossAmount,
        annualRecurringInvestment: roundCurrency(grossAmount * 12),
      };
    }

    const defaultRecurringShare =
      totalSubtotal > 0 ? recurringSubtotal / totalSubtotal : 0.4;
    const recurringShare = serviceRule.recurringShare ?? defaultRecurringShare;
    const recurringAmount = roundCurrency(grossAmount * recurringShare);
    const oneTimeAmount = roundCurrency(grossAmount - recurringAmount);

    return {
      recommendationId: rec.id,
      costType: serviceRule.costType,
      oneTimeInvestment: oneTimeAmount,
      monthlyRecurringInvestment: recurringAmount,
      annualRecurringInvestment: roundCurrency(recurringAmount * 12),
    };
  });

  return normalizeCostProfiles(profiles, planView);
}

function normalizeCostProfiles(
  profiles: RecommendationCostProfile[],
  planView: ReturnType<typeof computeInvestmentView>,
): RecommendationCostProfile[] {
  if (profiles.length === 0) return profiles;

  const allOneTime = profiles.every((profile) => profile.costType === "one_time");
  const allRecurring = profiles.every((profile) => profile.costType === "recurring");

  const targetOneTime = allRecurring
    ? 0
    : allOneTime
      ? planView.clientTotal
      : roundCurrency(applyMarginShare(planView.labor + planView.hardware, planView.marginPercent));
  const targetMonthly = allOneTime
    ? 0
    : allRecurring
      ? planView.clientTotal
      : roundCurrency(applyMarginShare(planView.services, planView.marginPercent));

  const oneTimeProfiles = profiles.filter((profile) => profile.costType !== "recurring");
  const recurringProfiles = profiles.filter((profile) => profile.costType !== "one_time");

  const currentOneTime = roundCurrency(
    oneTimeProfiles.reduce((sum, profile) => sum + profile.oneTimeInvestment, 0),
  );
  const currentMonthly = roundCurrency(
    recurringProfiles.reduce((sum, profile) => sum + profile.monthlyRecurringInvestment, 0),
  );

  const oneTimeScale = currentOneTime > 0 ? targetOneTime / currentOneTime : 1;
  const monthlyScale = currentMonthly > 0 ? targetMonthly / currentMonthly : 1;

  const normalized = profiles.map((profile) => {
    if (profile.costType === "one_time") {
      const oneTimeInvestment = roundCurrency(profile.oneTimeInvestment * oneTimeScale);
      return {
        ...profile,
        oneTimeInvestment,
        monthlyRecurringInvestment: 0,
        annualRecurringInvestment: 0,
      };
    }

    if (profile.costType === "recurring") {
      const monthlyRecurringInvestment = roundCurrency(
        profile.monthlyRecurringInvestment * monthlyScale,
      );
      return {
        ...profile,
        oneTimeInvestment: 0,
        monthlyRecurringInvestment,
        annualRecurringInvestment: roundCurrency(monthlyRecurringInvestment * 12),
      };
    }

    const oneTimeInvestment = roundCurrency(profile.oneTimeInvestment * oneTimeScale);
    const monthlyRecurringInvestment = roundCurrency(
      profile.monthlyRecurringInvestment * monthlyScale,
    );

    return {
      ...profile,
      oneTimeInvestment,
      monthlyRecurringInvestment,
      annualRecurringInvestment: roundCurrency(monthlyRecurringInvestment * 12),
    };
  });

  return rebalanceRoundingDrift(normalized, targetOneTime, targetMonthly);
}

function rebalanceRoundingDrift(
  profiles: RecommendationCostProfile[],
  targetOneTime: number,
  targetMonthly: number,
): RecommendationCostProfile[] {
  if (profiles.length === 0) return profiles;

  const result = [...profiles];

  const oneTimeProfiles = result.filter((profile) => profile.costType !== "recurring");
  const recurringProfiles = result.filter((profile) => profile.costType !== "one_time");

  if (oneTimeProfiles.length > 0) {
    const oneTimeTotal = roundCurrency(
      oneTimeProfiles.reduce((sum, profile) => sum + profile.oneTimeInvestment, 0),
    );
    const lastOneTime = oneTimeProfiles[oneTimeProfiles.length - 1];
    lastOneTime.oneTimeInvestment = roundCurrency(
      lastOneTime.oneTimeInvestment + (targetOneTime - oneTimeTotal),
    );
  }

  if (recurringProfiles.length > 0) {
    const monthlyTotal = roundCurrency(
      recurringProfiles.reduce((sum, profile) => sum + profile.monthlyRecurringInvestment, 0),
    );
    const lastRecurring = recurringProfiles[recurringProfiles.length - 1];
    lastRecurring.monthlyRecurringInvestment = roundCurrency(
      lastRecurring.monthlyRecurringInvestment + (targetMonthly - monthlyTotal),
    );
    lastRecurring.annualRecurringInvestment = roundCurrency(
      lastRecurring.monthlyRecurringInvestment * 12,
    );
  }

  return result;
}

export function sumCostProfiles(profiles: RecommendationCostProfile[]) {
  return profiles.reduce(
    (totals, profile) => ({
      oneTimeInvestment: roundCurrency(totals.oneTimeInvestment + profile.oneTimeInvestment),
      monthlyRecurringInvestment: roundCurrency(
        totals.monthlyRecurringInvestment + profile.monthlyRecurringInvestment,
      ),
      annualRecurringInvestment: roundCurrency(
        totals.annualRecurringInvestment + profile.annualRecurringInvestment,
      ),
    }),
    {
      oneTimeInvestment: 0,
      monthlyRecurringInvestment: 0,
      annualRecurringInvestment: 0,
    },
  );
}
