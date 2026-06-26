import type { TipPlanDetail } from "@/lib/technology-improvement-plan/types";
import type { TipReportData } from "@/lib/pdf/types";
import { formatGeneratedDate } from "@/lib/pdf/types";

export function buildTipReportData(
  plan: TipPlanDetail,
  includeInternalDetails: boolean,
): TipReportData {
  const generatedDate = plan.generatedAt
    ? formatGeneratedDate(new Date(plan.generatedAt))
    : formatGeneratedDate();

  return {
    clientName: plan.clientName,
    title: plan.title,
    version: plan.version,
    generatedDate,
    assessmentName: plan.assessmentName,
    executiveSummary:
      plan.executiveSummary ??
      plan.wizardState.executiveSummary ??
      plan.wizardState.globalExecutiveNotes ??
      "",
    currentScore: plan.currentScore,
    projectedScore: plan.projectedScore,
    maturityTier: plan.profile?.profile.maturityTier ?? null,
    recommendations: plan.recommendations,
    roadmapPhases: plan.roadmapPhases,
    clientInvestmentTotal: plan.investmentInternal.clientTotal,
    journeyPhaseLabel: plan.profile?.journey.phaseLabel ?? "Improve",
    journeyProgressPercent: plan.profile?.journey.progressPercent ?? 0,
    includeInternalDetails,
    investmentBreakdown: includeInternalDetails
      ? {
          labor: plan.investmentInternal.labor,
          hardware: plan.investmentInternal.hardware,
          services: plan.investmentInternal.services,
          marginPercent: plan.investmentInternal.marginPercent,
          clientTotal: plan.investmentInternal.clientTotal,
        }
      : undefined,
  };
}
