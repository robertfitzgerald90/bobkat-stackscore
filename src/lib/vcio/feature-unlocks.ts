import { NextResponse } from "next/server";
import {
  canUseOngoingVcioFeatures,
  formatVcioAccessState,
  getClientVcioEntitlement,
  type VcioEntitlement,
} from "@/lib/vcio/entitlements";

export type VcioFeatureKey =
  | "quarterly_business_reviews"
  | "executive_notes"
  | "technology_budget_planning"
  | "strategy_sessions"
  | "roadmap_collaboration"
  | "technology_timeline"
  | "annual_assessment_reminder"
  | "vendor_planning"
  | "technology_lifecycle";

export type VcioFeatureAccess = {
  entitlement: VcioEntitlement;
  canEdit: boolean;
  isReadOnly: boolean;
  reason: string | null;
};

export const VCIO_FEATURE_LABELS: Record<VcioFeatureKey, string> = {
  quarterly_business_reviews: "Business Reviews",
  executive_notes: "Executive Notes",
  technology_budget_planning: "Technology Budget Planning",
  strategy_sessions: "Strategy Sessions",
  roadmap_collaboration: "Roadmap Collaboration",
  technology_timeline: "Technology Timeline",
  annual_assessment_reminder: "Annual Assessment Reminder",
  vendor_planning: "Vendor Planning",
  technology_lifecycle: "Technology Lifecycle",
};

export async function getVcioFeatureAccess(
  clientId: string,
  feature: VcioFeatureKey,
): Promise<VcioFeatureAccess> {
  const entitlement = await getClientVcioEntitlement(clientId);
  const canEdit = canUseOngoingVcioFeatures(entitlement.accessState);

  return {
    entitlement,
    canEdit,
    isReadOnly: entitlement.hasSubscription && !canEdit,
    reason: canEdit
      ? null
      : entitlement.hasSubscription
        ? `StackScore vCIO is ${formatVcioAccessState(entitlement.accessState).toLowerCase()}. Existing records remain available, but new vCIO planning changes are disabled.`
        : `StackScore vCIO is required to use ${VCIO_FEATURE_LABELS[feature]}.`,
  };
}

export async function requireVcioFeatureWriteAccess(clientId: string, feature: VcioFeatureKey) {
  const access = await getVcioFeatureAccess(clientId, feature);
  if (access.canEdit) return null;
  return NextResponse.json(
    {
      error: access.reason ?? `${VCIO_FEATURE_LABELS[feature]} requires active StackScore vCIO.`,
      code: "VCIO_FEATURE_READ_ONLY",
    },
    { status: 403 },
  );
}
