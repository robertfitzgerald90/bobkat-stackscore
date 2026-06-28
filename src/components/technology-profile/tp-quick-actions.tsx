import Link from "next/link";
import { ArrowLeftRight, Building2, CalendarRange, History, TrendingUp } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import type { ProfileSectionVisibility } from "@/lib/technology-profile/types";

type TpQuickActionsProps = {
  clientId: string;
  sections: ProfileSectionVisibility;
  showCompareAssessments?: boolean;
};

export function TpQuickActions({
  clientId,
  sections,
  showCompareAssessments = false,
}: TpQuickActionsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
      <Link
        href={`/clients/${clientId}/business-profile`}
        className={buttonClassName({ variant: "outline", size: "sm", className: "w-full sm:w-auto" })}
      >
        <Building2 className="mr-2 h-4 w-4" />
        Business Profile
      </Link>
      {sections.showInternalQuickActions ? (
        <>
          <Link
            href={`/clients/${clientId}/quarterly-review`}
            className={buttonClassName({ variant: "outline", size: "sm", className: "w-full sm:w-auto" })}
          >
            <CalendarRange className="mr-2 h-4 w-4" />
            Quarterly Review
          </Link>
          <Link
            href={`/clients/${clientId}/improvement-plan`}
            className={buttonClassName({ variant: "default", size: "sm", className: "w-full sm:w-auto" })}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Improvement Plan
          </Link>
          <Link
            href={`/clients/${clientId}/improvement`}
            className={buttonClassName({ variant: "outline", size: "sm", className: "w-full sm:w-auto" })}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Improvement Dashboard
          </Link>
        </>
      ) : null}
      {sections.showAssessmentResultsLink ? (
        <>
          {showCompareAssessments ? (
            <Link
              href={`/clients/${clientId}/assessments/compare`}
              className={buttonClassName({
                variant: "outline",
                size: "sm",
                className: "w-full sm:w-auto",
              })}
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Compare Assessments
            </Link>
          ) : null}
          <Link
            href={`/clients/${clientId}/assessments/history`}
            className={buttonClassName({ variant: "outline", size: "sm", className: "w-full sm:w-auto" })}
          >
            <History className="mr-2 h-4 w-4" />
            Assessment History
          </Link>
        </>
      ) : null}
    </div>
  );
}
