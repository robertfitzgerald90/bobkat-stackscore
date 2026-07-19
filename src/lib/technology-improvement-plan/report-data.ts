import type { TipPlanDetail } from "@/lib/technology-improvement-plan/types";
import type { TipReportData } from "@/lib/pdf/types";
import { formatGeneratedDate } from "@/lib/pdf/types";
import {
  buildExecutiveSummaryFallback,
  enrichTipPlanForExecutiveReport,
} from "@/lib/reports/tip-executive-report";
import { getRating, RATING_LABELS } from "@/lib/scoring";

export function buildTipReportData(
  plan: TipPlanDetail,
  includeInternalDetails: boolean,
): TipReportData {
  const generatedDate = plan.generatedAt
    ? formatGeneratedDate(new Date(plan.generatedAt))
    : formatGeneratedDate();

  const recommendationCategories = new Set(
    plan.recommendations.map((rec) => rec.categoryName),
  );

  const categorySummaries =
    plan.profile?.profile.pillarSnapshots?.map((pillar) => ({
      name: pillar.pillarName,
      score: pillar.percentScore !== null ? Math.round(pillar.percentScore) : 0,
      ratingLabel:
        pillar.maturityLevelLabel ??
        (pillar.percentScore !== null
          ? RATING_LABELS[getRating(pillar.percentScore)]
          : "Not assessed"),
      hasRecommendations: recommendationCategories.has(pillar.pillarName),
    })) ??
    plan.profile?.profile.categoryScores.map((category) => ({
      name: category.categoryName,
      score: Math.round(category.percentScore),
      ratingLabel: RATING_LABELS[getRating(category.percentScore)],
      hasRecommendations: recommendationCategories.has(category.categoryName),
    })) ??
    [];

  const investment = plan.investmentInternal;
  const roadmap = plan.technologyRoadmap;
  const projectedScore = roadmap.totals.projectedFinalStackScore || plan.projectedScore;

  const investmentLineItems = [
    {
      category: "One-Time Implementation Investment",
      description:
        "Professional services, equipment, and project delivery across approved roadmap phases",
      amount: roadmap.totals.totalOneTimeInvestment,
    },
    {
      category: "New Monthly Recurring Investment",
      description: "Ongoing managed services and operational support introduced by the roadmap",
      amount: roadmap.totals.totalMonthlyRecurring,
    },
  ].filter((item) => item.amount > 0);

  const businessOutcomes = roadmap.phases
    .flatMap((phase) => phase.businessOutcomes)
    .slice(0, 4)
    .map((outcome) => ({
      title: outcome.title,
      description: outcome.description,
    }));

  const executiveFields = enrichTipPlanForExecutiveReport(plan);
  const executiveSummaryText =
    plan.executiveSummary ??
    plan.wizardState.executiveSummary ??
    plan.wizardState.globalExecutiveNotes ??
    buildExecutiveSummaryFallback(
      plan.clientName,
      plan.currentScore,
      projectedScore,
      plan.profile?.profile.maturityTierLabel ?? null,
    );

  return {
    clientName: plan.clientName,
    title: plan.title,
    version: plan.version,
    generatedDate,
    assessmentName: plan.assessmentName,
    executiveSummary: executiveSummaryText,
    currentScore: plan.currentScore,
    projectedScore,
    scoreImprovement: projectedScore - plan.currentScore,
    maturityTier: plan.profile?.profile.maturityTier ?? null,
    maturityTierLabel: plan.profile?.profile.maturityTierLabel ?? null,
    recommendations: plan.recommendations,
    roadmapPhases: plan.roadmapPhases,
    technologyRoadmap: roadmap,
    clientInvestmentTotal: investment.clientTotal,
    oneTimeInvestmentTotal: roadmap.totals.totalOneTimeInvestment,
    monthlyRecurringTotal: roadmap.totals.totalMonthlyRecurring,
    annualRecurringTotal: roadmap.totals.totalAnnualRecurring,
    investmentLineItems,
    categorySummaries,
    businessOutcomes,
    journeyPhaseLabel: plan.profile?.journey.phaseLabel ?? "Improve",
    journeyProgressPercent: plan.profile?.journey.progressPercent ?? 0,
    includeInternalDetails,
    assessmentDate: executiveFields.assessmentDate,
    overallBusinessRisk: executiveFields.overallBusinessRisk,
    topBusinessRisks: executiveFields.topBusinessRisks,
    topOpportunities: executiveFields.topOpportunities,
    categoryFindings: executiveFields.categoryFindings,
    strategicInitiatives: executiveFields.strategicInitiatives,
    phaseInvestmentRows: executiveFields.phaseInvestmentRows,
    businessValueSnapshot: executiveFields.businessValueSnapshot,
    investmentBreakdown: includeInternalDetails
      ? {
          labor: investment.labor,
          hardware: investment.hardware,
          services: investment.services,
          marginPercent: investment.marginPercent,
          marginAmount: investment.marginAmount,
          clientTotal: investment.clientTotal,
        }
      : undefined,
  };
}
