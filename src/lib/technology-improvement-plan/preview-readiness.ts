import type { TipPlanDetail } from "@/lib/technology-improvement-plan/types";

export type TipReadinessItem = {
  id: string;
  label: string;
  ready: boolean;
  detail: string;
};

export function resolveExecutiveSummaryText(
  plan: TipPlanDetail,
  executiveSummary: string,
): string {
  return (
    executiveSummary.trim() ||
    plan.wizardState.executiveSummary.trim() ||
    plan.wizardState.globalExecutiveNotes.trim() ||
    plan.executiveSummary?.trim() ||
    ""
  );
}

export function evaluateTipReportReadiness(
  plan: TipPlanDetail,
  executiveSummary: string,
): TipReadinessItem[] {
  const summaryText = resolveExecutiveSummaryText(plan, executiveSummary);
  const roadmapAssignedCount = plan.roadmapPhases.reduce(
    (total, phase) => total + phase.recommendations.length,
    0,
  );

  return [
    {
      id: "executive-summary",
      label: "Executive Summary",
      ready: summaryText.length > 0,
      detail: summaryText
        ? "Executive narrative is in place"
        : "Add summary text before generating",
    },
    {
      id: "recommendations",
      label: "Recommendations",
      ready: plan.selectionSummary.includedCount > 0,
      detail:
        plan.selectionSummary.includedCount > 0
          ? `${plan.selectionSummary.includedCount} initiative${plan.selectionSummary.includedCount === 1 ? "" : "s"} included`
          : "Include at least one recommendation",
    },
    {
      id: "investment",
      label: "Investment Summary",
      ready: plan.selectionSummary.clientInvestmentTotal > 0,
      detail:
        plan.selectionSummary.clientInvestmentTotal > 0
          ? "Client investment totals are configured"
          : "Investment amounts must be greater than zero",
    },
    {
      id: "roadmap",
      label: "Implementation Roadmap",
      ready: plan.roadmapPhases.length > 0 && roadmapAssignedCount > 0,
      detail:
        plan.roadmapPhases.length > 0 && roadmapAssignedCount > 0
          ? `${plan.roadmapPhases.length} phase${plan.roadmapPhases.length === 1 ? "" : "s"} with assigned initiatives`
          : "Define roadmap phases with initiatives",
    },
    {
      id: "playbooks",
      label: "Solution Playbooks",
      ready: plan.playbooks.length > 0,
      detail:
        plan.playbooks.length > 0
          ? `${plan.playbooks.length} playbook${plan.playbooks.length === 1 ? "" : "s"} linked`
          : "Playbooks are recommended for delivery clarity",
    },
    {
      id: "profile",
      label: "Technology Maturity Profile",
      ready: plan.profile !== null,
      detail: plan.profile
        ? "Baseline maturity profile is attached"
        : "Profile context is missing from this plan",
    },
  ];
}

export function isTipReportReadyForGeneration(items: TipReadinessItem[]): boolean {
  const requiredIds = new Set(["executive-summary", "recommendations", "investment", "roadmap"]);
  return items.filter((item) => requiredIds.has(item.id)).every((item) => item.ready);
}

export function countReadyReadinessItems(items: TipReadinessItem[]): number {
  return items.filter((item) => item.ready).length;
}
