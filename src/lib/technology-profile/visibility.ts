import type { UserRole } from "@/generated/prisma/client";
import type {
  ProfileBusinessSnapshot,
  ProfileCapabilities,
  ProfileSectionVisibility,
} from "@/lib/technology-profile/types";

export function resolveProfileSectionVisibility(
  role: UserRole,
  capabilities: ProfileCapabilities,
): ProfileSectionVisibility {
  const isClient = role === "client";

  return {
    showAssessmentForms: !isClient,
    showAdminActions: role === "admin",
    showInternalQuickActions: capabilities.canEditImprovementPlan,
    showBusinessSnapshot: true,
    showBusinessSnapshotLimited: isClient,
    showOpenOpportunities: !isClient,
    showRoadmapPreview: !isClient,
    showRecentProgress: !isClient,
    showActiveProjects: !isClient,
    showAssessmentResultsLink: !isClient,
    showRoadmapBuilderLink: capabilities.canEditImprovementPlan,
    showNextActionCta: !isClient,
    showRecommendationCounts: !isClient,
    showJourneyTimeline: !isClient,
    showRecommendationsLink: !isClient,
  };
}

export function trimBusinessSnapshotForClient(
  snapshot: ProfileBusinessSnapshot,
): ProfileBusinessSnapshot {
  return {
    ...snapshot,
    technologyVision: null,
    itSupportModel: null,
    itSupportModelLabel: "—",
    environmentType: null,
    environmentTypeLabel: "—",
    complianceFramework: null,
    complianceFrameworkLabel: "—",
    complianceStatus: null,
    primaryContactTitle: null,
    primaryContactEmail: "",
    primaryContactPhone: null,
  };
}
