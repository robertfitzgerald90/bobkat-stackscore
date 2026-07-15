import { HERO_SCREENSHOT_CLASS } from "@/components/assessment-offer/product-screenshot-styles";
import { TpHeroSummary } from "@/components/technology-profile/tp-hero-summary";
import { TpWorkspaceSnapshot } from "@/components/technology-profile/tp-workspace-snapshot";
import { Badge } from "@/components/ui/badge";
import type { AssessmentExecutiveOverviewData } from "@/lib/demo-data/assessment-executive-overview";
import { toExecutiveOverviewProfileDetail } from "@/lib/demo-data/assessment-executive-overview";
import { formatClientStatus } from "@/lib/display";
import { cn } from "@/lib/utils";

type AssessmentExecutiveOverviewPreviewProps = {
  data: AssessmentExecutiveOverviewData;
  className?: string;
};

/**
 * Focused executive overview for marketing pages.
 * Composes real dashboard presentation components with static demo data only.
 */
export function AssessmentExecutiveOverviewPreview({
  data,
  className,
}: AssessmentExecutiveOverviewPreviewProps) {
  const profileDetail = toExecutiveOverviewProfileDetail(data);

  return (
    <div className={cn("w-full text-left", className)}>
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Executive Dashboard Preview
      </p>

      <div
        className={cn("overflow-hidden bg-background", HERO_SCREENSHOT_CLASS)}
        aria-label="StackScore executive dashboard preview"
      >
        <div className="space-y-3 p-3 sm:space-y-4 sm:p-4 md:p-5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {data.organizationName}
            </h2>
            <Badge variant="outline">{formatClientStatus(data.status)}</Badge>
          </div>

          <TpWorkspaceSnapshot
            clientId={profileDetail.profile.clientId}
            workspace={profileDetail.workspace}
            nextAction={profileDetail.nextAction}
            assessmentsCompleted={data.assessmentsCompleted}
            preview
            marketingPreview
          />

          <TpHeroSummary detail={profileDetail} marketingPreview />
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Your technology maturity, business risks, active initiatives, and executive priorities—all
        in one dashboard.
      </p>
    </div>
  );
}
