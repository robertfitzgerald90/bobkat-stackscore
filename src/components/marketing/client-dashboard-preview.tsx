import { HERO_SCREENSHOT_CLASS } from "@/components/assessment-offer/product-screenshot-styles";
import { ClientWorkspaceNavStatic } from "@/components/client-workspace/client-workspace-nav-static";
import { TechnologyProfileDetailView } from "@/components/technology-profile/technology-profile-detail";
import { TpWorkspaceHeader } from "@/components/technology-profile/tp-workspace-header";
import { CLIENT_DASHBOARD_PREVIEW_DETAIL } from "@/lib/marketing/client-dashboard-preview-data";
import { cn } from "@/lib/utils";

type ClientDashboardPreviewProps = {
  className?: string;
};

/**
 * Public marketing preview of the StackScore client dashboard.
 * Uses static demo data only — no auth, database, or navigation.
 */
export function ClientDashboardPreview({ className }: ClientDashboardPreviewProps) {
  const detail = CLIENT_DASHBOARD_PREVIEW_DETAIL;

  return (
    <div
      className={cn(
        "overflow-hidden bg-background text-left",
        HERO_SCREENSHOT_CLASS,
        className,
      )}
      aria-label="StackScore client dashboard preview"
    >
      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4 md:p-5">
        <TpWorkspaceHeader
          clientId={detail.profile.clientId}
          clientName={detail.client.companyName}
          clientStatus={detail.client.status}
          showAssessClient={false}
          completedAssessments={[]}
          draftAssessmentId={null}
          nextRecommendedAssessmentAt={detail.profile.nextRecommendedAssessmentAt}
        />
        <ClientWorkspaceNavStatic role="admin" />
        <TechnologyProfileDetailView detail={detail} preview marketingPreview />
      </div>
    </div>
  );
}
