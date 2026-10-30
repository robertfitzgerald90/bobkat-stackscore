/**
 * SS-UX-004 — Customer Overview service (authorized data assembly).
 */

import type { UserRole } from "@/generated/prisma/client";
import { getClientRoadmapDashboard } from "@/lib/client-roadmap";
import {
  buildCustomerOverviewFromDetail,
  type CustomerOverviewDto,
} from "@/lib/customer-portal/overview-dto";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";
import { getClientVcioEntitlement } from "@/lib/vcio/entitlements";

export * from "@/lib/customer-portal/overview-dto";

/**
 * Build the customer Overview DTO from authorized services.
 * Intended for role=client pages (staff may call for preview parity).
 */
export async function getCustomerOverview(
  clientId: string,
  role: UserRole,
  companyName: string,
): Promise<CustomerOverviewDto | null> {
  const detail = await getTechnologyProfileDetail(clientId, role);
  if (!detail) return null;

  const [roadmap, entitlement] = await Promise.all([
    getClientRoadmapDashboard(clientId, role),
    getClientVcioEntitlement(clientId),
  ]);

  /**
   * SS-UX-005 roadmap progress investigation:
   * - Journey `progressPercent` (~33% after one completed assessment) is a 3-milestone heuristic.
   * - Roadmap `metrics.completionPercent` is initiativesCompleted/initiativesTotal (0 when total=0).
   * Defect: preferring an empty roadmap (0 initiatives → 0%) hid meaningful journey progress.
   * Fix: use roadmap completion only when initiativesTotal > 0; otherwise fall back to journey.
   * Does not change roadmap completion math or stored data.
   */
  const hasRoadmapMetrics =
    Boolean(roadmap) && (roadmap!.metrics.initiativesTotal ?? 0) > 0;
  const hasRoadmap = Boolean(roadmap);
  const roadmapProgressPercent = hasRoadmapMetrics
    ? roadmap!.metrics.completionPercent
    : detail.journey.progressPercent;
  const roadmapPhaseLabel = hasRoadmapMetrics
    ? roadmap!.phases.find((p) => p.status === "in_progress" || p.status === "approved")?.name ??
      roadmap!.phases[0]?.name ??
      detail.journey.phaseLabel
    : detail.journey.phaseLabel;

  return buildCustomerOverviewFromDetail({
    detail,
    companyName,
    hasRoadmap,
    roadmapProgressPercent,
    roadmapPhaseLabel,
    vcioAccessState: entitlement.accessState,
  });
}
