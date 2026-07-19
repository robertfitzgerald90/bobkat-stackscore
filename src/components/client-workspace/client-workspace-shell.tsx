import { ClientWorkspaceApplicationChrome } from "@/components/client-workspace/client-workspace-application-chrome";
import type { CompletedAssessmentForAuto } from "@/lib/assessments/auto-assessment";
import { CLIENT_WORKSPACE_CONTENT_PADDING_CLASS } from "@/lib/ui/sticky-chrome";
import { cn } from "@/lib/utils";

type ClientWorkspaceShellProps = {
  clientId: string;
  clientName: string;
  clientStatus: string;
  role: string;
  showAssessClient: boolean;
  completedAssessments: CompletedAssessmentForAuto[];
  draftAssessmentId: string | null;
  nextRecommendedAssessmentAt: string | null;
  children: React.ReactNode;
};

export function ClientWorkspaceShell({
  clientId,
  clientName,
  clientStatus,
  role,
  showAssessClient,
  completedAssessments,
  draftAssessmentId,
  nextRecommendedAssessmentAt,
  children,
}: ClientWorkspaceShellProps) {
  const isCustomer = role === "client";

  return (
    <div className="page-content min-w-0">
      {!isCustomer ? (
        <ClientWorkspaceApplicationChrome
          clientId={clientId}
          clientName={clientName}
          clientStatus={clientStatus}
          role={role}
          showAssessClient={showAssessClient}
          completedAssessments={completedAssessments}
          draftAssessmentId={draftAssessmentId}
          nextRecommendedAssessmentAt={nextRecommendedAssessmentAt}
        />
      ) : null}
      <div className={cn(CLIENT_WORKSPACE_CONTENT_PADDING_CLASS, "min-w-0 space-y-6")}>
        {children}
      </div>
    </div>
  );
}
