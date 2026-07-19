import { TpWorkspaceHeader } from "@/components/technology-profile/tp-workspace-header";
import { ClientWorkspaceNav } from "@/components/client-workspace/client-workspace-nav";
import type { CompletedAssessmentForAuto } from "@/lib/assessments/auto-assessment";
import { STICKY_IN_SCROLLPORT_CLASS } from "@/lib/ui/sticky-chrome";

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
    <div className="page-content min-w-0 space-y-6">
      {!isCustomer ? (
        <>
          <TpWorkspaceHeader
            clientId={clientId}
            clientName={clientName}
            clientStatus={clientStatus}
            showAssessClient={showAssessClient}
            completedAssessments={completedAssessments}
            draftAssessmentId={draftAssessmentId}
            nextRecommendedAssessmentAt={nextRecommendedAssessmentAt}
          />
          <div className={STICKY_IN_SCROLLPORT_CLASS}>
            <ClientWorkspaceNav clientId={clientId} role={role} />
          </div>
        </>
      ) : null}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
