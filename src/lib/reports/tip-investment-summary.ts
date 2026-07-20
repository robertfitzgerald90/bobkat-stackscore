import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import type { TechnologyRoadmap } from "@/lib/technology-improvement-plan/roadmap-engine";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";
import { isRetainerCoveredService } from "@/lib/reports/tip-presentation";
import { VCIO_MONTHLY_AMOUNT_CENTS } from "@/lib/vcio/constants";
import type { TipInvestmentSummary } from "@/lib/pdf/types";

const STRATEGIC_IT_CONSULTING_LABEL = "Strategic IT Consulting";

export function buildTipInvestmentSummary(
  roadmap: TechnologyRoadmap,
  recommendations: TipRecommendationView[],
): TipInvestmentSummary {
  const recById = new Map(recommendations.map((rec) => [rec.id, rec]));

  let managedServicesMonthly = 0;
  let consultingMonthly = 0;

  for (const phase of roadmap.phases) {
    for (const initiative of phase.initiatives) {
      const rec = recById.get(initiative.recommendationId);
      const monthly = initiative.costProfile.monthlyRecurringInvestment;
      if (monthly <= 0) continue;

      if (rec && isRetainerCoveredService(rec.suggestedService)) {
        consultingMonthly += monthly;
      } else {
        managedServicesMonthly += monthly;
      }
    }
  }

  const consultingIncludedInRoadmap = consultingMonthly > 0;
  const consultingMonthlyAmount =
    consultingIncludedInRoadmap ? consultingMonthly : VCIO_MONTHLY_AMOUNT_CENTS / 100;

  const oneTimeAmount = roadmap.totals.totalOneTimeInvestment;
  const managedMonthlyAmount = managedServicesMonthly;
  const managedAnnualAmount = managedMonthlyAmount * 12;

  const bothRecurringSelected = managedMonthlyAmount > 0 && consultingIncludedInRoadmap;
  const combinedMonthlyTotal = bothRecurringSelected
    ? managedMonthlyAmount + consultingMonthlyAmount
    : null;

  return {
    oneTimeImplementation: {
      amount: oneTimeAmount,
      description:
        oneTimeAmount > 0
          ? "Project labor, deployment costs, hardware, setup fees, and implementation charges across approved roadmap phases."
          : "No one-time project investments are identified in this roadmap.",
    },
    managedTechnologyServices: {
      monthlyAmount: managedMonthlyAmount,
      annualAmount: managedAnnualAmount,
      description:
        managedMonthlyAmount > 0
          ? "Recurring operational services tied to roadmap initiatives such as endpoint management, backup monitoring, security services, managed network services, and monitoring platforms."
          : "No new managed technology services are identified in this roadmap.",
    },
    strategicItConsulting: {
      monthlyAmount: consultingMonthlyAmount,
      includedInRoadmap: consultingIncludedInRoadmap,
      label: STRATEGIC_IT_CONSULTING_LABEL,
      description:
        "Business reviews, roadmap management, progress tracking, budget planning, vendor guidance, StackScore portal access, and reassessment support.",
      optionalNote: consultingIncludedInRoadmap
        ? "Strategic IT Consulting is included in the recurring total shown above."
        : "Strategic IT Consulting is optional and not included in the managed-services recurring total shown above.",
    },
    combinedMonthlyTotal,
    combinedMonthlyLabel: bothRecurringSelected ? "Combined Monthly Investment" : null,
  };
}

export function formatInvestmentSummaryForPdf(summary: TipInvestmentSummary): {
  totalInvestment: string;
  recurringServices: string;
  oneTimeInvestments: string;
  strategicConsulting: string;
  combinedRecurring: string | null;
} {
  const oneTimeInvestments =
    summary.oneTimeImplementation.amount > 0
      ? `${formatCurrency(summary.oneTimeImplementation.amount)} — ${summary.oneTimeImplementation.description}`
      : summary.oneTimeImplementation.description;

  const recurringParts: string[] = [];
  if (summary.managedTechnologyServices.monthlyAmount > 0) {
    recurringParts.push(
      `Managed Technology Services: ${formatCurrency(summary.managedTechnologyServices.monthlyAmount)}/month (${formatCurrency(summary.managedTechnologyServices.annualAmount)}/year). ${summary.managedTechnologyServices.description}`,
    );
  } else {
    recurringParts.push(summary.managedTechnologyServices.description);
  }

  const strategicConsulting = summary.strategicItConsulting.includedInRoadmap
    ? `${summary.strategicItConsulting.label}: ${formatCurrency(summary.strategicItConsulting.monthlyAmount)}/month. ${summary.strategicItConsulting.description} ${summary.strategicItConsulting.optionalNote}`
    : `${summary.strategicItConsulting.label}: ${formatCurrency(summary.strategicItConsulting.monthlyAmount)}/month (optional). ${summary.strategicItConsulting.description} ${summary.strategicItConsulting.optionalNote}`;

  recurringParts.push(strategicConsulting);

  const totalParts: string[] = [];
  if (summary.oneTimeImplementation.amount > 0) {
    totalParts.push(formatCurrency(summary.oneTimeImplementation.amount));
  }
  if (summary.managedTechnologyServices.monthlyAmount > 0) {
    totalParts.push(`${formatCurrency(summary.managedTechnologyServices.monthlyAmount)}/month managed services`);
  }
  if (summary.strategicItConsulting.includedInRoadmap) {
    totalParts.push(`${formatCurrency(summary.strategicItConsulting.monthlyAmount)}/month consulting`);
  }

  return {
    totalInvestment: totalParts.length > 0 ? totalParts.join(" · ") : "Scoped during engagement",
    recurringServices: recurringParts.join("\n\n"),
    oneTimeInvestments,
    strategicConsulting,
    combinedRecurring:
      summary.combinedMonthlyTotal !== null && summary.combinedMonthlyLabel
        ? `${summary.combinedMonthlyLabel}: ${formatCurrency(summary.combinedMonthlyTotal)}/month (${formatCurrency(summary.combinedMonthlyTotal * 12)}/year)`
        : null,
  };
}
