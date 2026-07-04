"use client";

import { TpHeroSummary } from "@/components/technology-profile/tp-hero-summary";
import { TpWorkspaceSnapshot } from "@/components/technology-profile/tp-workspace-snapshot";
import { ImmediateFocusAnchor } from "@/components/technology-profile/immediate-focus-anchor";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";

type TechnologyProfileDetailViewProps = {
  detail: TechnologyProfileDetail;
};

/**
 * Client Workspace Overview (DOC-161 / DEV-002 Phase 1 Commit 3).
 * Health KPIs, Immediate Focus, and maturity context only.
 * Supporting modules are reached via workspace navigation.
 */
export function TechnologyProfileDetailView({ detail }: TechnologyProfileDetailViewProps) {
  const { profile, journey } = detail;

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <ImmediateFocusAnchor />
      <TpWorkspaceSnapshot
        clientId={profile.clientId}
        workspace={detail.workspace}
        nextAction={detail.nextAction}
        assessmentsCompleted={journey.assessmentsCompleted}
      />
      <TpHeroSummary detail={detail} />
    </div>
  );
}
