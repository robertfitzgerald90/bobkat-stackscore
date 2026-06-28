import Link from "next/link";
import { Building2, History, TrendingUp } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import type { ProfileSectionVisibility } from "@/lib/technology-profile/types";

type TpQuickActionsProps = {
  clientId: string;
  sections: ProfileSectionVisibility;
};

export function TpQuickActions({ clientId, sections }: TpQuickActionsProps) {
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
        <Link
          href={`/clients/${clientId}/assessments/history`}
          className={buttonClassName({ variant: "outline", size: "sm", className: "w-full sm:w-auto" })}
        >
          <History className="mr-2 h-4 w-4" />
          Assessment History
        </Link>
      ) : null}
    </div>
  );
}
