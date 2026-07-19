import type { SalesFunnelStage, SalesFunnelStageKey } from "./types";

export const SALES_FUNNEL_STAGE_LABELS: Record<SalesFunnelStageKey, string> = {
  marketing_lead: "Marketing Lead",
  assessment_purchased: "Assessment Purchased",
  assessment_completed: "Assessment Completed",
  roadmap_delivered: "Roadmap Delivered",
  proposal_generated: "Proposal Generated",
  proposal_approved: "Proposal Approved",
  implementation_started: "Implementation Started",
  implementation_completed: "Implementation Completed",
  managed_services_active: "Managed Services Active",
  strategic_consulting_active: "Strategic Consulting Active",
};

export type FunnelCounts = Record<SalesFunnelStageKey, number>;

export function buildSalesFunnel(counts: FunnelCounts): SalesFunnelStage[] {
  const order = Object.keys(SALES_FUNNEL_STAGE_LABELS) as SalesFunnelStageKey[];
  return order.map((key, index) => {
    const count = counts[key] ?? 0;
    const previousKey = index > 0 ? order[index - 1] : null;
    const previousCount = previousKey ? counts[previousKey] ?? 0 : null;
    const conversionFromPreviousPercent =
      previousCount && previousCount > 0
        ? Math.round((count / previousCount) * 1000) / 10
        : null;

    return {
      key,
      label: SALES_FUNNEL_STAGE_LABELS[key],
      count,
      conversionFromPreviousPercent,
    };
  });
}

/** Weight pending proposal dollars by lifecycle stage for forecasting. */
export function proposalStageWeight(status: string): number {
  switch (status) {
    case "approved":
      return 1;
    case "viewed":
      return 0.65;
    case "sent":
      return 0.45;
    case "internal_review":
      return 0.25;
    case "draft":
      return 0.15;
    default:
      return 0;
  }
}
