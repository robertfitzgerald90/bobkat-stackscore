"use client";

import { TpHeroSummary } from "@/components/technology-profile/tp-hero-summary";
import { TpWorkspaceSnapshot } from "@/components/technology-profile/tp-workspace-snapshot";
import { ImmediateFocusAnchor } from "@/components/technology-profile/immediate-focus-anchor";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";
import { cn } from "@/lib/utils";

type TechnologyProfileDetailViewProps = {
  detail: TechnologyProfileDetail;
  preview?: boolean;
  marketingPreview?: boolean;
};

/**
 * Client Workspace Overview (DOC-161 / DEV-002 Phase 1 Commit 3).
 * Health KPIs, Immediate Focus, and maturity context only.
 * Supporting modules are reached via workspace navigation.
 */
export function TechnologyProfileDetailView({
  detail,
  preview = false,
  marketingPreview = false,
}: TechnologyProfileDetailViewProps) {
  const { profile, journey } = detail;

  return (
    <div
      className={cn(
        "min-w-0",
        marketingPreview ? "space-y-4 sm:space-y-5" : "space-y-6 sm:space-y-8",
      )}
    >
      {!preview ? <ImmediateFocusAnchor /> : null}
      <TpWorkspaceSnapshot
        clientId={profile.clientId}
        workspace={detail.workspace}
        nextAction={detail.nextAction}
        assessmentsCompleted={journey.assessmentsCompleted}
        preview={preview}
        marketingPreview={marketingPreview}
      />
      <TpHeroSummary detail={detail} marketingPreview={marketingPreview} />
    </div>
  );
}
