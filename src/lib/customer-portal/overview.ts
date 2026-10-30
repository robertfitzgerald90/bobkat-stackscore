/**
 * SS-UX-004 — Customer Overview service (authorized data assembly).
 * SS-UX-010 — Roadmap Progress uses initiative completion only (no journey substitute).
 */

import type { UserRole } from "@/generated/prisma/client";
import { getClientRoadmapDashboard } from "@/lib/client-roadmap";
import {
  buildCustomerOverviewFromDetail,
  resolveOverviewRoadmapProgress,
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

  const hasRoadmap = Boolean(roadmap);
  const roadmapPhaseLabel = hasRoadmap
    ? roadmap!.phases.find((p) => p.status === "in_progress" || p.status === "approved")?.name ??
      roadmap!.phases[0]?.name ??
      null
    : null;

  const resolved = resolveOverviewRoadmapProgress({
    hasRoadmap,
    initiativesTotal: roadmap?.metrics.initiativesTotal ?? 0,
    completionPercent: roadmap?.metrics.completionPercent ?? 0,
    phaseLabel: roadmapPhaseLabel,
    journeyProgressPercent: detail.journey.progressPercent,
    journeyPhaseLabel: detail.journey.phaseLabel,
  });

  return buildCustomerOverviewFromDetail({
    detail,
    companyName,
    hasRoadmap,
    hasRoadmapInitiatives: resolved.hasInitiatives,
    roadmapProgressPercent: resolved.progressPercent,
    roadmapEmptyStateLabel: resolved.emptyStateLabel,
    roadmapPhaseLabel: resolved.phaseLabel,
    journeyProgressPercent: resolved.journeyProgressPercent,
    journeyPhaseLabel: resolved.journeyPhaseLabel,
    vcioAccessState: entitlement.accessState,
  });
}
